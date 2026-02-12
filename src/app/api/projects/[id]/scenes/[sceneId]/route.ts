import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateSceneSchema } from "@/lib/validations/scene";
import { ZodError } from "zod";

/**
 * PUT /api/projects/[id]/scenes/[sceneId] — Update a single scene.
 */
export async function PUT(
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
      include: { project: { select: { userId: true, id: true } } },
    });

    if (
      !scene ||
      scene.project.id !== id ||
      scene.project.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = updateSceneSchema.parse(body);

    // Build update data
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(validated)) {
      if (value === undefined) continue;
      updateData[key] = value === "" ? null : value;
    }

    const updatedScene = await prisma.scene.update({
      where: { id: sceneId },
      data: updateData,
    });

    return NextResponse.json({ scene: updatedScene });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("PUT /api/projects/[id]/scenes/[sceneId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]/scenes/[sceneId] — Delete a single scene.
 * Re-orders remaining scenes after deletion.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, sceneId } = await params;

    // Verify ownership chain
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: { project: { select: { userId: true, id: true } } },
    });

    if (
      !scene ||
      scene.project.id !== id ||
      scene.project.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    // Delete the scene
    await prisma.scene.delete({ where: { id: sceneId } });

    // Re-order remaining scenes
    const remainingScenes = await prisma.scene.findMany({
      where: { projectId: id },
      orderBy: { order: "asc" },
    });

    for (let i = 0; i < remainingScenes.length; i++) {
      if (remainingScenes[i].order !== i + 1) {
        await prisma.scene.update({
          where: { id: remainingScenes[i].id },
          data: { order: i + 1 },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/projects/[id]/scenes/[sceneId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
