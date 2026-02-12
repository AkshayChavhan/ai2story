import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/projects/[id]/share — Enable public sharing.
 * Generates a unique share token and sets isPublic to true.
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
      select: { userId: true, videoUrl: true },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (!project.videoUrl) {
      return NextResponse.json(
        { error: "Compose your video before sharing." },
        { status: 400 }
      );
    }

    const shareToken = crypto.randomUUID();

    await prisma.project.update({
      where: { id },
      data: { isPublic: true, shareToken },
    });

    return NextResponse.json({ success: true, shareToken, isPublic: true });
  } catch (error) {
    console.error("POST /api/projects/[id]/share error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]/share — Disable public sharing.
 * Clears the share token and sets isPublic to false.
 */
export async function DELETE(
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
      select: { userId: true },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    await prisma.project.update({
      where: { id },
      data: { isPublic: false, shareToken: null },
    });

    return NextResponse.json({
      success: true,
      shareToken: null,
      isPublic: false,
    });
  } catch (error) {
    console.error("DELETE /api/projects/[id]/share error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
