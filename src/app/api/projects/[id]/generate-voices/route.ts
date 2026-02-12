import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateVoice } from "@/lib/ai/voice-generator";
import { saveAudio } from "@/lib/storage";

/**
 * POST /api/projects/[id]/generate-voices — Batch generate audio for all scenes.
 * Processes scenes sequentially with a 1-second delay between each.
 * Optionally accepts { voiceId, speed, pitch, sceneIds } in the body.
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

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        scenes: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            narrationText: true,
            audioUrl: true,
            voiceId: true,
            voiceSpeed: true,
            voicePitch: true,
          },
        },
      },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.scenes.length === 0) {
      return NextResponse.json(
        { error: "No scenes to generate audio for" },
        { status: 400 }
      );
    }

    // Parse optional body for voice settings and selective scene generation
    let voiceId = "en-US-AriaNeural";
    let speed = 1.0;
    let pitch = "+0Hz";
    let sceneIds: string[] | null = null;

    try {
      const body = await req.json();
      if (body.voiceId) voiceId = body.voiceId;
      if (body.speed !== undefined) speed = body.speed;
      if (body.pitch) pitch = body.pitch;
      if (body.sceneIds && Array.isArray(body.sceneIds)) {
        sceneIds = body.sceneIds;
      }
    } catch {
      // No body or invalid JSON — use defaults
    }

    const scenesToProcess = sceneIds
      ? project.scenes.filter((s) => sceneIds!.includes(s.id))
      : project.scenes;

    const results: {
      sceneId: string;
      success: boolean;
      audioUrl?: string;
      error?: string;
    }[] = [];

    for (let i = 0; i < scenesToProcess.length; i++) {
      const scene = scenesToProcess[i];

      try {
        const audioBuffer = await generateVoice({
          text: scene.narrationText,
          voiceId,
          speed,
          pitch,
        });

        const audioUrl = await saveAudio(audioBuffer);

        await prisma.scene.update({
          where: { id: scene.id },
          data: {
            audioUrl,
            voiceId,
            voiceSpeed: speed,
            voicePitch: pitch,
          },
        });

        results.push({ sceneId: scene.id, success: true, audioUrl });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `Voice generation failed for scene ${scene.id}:`,
          message
        );
        results.push({ sceneId: scene.id, success: false, error: message });
      }

      // Rate limit safety delay (skip after last scene)
      if (i < scenesToProcess.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Re-fetch all scenes with updated audioUrls
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
    console.error("POST /api/projects/[id]/generate-voices error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate voices";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
