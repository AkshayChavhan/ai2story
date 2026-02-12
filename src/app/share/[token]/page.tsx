import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

/**
 * Public Video View — StoryForge AI
 * Server Component: looks up project by shareToken, renders public video player.
 * No authentication required.
 */

async function getSharedProject(token: string) {
  return prisma.project.findUnique({
    where: { shareToken: token },
    select: {
      title: true,
      description: true,
      videoUrl: true,
      thumbnailUrl: true,
      duration: true,
      resolution: true,
      isPublic: true,
      createdAt: true,
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const project = await getSharedProject(token);

  if (!project || !project.isPublic) {
    return { title: "Video Not Found — StoryForge AI" };
  }

  return {
    title: `${project.title} — StoryForge AI`,
    description:
      project.description ||
      "Watch this AI-generated video created with StoryForge AI.",
    openGraph: {
      title: project.title,
      description:
        project.description ||
        "Watch this AI-generated video created with StoryForge AI.",
      ...(project.thumbnailUrl ? { images: [project.thumbnailUrl] } : {}),
    },
  };
}

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const project = await getSharedProject(token);

  if (!project || !project.isPublic) {
    notFound();
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header branding */}
      <header className="border-b border-border px-6 py-4">
        <p className="text-sm font-semibold text-primary">StoryForge AI</p>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {project.title}
            </h1>
            {project.description && (
              <p className="mt-2 text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>

          {project.videoUrl ? (
            <div className="overflow-hidden rounded-lg bg-muted">
              <video
                controls
                className="w-full"
                src={project.videoUrl}
                poster={project.thumbnailUrl || undefined}
              >
                Your browser does not support the video element.
              </video>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-20">
              <p className="text-muted-foreground">Video not available.</p>
            </div>
          )}

          {(project.resolution || project.duration != null) && (
            <div className="flex items-center gap-3">
              {project.resolution && (
                <Badge variant="secondary">{project.resolution}</Badge>
              )}
              {project.duration != null && (
                <Badge variant="secondary">
                  {formatDuration(project.duration)}
                </Badge>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer branding */}
      <footer className="border-t border-border px-6 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          Made with{" "}
          <span className="font-semibold text-primary">StoryForge AI</span>
        </p>
      </footer>
    </div>
  );
}
