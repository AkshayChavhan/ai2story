import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ImageGallery } from "@/components/image/image-gallery";
import type { StoryScene } from "@/types";

/**
 * Images Page — StoryForge AI
 * Server Component: fetches project + scenes, renders ImageGallery client component.
 */
export default async function ImagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      scenes: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!project || project.userId !== session.user.id) {
    notFound();
  }

  const initialScenes: StoryScene[] = project.scenes.map((scene) => ({
    id: scene.id,
    order: scene.order,
    narrationText: scene.narrationText,
    visualPrompt: scene.visualPrompt,
    cameraDirection: scene.cameraDirection || undefined,
    mood: scene.mood || undefined,
    duration: scene.duration || undefined,
    imageUrl: scene.imageUrl || undefined,
    audioUrl: scene.audioUrl || undefined,
    videoClipUrl: scene.videoClipUrl || undefined,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
      <Link
        href={`/projects/${project.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Project
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Scene Images
        </h1>
        <p className="mt-1 text-muted-foreground">{project.title}</p>
      </div>
      <ImageGallery
        projectId={project.id}
        initialScenes={initialScenes}
        imageStyle={project.imageStyle}
        aspectRatio={project.aspectRatio}
      />
    </div>
  );
}
