import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExportPanel } from "@/components/export/export-panel";

/**
 * Export & Download Page — StoryForge AI
 * Server Component: fetches project + scenes, renders ExportPanel client component.
 * Download functionality is feat:9. Sharing (public link) will be added in feat:10.
 */
export default async function SharePage({
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
        select: {
          id: true,
          imageUrl: true,
          audioUrl: true,
          videoClipUrl: true,
        },
      },
    },
  });

  if (!project || project.userId !== session.user.id) {
    notFound();
  }

  const sceneCount = project.scenes.length;
  const imageCount = project.scenes.filter((s) => s.imageUrl).length;
  const audioCount = project.scenes.filter((s) => s.audioUrl).length;
  const clipCount = project.scenes.filter((s) => s.videoClipUrl).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
      <Link
        href={`/projects/${project.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Project
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Export & Download
        </h1>
        <p className="mt-1 text-muted-foreground">{project.title}</p>
      </div>
      <ExportPanel
        projectId={project.id}
        projectTitle={project.title}
        videoUrl={project.videoUrl}
        thumbnailUrl={project.thumbnailUrl}
        resolution={project.resolution}
        duration={project.duration}
        sceneCount={sceneCount}
        imageCount={imageCount}
        audioCount={audioCount}
        clipCount={clipCount}
      />
    </div>
  );
}
