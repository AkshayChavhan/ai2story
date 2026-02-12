"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import { GenerateButton } from "@/components/story/generate-button";
import { GenerateImagesButton } from "@/components/story/generate-images-button";
import { GenerateVoicesButton } from "@/components/story/generate-voices-button";
import { ComposeButton } from "@/components/story/compose-button";
import { SaveButton } from "@/components/story/save-button";
import { ProcessingOverlay } from "@/components/story/processing-overlay";
import { SceneList } from "@/components/story/scene-list";
import { Card, CardContent } from "@/components/ui/card";
import type { StoryScene, Genre, Tone, TargetAudience, ImageStyle, AspectRatio, ProjectStatus } from "@/types";

/**
 * Story editor — main orchestrator component.
 * Receives project data from server page and manages all interactive state.
 */

interface StoryEditorProps {
  project: {
    id: string;
    title: string;
    prompt: string;
    status: string;
    genre: string | null;
    tone: string | null;
    targetLength: number | null;
    targetAudience: string | null;
    language: string;
    imageStyle: string;
    aspectRatio: string;
  };
  initialScenes: StoryScene[];
}

export function StoryEditor({ project, initialScenes }: StoryEditorProps) {
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject);
  const setScenes = useProjectStore((s) => s.setScenes);
  const reset = useProjectStore((s) => s.reset);
  const scenes = useProjectStore((s) => s.scenes);
  const isProcessing = useProjectStore((s) => s.isProcessing);

  // Initialize store on mount
  useEffect(() => {
    setCurrentProject({
      id: project.id,
      title: project.title,
      prompt: project.prompt,
      status: project.status as ProjectStatus,
      genre: (project.genre || undefined) as Genre | undefined,
      tone: (project.tone || undefined) as Tone | undefined,
      targetLength: project.targetLength || undefined,
      targetAudience: (project.targetAudience || undefined) as TargetAudience | undefined,
      language: project.language,
      imageStyle: project.imageStyle as ImageStyle,
      aspectRatio: project.aspectRatio as AspectRatio,
      scenes: initialScenes,
      isPublic: false,
      createdAt: "",
      updatedAt: "",
    });
    setScenes(initialScenes);

    return () => {
      reset();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <Link
          href={`/projects/${project.id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              Story Editor
            </h1>
            <p className="mt-1 text-muted-foreground">{project.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <GenerateButton projectId={project.id} />
            {scenes.length > 0 && (
              <GenerateImagesButton projectId={project.id} />
            )}
            {scenes.length > 0 && (
              <GenerateVoicesButton projectId={project.id} />
            )}
            {scenes.length > 0 && (
              <ComposeButton projectId={project.id} />
            )}
            {scenes.length > 0 && <SaveButton projectId={project.id} />}
          </div>
        </div>
      </div>

      {/* Processing Overlay */}
      {isProcessing && <ProcessingOverlay />}

      {/* Scene List or Empty State */}
      {!isProcessing && scenes.length > 0 ? (
        <SceneList />
      ) : (
        !isProcessing && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <Sparkles className="h-10 w-10 text-muted-foreground" />
              <p className="text-center text-lg font-medium text-foreground">
                No scenes yet
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Click &quot;Generate Story&quot; to create scenes from your
                project prompt using AI.
              </p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
