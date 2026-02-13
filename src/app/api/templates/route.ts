import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/templates — List active story templates.
 * Supports genre filter and search by title/description.
 * Templates are system-wide (not user-specific).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const genre = searchParams.get("genre") || "";
    const search = searchParams.get("search") || "";

    // Build Prisma where clause
    const where: Record<string, unknown> = { isActive: true };

    if (genre) {
      where.genre = genre;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const templates = await prisma.storyTemplate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        prompt: true,
        genre: true,
        thumbnail: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("GET /api/templates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
