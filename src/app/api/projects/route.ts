import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations/project";
import { ZodError } from "zod";

/**
 * GET /api/projects — List projects for the authenticated user.
 * Supports search, status/genre filters, pagination.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const genre = searchParams.get("genre") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    // Build Prisma where clause
    const where: Record<string, unknown> = { userId: session.user.id };

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }
    if (status) {
      where.status = status;
    }
    if (genre) {
      where.genre = genre;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          genre: true,
          imageStyle: true,
          aspectRatio: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { scenes: true },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects — Create a new project.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        title: validated.title,
        description: validated.description || null,
        prompt: validated.prompt,
        genre: validated.genre || null,
        tone: validated.tone || null,
        targetAudience: validated.targetAudience || null,
        targetLength: validated.targetLength || null,
        language: validated.language,
        imageStyle: validated.imageStyle,
        aspectRatio: validated.aspectRatio,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
