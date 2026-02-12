import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateImage, getImageDimensions } from "@/lib/ai/image-generator";
import { saveFile } from "@/lib/storage";

/**
 * POST /api/projects/[id]/generate-images — Batch generate images for all scenes.
 * Processes scenes sequentially with a 2-second delay between each.
 * Optionally accepts { sceneIds: string[] } to filter which scenes to process.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch project with scenes, verify ownership
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        imageStyle: true,
        aspectRatio: true,
        scenes: {
          orderBy: { order: "asc" },
          select: { id: true, order: true, visualPrompt: true, imageUrl: true },
        },
      },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.scenes.length === 0) {
      return NextResponse.json(
        { error: "No scenes to generate images for" },
        { status: 400 }
      );
    }

    // Parse optional body for selective scene generation
    let sceneIds: string[] | null = null;
    try {
      const body = await req.json();
      if (body.sceneIds && Array.isArray(body.sceneIds)) {
        sceneIds = body.sceneIds;
      }
    } catch {
      // No body or invalid JSON — generate for all scenes
    }

    const scenesToProcess = sceneIds
      ? project.scenes.filter((s) => sceneIds!.includes(s.id))
      : project.scenes;

    const { width, height } = getImageDimensions(project.aspectRatio);
    const results: {
      sceneId: string;
      success: boolean;
      imageUrl?: string;
      error?: string;
    }[] = [];

    for (let i = 0; i < scenesToProcess.length; i++) {
      const scene = scenesToProcess[i];

      try {
        // Build enhanced prompt with image style
        const enhancedPrompt = `${project.imageStyle} style, ${scene.visualPrompt}`;

        // Generate image (downloads from Pollinations.ai)
        const imageBuffer = await generateImage({
          prompt: enhancedPrompt,
          width,
          height,
        });

        // Save to local disk
        const imageUrl = await saveFile(imageBuffer, "image.png", "images");

        // Update scene in database
        await prisma.scene.update({
          where: { id: scene.id },
          data: { imageUrl },
        });

        results.push({ sceneId: scene.id, success: true, imageUrl });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `Image generation failed for scene ${scene.id}:`,
          message
        );
        results.push({ sceneId: scene.id, success: false, error: message });
      }

      // Rate limit safety delay (skip after last scene)
      if (i < scenesToProcess.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Re-fetch all scenes with updated imageUrls
    const updatedScenes = await prisma.scene.findMany({
      where: { projectId: id },
      orderBy: { order: "asc" },
    });

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      scenes: updatedScenes,
      results: {
        total: scenesToProcess.length,
        success: successCount,
        failed: failedCount,
        details: results,
      },
    });
  } catch (error) {
    console.error("POST /api/projects/[id]/generate-images error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate images";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
