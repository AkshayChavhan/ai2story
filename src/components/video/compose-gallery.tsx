"use client";

import { useState } from "react";
import { SceneVideoCard } from "@/components/video/scene-video-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Film, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { StoryScene } from "@/types";

/**
 * Compose gallery — grid view of all scene video clips for the Compose page.
 * Shows final video player at top when available.
 * Manages its own local state (independent of Zustand store).
 */

interface ComposeGalleryProps {
  projectId: string;
  initialScenes: StoryScene[];
  aspectRatio: string;
  videoUrl: string | null;
}

export function ComposeGallery({
  projectId,
  initialScenes,
  aspectRatio,
  videoUrl: initialVideoUrl,
}: ComposeGalleryProps) {
  const [scenes, setScenes] = useState<StoryScene[]>(initialScenes);
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl);
  const [isComposing, setIsComposing] = useState(false);

  const hasAnyVideos = scenes.some((s) => s.videoClipUrl);
  const missingVideos = scenes.filter((s) => !s.videoClipUrl).length;
  const allScenesReady = scenes.every((s) => s.imageUrl && s.audioUrl);

  const handleComposeAll = async () => {
    setIsComposing(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/compose`, {
        method: "POST",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to compose video");
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

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      }

      const { success, failed } = data.results;
      if (failed > 0) {
        toast.warning(`Composed ${success} scenes, ${failed} failed`);
      } else {
        toast.success(`Video composed from ${success} scenes!`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to compose video"
      );
    } finally {
      setIsComposing(false);
    }
  };

  if (scenes.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <Film className="h-10 w-10 text-muted-foreground" />
          <p className="text-center text-lg font-medium text-foreground">
            No scenes yet
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Generate a story first, then generate images and voices before
            composing video.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Final video player */}
      {videoUrl && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            Final Video
          </h2>
          <div className="overflow-hidden rounded-lg bg-muted">
            <video
              controls
              className="w-full"
              src={videoUrl}
            >
              Your browser does not support the video element.
            </video>
          </div>
        </div>
      )}

      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {hasAnyVideos
              ? `${scenes.length - missingVideos} of ${scenes.length} scenes have video clips`
              : `${scenes.length} scenes ready for video composition`}
          </p>
          <p className="text-xs text-muted-foreground">
            Aspect ratio: {aspectRatio}
          </p>
          {!allScenesReady && (
            <p className="text-xs text-amber-600">
              All scenes need images and audio before composing video
            </p>
          )}
        </div>
        <Button
          onClick={handleComposeAll}
          disabled={isComposing || !allScenesReady}
          className="gap-1.5"
        >
          {isComposing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hasAnyVideos ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <Film className="h-4 w-4" />
          )}
          {isComposing
            ? "Composing..."
            : hasAnyVideos
              ? "Recompose All"
              : "Compose All"}
        </Button>
      </div>

      {/* Video grid */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {scenes.map((scene) => (
          <SceneVideoCard key={scene.id} scene={scene} />
        ))}
      </div>
    </div>
  );
}
