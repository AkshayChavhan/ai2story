import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StoryEditor } from "@/components/story/story-editor";
import type { StoryScene } from "@/types";

/**
 * Story Editor Page — StoryForge AI
 * Server Component: fetches project + scenes, renders StoryEditor client component.
 */
export default async function StoryEditorPage({
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

  // Map DB scenes to StoryScene type for the client
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
    <StoryEditor
      project={{
        id: project.id,
        title: project.title,
        prompt: project.prompt,
        status: project.status,
        genre: project.genre,
        tone: project.tone,
        targetLength: project.targetLength,
        targetAudience: project.targetAudience,
        language: project.language,
        imageStyle: project.imageStyle,
        aspectRatio: project.aspectRatio,
      }}
      initialScenes={initialScenes}
    />
  );
}
