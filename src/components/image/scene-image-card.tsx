"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCw, Loader2, ImageIcon, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import type { StoryScene } from "@/types";

/**
 * Scene image card — displays a single scene's image with
 * regeneration controls and full-size preview dialog.
 */

interface SceneImageCardProps {
  scene: StoryScene;
  projectId: string;
  onImageUpdated: (sceneId: string, imageUrl: string) => void;
}

export function SceneImageCard({
  scene,
  projectId,
  onImageUpdated,
}: SceneImageCardProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/scenes/${scene.id}/generate-image`,
        { method: "POST" }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to regenerate image");
      }
      const data = await response.json();
      onImageUpdated(scene.id, data.scene.imageUrl);
      toast.success(`Scene ${scene.order} image regenerated!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to regenerate image"
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Badge variant="secondary" className="text-xs">
            Scene {scene.order}
          </Badge>
          <div className="flex gap-1">
            {scene.imageUrl && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFullImage(true)}
                title="View full size"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              title={scene.imageUrl ? "Regenerate image" : "Generate image"}
            >
              {isRegenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {scene.imageUrl ? (
            <div
              className="cursor-pointer overflow-hidden rounded-md bg-muted"
              onClick={() => setShowFullImage(true)}
            >
              <img
                src={scene.imageUrl}
                alt={`Scene ${scene.order}`}
                className="aspect-video w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-md border border-dashed bg-muted/50">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="h-8 w-8" />
                <p className="text-xs">No image generated</p>
              </div>
            </div>
          )}
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
            {scene.visualPrompt}
          </p>
        </CardContent>
      </Card>

      {/* Full-size image dialog */}
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Scene {scene.order}</DialogTitle>
          </DialogHeader>
          {scene.imageUrl && (
            <img
              src={scene.imageUrl}
              alt={`Scene ${scene.order}`}
              className="w-full rounded-md"
            />
          )}
          <p className="text-sm text-muted-foreground">
            {scene.visualPrompt}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
