import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bulkScenesSchema } from "@/lib/validations/scene";
import { ZodError } from "zod";

/**
 * GET /api/projects/[id]/scenes — List all scenes for a project.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const scenes = await prisma.scene.findMany({
      where: { projectId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ scenes });
  } catch (error) {
    console.error("GET /api/projects/[id]/scenes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]/scenes — Bulk save/update all scenes.
 * Deletes existing scenes and creates new ones (handles reorder, add, delete).
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = bulkScenesSchema.parse(body);

    // Delete all existing scenes and create new ones
    await prisma.scene.deleteMany({ where: { projectId: id } });

    await prisma.scene.createMany({
      data: validated.scenes.map((scene) => ({
        projectId: id,
        order: scene.order,
        narrationText: scene.narrationText,
        visualPrompt: scene.visualPrompt,
        cameraDirection: scene.cameraDirection || null,
        mood: scene.mood || null,
        duration: scene.duration || null,
      })),
    });

    // Re-fetch created scenes
    const scenes = await prisma.scene.findMany({
      where: { projectId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ scenes });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("PUT /api/projects/[id]/scenes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
