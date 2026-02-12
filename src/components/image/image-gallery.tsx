"use client";

import { useState } from "react";
import { SceneImageCard } from "@/components/image/scene-image-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { StoryScene } from "@/types";

/**
 * Image gallery — grid view of all scene images for the Images page.
 * Manages its own local state (independent of Zustand store).
 */

interface ImageGalleryProps {
  projectId: string;
  initialScenes: StoryScene[];
  imageStyle: string;
  aspectRatio: string;
}

export function ImageGallery({
  projectId,
  initialScenes,
  imageStyle,
  aspectRatio,
}: ImageGalleryProps) {
  const [scenes, setScenes] = useState<StoryScene[]>(initialScenes);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const hasAnyImages = scenes.some((s) => s.imageUrl);
  const missingImages = scenes.filter((s) => !s.imageUrl).length;

  const handleImageUpdated = (sceneId: string, imageUrl: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, imageUrl } : s))
    );
  };

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/generate-images`,
        { method: "POST" }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate images");
      }
      const data = await response.json();

      // Update all scenes from response
      const updatedScenes: StoryScene[] = data.scenes.map(
        (s: Record<string, unknown>) => ({
          id: s.id as string,
          order: s.order as number,
          narrationText: s.narrationText as string,
          visualPrompt: s.visualPrompt as string,
          cameraDirection: (s.cameraDirection as string) || undefined,
          mood: (s.mood as string) || undefined,
          duration: (s.duration as number) || undefined,
          imageUrl: (s.imageUrl as string) || undefined,
          audioUrl: (s.audioUrl as string) || undefined,
          videoClipUrl: (s.videoClipUrl as string) || undefined,
        })
      );
      setScenes(updatedScenes);

      const { success, failed } = data.results;
      if (failed > 0) {
        toast.warning(`Generated ${success} images, ${failed} failed`);
      } else {
        toast.success(`Generated ${success} scene images!`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate images"
      );
    } finally {
      setIsGeneratingAll(false);
    }
  };

  if (scenes.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
          <p className="text-center text-lg font-medium text-foreground">
            No scenes yet
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Generate a story first, then come back to generate images.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {hasAnyImages
              ? `${scenes.length - missingImages} of ${scenes.length} scenes have images`
              : `${scenes.length} scenes ready for image generation`}
          </p>
          <p className="text-xs text-muted-foreground">
            Style: {imageStyle} | Ratio: {aspectRatio}
          </p>
        </div>
        <Button
          onClick={handleGenerateAll}
          disabled={isGeneratingAll}
          className="gap-1.5"
        >
          {isGeneratingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hasAnyImages ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
          {isGeneratingAll
            ? "Generating..."
            : hasAnyImages
              ? "Regenerate All"
              : "Generate All Images"}
        </Button>
      </div>

      {/* Image grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenes.map((scene) => (
          <SceneImageCard
            key={scene.id}
            scene={scene}
            projectId={projectId}
            onImageUpdated={handleImageUpdated}
          />
        ))}
      </div>
    </div>
  );
}
