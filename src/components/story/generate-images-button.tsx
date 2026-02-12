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
import { ImageIcon, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

/**
 * Generate images button — triggers batch AI image generation for all scenes.
 * Shows "Regenerate Images" with confirmation when images already exist.
 */

interface GenerateImagesButtonProps {
  projectId: string;
}

export function GenerateImagesButton({ projectId }: GenerateImagesButtonProps) {
  const scenes = useProjectStore((s) => s.scenes);
  const isProcessing = useProjectStore((s) => s.isProcessing);
  const setProcessing = useProjectStore((s) => s.setProcessing);
  const setProcessingStatus = useProjectStore((s) => s.setProcessingStatus);
  const updateScene = useProjectStore((s) => s.updateScene);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasExistingImages = scenes.some((s) => s.imageUrl);

  const startGeneration = useCallback(async () => {
    setProcessing(true);
    setProcessingStatus({
      step: "images",
      progress: 0,
      message: "Starting image generation...",
      sceneIndex: 0,
      totalScenes: scenes.length,
    });

    // Simulate per-scene progress (API processes sequentially, ~10-20s per scene)
    let currentScene = 0;
    intervalRef.current = setInterval(() => {
      if (currentScene < scenes.length) {
        const progress = Math.round(
          ((currentScene + 0.5) / scenes.length) * 100
        );
        setProcessingStatus({
          step: "images",
          progress: Math.min(progress, 95),
          message: `Generating image ${currentScene + 1} of ${scenes.length}...`,
          sceneIndex: currentScene,
          totalScenes: scenes.length,
        });
        currentScene++;
      }
    }, 12000);

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

      // Update scenes in Zustand store with new imageUrls
      for (const scene of data.scenes) {
        if (scene.imageUrl) {
          updateScene(scene.id, { imageUrl: scene.imageUrl });
        }
      }

      setProcessingStatus({
        step: "images",
        progress: 100,
        message: "Images generated!",
        sceneIndex: scenes.length,
        totalScenes: scenes.length,
      });

      // Brief pause to show 100%
      await new Promise((resolve) => setTimeout(resolve, 500));

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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setProcessing(false);
      setProcessingStatus(null);
    }
  }, [projectId, scenes, setProcessing, setProcessingStatus, updateScene]);

  const handleClick = () => {
    if (hasExistingImages) {
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
        ) : hasExistingImages ? (
          <RefreshCw className="h-4 w-4" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
        {hasExistingImages ? "Regenerate Images" : "Generate Images"}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate All Images?</DialogTitle>
            <DialogDescription>
              This will replace existing images for all {scenes.length} scene
              {scenes.length !== 1 ? "s" : ""}. Individual scene images can be
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
