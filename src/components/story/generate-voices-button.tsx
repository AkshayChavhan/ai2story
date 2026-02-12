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
import { Volume2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

/**
 * Generate voices button — triggers batch AI voice generation for all scenes.
 * Shows "Regenerate Voices" with confirmation when audio already exists.
 */

interface GenerateVoicesButtonProps {
  projectId: string;
}

export function GenerateVoicesButton({ projectId }: GenerateVoicesButtonProps) {
  const scenes = useProjectStore((s) => s.scenes);
  const isProcessing = useProjectStore((s) => s.isProcessing);
  const setProcessing = useProjectStore((s) => s.setProcessing);
  const setProcessingStatus = useProjectStore((s) => s.setProcessingStatus);
  const updateScene = useProjectStore((s) => s.updateScene);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasExistingAudio = scenes.some((s) => s.audioUrl);

  const startGeneration = useCallback(async () => {
    setProcessing(true);
    setProcessingStatus({
      step: "voice",
      progress: 0,
      message: "Starting voice generation...",
      sceneIndex: 0,
      totalScenes: scenes.length,
    });

    // Simulate per-scene progress (Edge TTS is ~2-5s per scene)
    let currentScene = 0;
    intervalRef.current = setInterval(() => {
      if (currentScene < scenes.length) {
        const progress = Math.round(
          ((currentScene + 0.5) / scenes.length) * 100
        );
        setProcessingStatus({
          step: "voice",
          progress: Math.min(progress, 95),
          message: `Generating voice ${currentScene + 1} of ${scenes.length}...`,
          sceneIndex: currentScene,
          totalScenes: scenes.length,
        });
        currentScene++;
      }
    }, 5000);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/generate-voices`,
        { method: "POST" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate voices");
      }

      const data = await response.json();

      // Update scenes in Zustand store with new audioUrls
      for (const scene of data.scenes) {
        if (scene.audioUrl) {
          updateScene(scene.id, { audioUrl: scene.audioUrl });
        }
      }

      setProcessingStatus({
        step: "voice",
        progress: 100,
        message: "Voices generated!",
        sceneIndex: scenes.length,
        totalScenes: scenes.length,
      });

      // Brief pause to show 100%
      await new Promise((resolve) => setTimeout(resolve, 500));

      const { success, failed } = data.results;
      if (failed > 0) {
        toast.warning(`Generated ${success} voices, ${failed} failed`);
      } else {
        toast.success(`Generated ${success} scene voices!`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate voices"
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
    if (hasExistingAudio) {
      setShowConfirmDialog(true);
    } else {
      startGeneration();
    }
  };

  const handleConfirmRegenerate = () => {
    setShowConfirmDialog(false);
    startGeneration();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isProcessing || scenes.length === 0}
        variant="outline"
        className="gap-1.5"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : hasExistingAudio ? (
          <RefreshCw className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
        {hasExistingAudio ? "Regenerate Voices" : "Generate Voices"}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate All Voices?</DialogTitle>
            <DialogDescription>
              This will replace existing audio for all {scenes.length} scene
              {scenes.length !== 1 ? "s" : ""}. Individual scene audio can be
              regenerated separately from each scene card.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmRegenerate}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
