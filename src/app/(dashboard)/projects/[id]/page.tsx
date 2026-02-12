import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Sparkles, Calendar, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatDate, capitalize } from "@/lib/utils";
import { ProjectActions } from "@/components/projects/project-actions";

/**
 * Project Overview Page — StoryForge AI
 * Server Component: fetches project via Prisma, renders overview with actions.
 */
export default async function ProjectPage({
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
      _count: {
        select: { scenes: true, characters: true },
      },
    },
  });

  if (!project || project.userId !== session.user.id) {
    notFound();
  }

  const metadata = [
    { label: "Genre", value: project.genre ? capitalize(project.genre.replace("-", " ")) : "Not set" },
    { label: "Tone", value: project.tone ? capitalize(project.tone) : "Not set" },
    { label: "Audience", value: project.targetAudience ? capitalize(project.targetAudience) : "Not set" },
    { label: "Image Style", value: capitalize(project.imageStyle.replace("-", " ")) },
    { label: "Aspect Ratio", value: project.aspectRatio },
    { label: "Language", value: project.language.toUpperCase() },
    { label: "Target Length", value: project.targetLength ? `${project.targetLength}s` : "Not set" },
  ];

  function getStatusVariant(
    status: string
  ): "default" | "secondary" | "outline" {
    switch (status) {
      case "completed":
        return "default";
      case "in-progress":
      case "processing":
        return "secondary";
      case "draft":
      default:
        return "outline";
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {project.title}
            </h1>
            <Badge variant={getStatusVariant(project.status)}>
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Created {formatDate(project.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Updated {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>

        {/* Action buttons — client component for delete dialog */}
        <ProjectActions projectId={project.id} projectTitle={project.title} />
      </div>

      {/* Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Story Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {project.prompt}
          </p>
        </CardContent>
      </Card>

      {/* Metadata Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metadata.map((item) => (
              <div key={item.label}>
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Scenes</p>
            <p className="text-2xl font-bold">{project._count.scenes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Characters</p>
            <p className="text-2xl font-bold">{project._count.characters}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Version</p>
            <p className="text-2xl font-bold">{project.version}</p>
          </CardContent>
        </Card>
      </div>

      {/* Story CTA */}
      {project.status === "draft" && project._count.scenes === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-8">
            <Sparkles className="h-8 w-8 text-primary" />
            <p className="text-center text-muted-foreground">
              Ready to bring your story to life?
            </p>
            <Link
              href={`/projects/${project.id}/story`}
              className={cn(buttonVariants(), "gap-2")}
            >
              <Sparkles className="h-4 w-4" />
              Generate Story
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8 sm:flex-row sm:justify-between">
            <div>
              <p className="font-medium text-foreground">
                {project._count.scenes > 0
                  ? `${project._count.scenes} scene${project._count.scenes !== 1 ? "s" : ""} generated`
                  : "No scenes yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                {project._count.scenes > 0
                  ? "View, edit, or regenerate your story scenes."
                  : "Generate scenes from your project prompt using AI."}
              </p>
            </div>
            <Link
              href={`/projects/${project.id}/story`}
              className={cn(buttonVariants(), "gap-2")}
            >
              {project._count.scenes > 0 ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {project._count.scenes > 0 ? "Edit Story" : "Generate Story"}
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
