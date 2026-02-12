import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateStory } from "@/lib/ai/story-generator";

/**
 * POST /api/projects/[id]/generate — Trigger AI story generation.
 * Calls Gemini to generate scenes from the project prompt,
 * replaces existing scenes, and updates project status.
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

    // Fetch project and verify ownership
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        prompt: true,
        genre: true,
        tone: true,
        targetLength: true,
        targetAudience: true,
        language: true,
        imageStyle: true,
      },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Call AI story generator
    const story = await generateStory({
      prompt: project.prompt,
      genre: project.genre || undefined,
      tone: project.tone || undefined,
      targetLength: project.targetLength || 60,
      targetAudience: project.targetAudience || undefined,
      language: project.language || "en",
      imageStyle: project.imageStyle || "photorealistic",
    });

    // Delete existing scenes
    await prisma.scene.deleteMany({ where: { projectId: id } });

    // Create new scenes
    await prisma.scene.createMany({
      data: story.scenes.map((scene) => ({
        projectId: id,
        order: scene.order,
        narrationText: scene.narrationText,
        visualPrompt: scene.visualPrompt,
        cameraDirection: scene.cameraDirection || null,
        mood: scene.mood || null,
        duration: scene.duration || null,
      })),
    });

    // Update project status to in-progress
    await prisma.project.update({
      where: { id },
      data: { status: "in-progress" },
    });

    // Re-fetch created scenes (MongoDB createMany doesn't return records)
    const scenes = await prisma.scene.findMany({
      where: { projectId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ scenes });
  } catch (error) {
    console.error("POST /api/projects/[id]/generate error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate story";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
