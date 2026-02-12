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
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { StoryScene } from "@/types";

/**
 * Generate button — triggers AI story generation.
 * Shows "Regenerate" with confirmation when scenes already exist.
 * Simulates progress during the Gemini API call.
 */

interface GenerateButtonProps {
  projectId: string;
}

const progressSteps = [
  { progress: 10, message: "Analyzing your prompt..." },
  { progress: 25, message: "Crafting the narrative..." },
  { progress: 45, message: "Building scenes..." },
  { progress: 65, message: "Refining visual descriptions..." },
  { progress: 80, message: "Finalizing story structure..." },
  { progress: 90, message: "Almost there..." },
];

export function GenerateButton({ projectId }: GenerateButtonProps) {
  const scenes = useProjectStore((s) => s.scenes);
  const isProcessing = useProjectStore((s) => s.isProcessing);
  const setScenes = useProjectStore((s) => s.setScenes);
  const setProcessing = useProjectStore((s) => s.setProcessing);
  const setProcessingStatus = useProjectStore((s) => s.setProcessingStatus);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasExistingScenes = scenes.length > 0;

  const startGeneration = useCallback(async () => {
    setProcessing(true);
    setProcessingStatus({
      step: "story",
      progress: 0,
      message: "Starting story generation...",
    });

    // Simulate progress intervals
    let stepIndex = 0;
    intervalRef.current = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setProcessingStatus({
          step: "story",
          progress: progressSteps[stepIndex].progress,
          message: progressSteps[stepIndex].message,
        });
        stepIndex++;
      }
    }, 2000);

    try {
      const response = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate story");
      }

      const data = await response.json();

      // Map API response to StoryScene type
      const mappedScenes: StoryScene[] = data.scenes.map(
        (scene: Record<string, unknown>) => ({
          id: scene.id as string,
          order: scene.order as number,
          narrationText: scene.narrationText as string,
          visualPrompt: scene.visualPrompt as string,
          cameraDirection: (scene.cameraDirection as string) || undefined,
          mood: (scene.mood as string) || undefined,
          duration: (scene.duration as number) || undefined,
        })
      );

      setProcessingStatus({
        step: "complete",
        progress: 100,
        message: "Story generated!",
      });

      // Brief pause to show 100%
      await new Promise((resolve) => setTimeout(resolve, 500));

      setScenes(mappedScenes);
      toast.success(
        `Story generated with ${mappedScenes.length} scenes!`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate story"
      );
    } finally {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setProcessing(false);
      setProcessingStatus(null);
    }
  }, [projectId, setScenes, setProcessing, setProcessingStatus]);

  const handleClick = () => {
    if (hasExistingScenes) {
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
        disabled={isProcessing}
        className="gap-1.5"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : hasExistingScenes ? (
          <RefreshCw className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {hasExistingScenes ? "Regenerate" : "Generate Story"}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Story?</DialogTitle>
            <DialogDescription>
              This will replace all {scenes.length} existing scene
              {scenes.length !== 1 ? "s" : ""} with a new AI-generated story.
              Any edits you&apos;ve made will be lost. This cannot be undone.
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
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
