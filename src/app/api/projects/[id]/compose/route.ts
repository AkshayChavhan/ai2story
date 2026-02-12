import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import path from "path";
import { mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  composeScene,
  concatenateScenes,
  getVideoResolution,
} from "@/lib/ai/video-composer";
import type { SceneInput } from "@/lib/ai/video-composer";

const OUTPUT_DIR = path.join(process.cwd(), "public", "uploads", "videos");

/**
 * POST /api/projects/[id]/compose — Compose video for all scenes.
 * Applies Ken Burns effect on each scene's image + audio, then concatenates into final video.
 * All scenes must have both imageUrl and audioUrl.
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
        aspectRatio: true,
        scenes: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            narrationText: true,
            imageUrl: true,
            audioUrl: true,
            duration: true,
            videoClipUrl: true,
          },
        },
      },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.scenes.length === 0) {
      return NextResponse.json(
        { error: "No scenes to compose" },
        { status: 400 }
      );
    }

    // Validate: all scenes must have both imageUrl and audioUrl
    const missingAssets = project.scenes.filter(
      (s) => !s.imageUrl || !s.audioUrl
    );
    if (missingAssets.length > 0) {
      return NextResponse.json(
        {
          error: `${missingAssets.length} scene(s) missing image or audio. Generate images and voices first.`,
        },
        { status: 400 }
      );
    }

    const resolution = getVideoResolution(project.aspectRatio);
    await mkdir(OUTPUT_DIR, { recursive: true });

    const results: {
      sceneId: string;
      success: boolean;
      videoClipUrl?: string;
      error?: string;
    }[] = [];

    const scenePaths: string[] = [];

    for (let i = 0; i < project.scenes.length; i++) {
      const scene = project.scenes[i];

      try {
        // Convert URL paths to absolute file paths
        const imagePath = path.join(process.cwd(), "public", scene.imageUrl!);
        const audioPath = path.join(process.cwd(), "public", scene.audioUrl!);
        const duration = scene.duration || 5;

        const sceneInput: SceneInput = {
          imagePath,
          audioPath,
          duration,
        };

        const sceneFileName = `scene_${uuidv4()}.mp4`;
        const scenePath = path.join(OUTPUT_DIR, sceneFileName);

        await composeScene(sceneInput, scenePath, resolution);

        const videoClipUrl = `/uploads/videos/${sceneFileName}`;

        await prisma.scene.update({
          where: { id: scene.id },
          data: { videoClipUrl },
        });

        scenePaths.push(scenePath);
        results.push({ sceneId: scene.id, success: true, videoClipUrl });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `Video composition failed for scene ${scene.id}:`,
          message
        );
        results.push({ sceneId: scene.id, success: false, error: message });
      }

      // Delay between scenes (skip after last)
      if (i < project.scenes.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    // Concatenate into final video (only if we have successful scene clips)
    let videoUrl: string | null = null;

    if (scenePaths.length === 1) {
      videoUrl = results.find((r) => r.success)?.videoClipUrl || null;
    } else if (scenePaths.length > 1) {
      try {
        const finalFileName = `${uuidv4()}.mp4`;
        const finalPath = path.join(OUTPUT_DIR, finalFileName);
        await concatenateScenes(scenePaths, finalPath);
        videoUrl = `/uploads/videos/${finalFileName}`;
      } catch (error) {
        console.error("Final video concatenation failed:", error);
      }
    }

    // Update project with final video URL and resolution
    if (videoUrl) {
      await prisma.project.update({
        where: { id },
        data: { videoUrl, resolution },
      });
    }

    // Re-fetch all scenes with updated videoClipUrls
    const updatedScenes = await prisma.scene.findMany({
      where: { projectId: id },
      orderBy: { order: "asc" },
    });

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      scenes: updatedScenes,
      videoUrl,
      results: {
        total: project.scenes.length,
        success: successCount,
        failed: failedCount,
        details: results,
      },
    });
  } catch (error) {
    console.error("POST /api/projects/[id]/compose error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to compose video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
