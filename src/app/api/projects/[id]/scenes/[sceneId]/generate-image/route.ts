import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateImage, getImageDimensions } from "@/lib/ai/image-generator";
import { saveFile } from "@/lib/storage";

/**
 * POST /api/projects/[id]/scenes/[sceneId]/generate-image
 * Regenerate image for a single scene.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, sceneId } = await params;

    // Verify ownership chain: scene → project → user
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: {
        project: {
          select: {
            userId: true,
            id: true,
            imageStyle: true,
            aspectRatio: true,
          },
        },
      },
    });

    if (
      !scene ||
      scene.project.id !== id ||
      scene.project.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    const { width, height } = getImageDimensions(scene.project.aspectRatio);
    const enhancedPrompt = `${scene.project.imageStyle} style, ${scene.visualPrompt}`;

    // Generate image (downloads from Pollinations.ai)
    const imageBuffer = await generateImage({
      prompt: enhancedPrompt,
      width,
      height,
    });

    // Save to local disk
    const imageUrl = await saveFile(imageBuffer, "image.png", "images");

    // Update scene in database
    const updatedScene = await prisma.scene.update({
      where: { id: sceneId },
      data: { imageUrl },
    });

    return NextResponse.json({ scene: updatedScene });
  } catch (error) {
    console.error("POST generate-image error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
