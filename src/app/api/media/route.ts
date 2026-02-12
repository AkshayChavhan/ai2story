import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { MediaItem, MediaType } from "@/types";

/**
 * GET /api/media — List media items for the authenticated user.
 * Queries Scene records, flattens media URLs into individual items.
 * Supports type filter, search by project title, and pagination.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const type = searchParams.get("type") || "";
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "24", 10))
    );

    // Build Prisma where clause for scenes
    const where: Record<string, unknown> = {
      project: { userId: session.user.id },
    };

    // Filter by media type — only fetch scenes that have the requested URL
    if (type === "image") {
      where.imageUrl = { not: null };
    } else if (type === "audio") {
      where.audioUrl = { not: null };
    } else if (type === "video") {
      where.videoClipUrl = { not: null };
    } else {
      // No type filter — fetch scenes with at least one media URL
      where.OR = [
        { imageUrl: { not: null } },
        { audioUrl: { not: null } },
        { videoClipUrl: { not: null } },
      ];
    }

    // Search by project title
    if (search) {
      where.project = {
        userId: session.user.id,
        title: { contains: search, mode: "insensitive" },
      };
    }

    const scenes = await prisma.scene.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        order: true,
        imageUrl: true,
        audioUrl: true,
        videoClipUrl: true,
        createdAt: true,
        project: {
          select: { id: true, title: true },
        },
      },
    });

    // Flatten scenes into individual media items
    const allItems: MediaItem[] = [];

    for (const scene of scenes) {
      if (scene.imageUrl && (!type || type === "image")) {
        allItems.push({
          id: `${scene.id}-image`,
          type: "image" as MediaType,
          url: scene.imageUrl,
          projectId: scene.project.id,
          projectTitle: scene.project.title,
          sceneOrder: scene.order,
          createdAt: scene.createdAt.toISOString(),
        });
      }
      if (scene.audioUrl && (!type || type === "audio")) {
        allItems.push({
          id: `${scene.id}-audio`,
          type: "audio" as MediaType,
          url: scene.audioUrl,
          projectId: scene.project.id,
          projectTitle: scene.project.title,
          sceneOrder: scene.order,
          createdAt: scene.createdAt.toISOString(),
        });
      }
      if (scene.videoClipUrl && (!type || type === "video")) {
        allItems.push({
          id: `${scene.id}-video`,
          type: "video" as MediaType,
          url: scene.videoClipUrl,
          projectId: scene.project.id,
          projectTitle: scene.project.title,
          sceneOrder: scene.order,
          createdAt: scene.createdAt.toISOString(),
        });
      }
    }

    // Sort by createdAt descending (already sorted from Prisma, but flatten may interleave)
    allItems.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginate
    const total = allItems.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const items = allItems.slice(skip, skip + limit);

    return NextResponse.json({ items, total, page, totalPages });
  } catch (error) {
    console.error("GET /api/media error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
