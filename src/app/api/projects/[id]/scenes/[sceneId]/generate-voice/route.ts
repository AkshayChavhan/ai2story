import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateVoice } from "@/lib/ai/voice-generator";
import { saveAudio } from "@/lib/storage";

/**
 * POST /api/projects/[id]/scenes/[sceneId]/generate-voice
 * Regenerate voice audio for a single scene.
 * Optionally accepts { voiceId, speed, pitch } in the body.
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
          select: { id: true, userId: true },
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

    // Parse optional body for voice settings
    let voiceId = scene.voiceId || "en-US-AriaNeural";
    let speed = scene.voiceSpeed || 1.0;
    let pitch = scene.voicePitch || "+0Hz";

    try {
      const body = await req.json();
      if (body.voiceId) voiceId = body.voiceId;
      if (body.speed !== undefined) speed = body.speed;
      if (body.pitch) pitch = body.pitch;
    } catch {
      // No body — use scene defaults or fallbacks
    }

    const audioBuffer = await generateVoice({
      text: scene.narrationText,
      voiceId,
      speed,
      pitch,
    });

    const audioUrl = await saveAudio(audioBuffer);

    const updatedScene = await prisma.scene.update({
      where: { id: sceneId },
      data: {
        audioUrl,
        voiceId,
        voiceSpeed: speed,
        voicePitch: pitch,
      },
    });

    return NextResponse.json({ scene: updatedScene });
  } catch (error) {
    console.error(
      "POST /api/projects/[id]/scenes/[sceneId]/generate-voice error:",
      error
    );
    const message =
      error instanceof Error ? error.message : "Failed to generate voice";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
