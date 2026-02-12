import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import path from "path";
import { existsSync } from "fs";
import archiver from "archiver";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/projects/[id]/export — Generate ZIP bundle of all project assets.
 * Returns a streaming ZIP containing images, audio, video clips, final video, and metadata.
 * Requires project to have a composed video (videoUrl must exist).
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
      include: {
        scenes: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            narrationText: true,
            visualPrompt: true,
            cameraDirection: true,
            mood: true,
            duration: true,
            imageUrl: true,
            audioUrl: true,
            videoClipUrl: true,
          },
        },
      },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.videoUrl) {
      return NextResponse.json(
        { error: "No video to export. Compose the video first." },
        { status: 400 }
      );
    }

    // Build metadata JSON
    const metadata = {
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        prompt: project.prompt,
        status: project.status,
        genre: project.genre,
        tone: project.tone,
        targetLength: project.targetLength,
        targetAudience: project.targetAudience,
        language: project.language,
        imageStyle: project.imageStyle,
        aspectRatio: project.aspectRatio,
        resolution: project.resolution,
        duration: project.duration,
        version: project.version,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      scenes: project.scenes.map((s) => ({
        order: s.order,
        narrationText: s.narrationText,
        visualPrompt: s.visualPrompt,
        cameraDirection: s.cameraDirection,
        mood: s.mood,
        duration: s.duration,
      })),
      exportedAt: new Date().toISOString(),
      generator: "StoryForge AI",
    };

    // Create ZIP archive
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    const archive = archiver("zip", { zlib: { level: 5 } });

    archive.on("data", (chunk: Buffer) => writer.write(chunk));
    archive.on("end", () => writer.close());
    archive.on("error", (err) => writer.abort(err));

    // Add metadata.json
    archive.append(JSON.stringify(metadata, null, 2), {
      name: "metadata.json",
    });

    // Helper: add file if it exists on disk
    const addFile = (urlPath: string, archivePath: string) => {
      const filePath = path.join(process.cwd(), "public", urlPath);
      if (existsSync(filePath)) {
        archive.file(filePath, { name: archivePath });
      }
    };

    // Add scene assets
    for (const scene of project.scenes) {
      const prefix = `scene-${String(scene.order).padStart(2, "0")}`;

      if (scene.imageUrl) {
        const ext = path.extname(scene.imageUrl) || ".png";
        addFile(scene.imageUrl, `images/${prefix}${ext}`);
      }
      if (scene.audioUrl) {
        const ext = path.extname(scene.audioUrl) || ".mp3";
        addFile(scene.audioUrl, `audio/${prefix}${ext}`);
      }
      if (scene.videoClipUrl) {
        const ext = path.extname(scene.videoClipUrl) || ".mp4";
        addFile(scene.videoClipUrl, `clips/${prefix}${ext}`);
      }
    }

    // Add final video
    if (project.videoUrl) {
      const ext = path.extname(project.videoUrl) || ".mp4";
      addFile(project.videoUrl, `final-video${ext}`);
    }

    // Finalize archive (triggers streaming)
    archive.finalize();

    // Sanitize project title for filename
    const safeTitle = project.title
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 50);
    const fileName = `${safeTitle}_storyforge.zip`;

    return new Response(readable, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("POST /api/projects/[id]/export error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to export project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
