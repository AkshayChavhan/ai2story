"use client";

import { useState, useRef, useCallback } from "react";
import { useProjectStore } from "@/store/project-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Film, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

/**
 * Compose video button — triggers batch video composition for all scenes.
 * Requires all scenes to have both imageUrl and audioUrl.
 * Shows "Recompose Video" with confirmation when video clips already exist.
 */

interface ComposeButtonProps {
  projectId: string;
}

export function ComposeButton({ projectId }: ComposeButtonProps) {
  const scenes = useProjectStore((s) => s.scenes);
  const isProcessing = useProjectStore((s) => s.isProcessing);
  const setProcessing = useProjectStore((s) => s.setProcessing);
  const setProcessingStatus = useProjectStore((s) => s.setProcessingStatus);
  const updateScene = useProjectStore((s) => s.updateScene);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasExistingVideos = scenes.some((s) => s.videoClipUrl);
  const allScenesReady = scenes.every((s) => s.imageUrl && s.audioUrl);

  const startComposition = useCallback(async () => {
    setProcessing(true);
    setProcessingStatus({
      step: "video",
      progress: 0,
      message: "Starting video composition...",
      sceneIndex: 0,
      totalScenes: scenes.length,
    });

    // Simulate per-scene progress (video composition is slow, ~20-60s per scene)
    let currentScene = 0;
    intervalRef.current = setInterval(() => {
      if (currentScene < scenes.length) {
        const progress = Math.round(
          ((currentScene + 0.5) / scenes.length) * 100
        );
        setProcessingStatus({
          step: "video",
          progress: Math.min(progress, 95),
          message: `Composing scene ${currentScene + 1} of ${scenes.length}...`,
          sceneIndex: currentScene,
          totalScenes: scenes.length,
        });
        currentScene++;
      }
    }, 15000);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/compose`,
        { method: "POST" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to compose video");
      }

      const data = await response.json();

      // Update scenes in Zustand store with new videoClipUrls
      for (const scene of data.scenes) {
        if (scene.videoClipUrl) {
          updateScene(scene.id, { videoClipUrl: scene.videoClipUrl });
        }
      }

      setProcessingStatus({
        step: "video",
        progress: 100,
        message: "Video composed!",
        sceneIndex: scenes.length,
        totalScenes: scenes.length,
      });

      // Brief pause to show 100%
      await new Promise((resolve) => setTimeout(resolve, 500));

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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setProcessing(false);
      setProcessingStatus(null);
    }
  }, [projectId, scenes, setProcessing, setProcessingStatus, updateScene]);

  const handleClick = () => {
    if (hasExistingVideos) {
      setShowConfirmDialog(true);
    } else {
      startComposition();
    }
  };

  const handleConfirmRecompose = () => {
    setShowConfirmDialog(false);
    startComposition();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isProcessing || scenes.length === 0 || !allScenesReady}
        variant="outline"
        className="gap-1.5"
        title={
          !allScenesReady
            ? "Generate images and voices for all scenes first"
            : undefined
        }
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : hasExistingVideos ? (
          <RefreshCw className="h-4 w-4" />
        ) : (
          <Film className="h-4 w-4" />
        )}
        {hasExistingVideos ? "Recompose Video" : "Compose Video"}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recompose All Videos?</DialogTitle>
            <DialogDescription>
              This will replace existing video clips for all {scenes.length}{" "}
              scene{scenes.length !== 1 ? "s" : ""} and regenerate the final
              video.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmRecompose}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Recompose All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
