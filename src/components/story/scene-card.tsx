"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/project-store";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pencil,
  Check,
  ChevronUp,
  ChevronDown,
  Trash2,
  Clock,
  Camera,
  Palette,
  ImageIcon,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { StoryScene } from "@/types";

/**
 * Scene card — displays a single scene with display/edit mode,
 * reorder controls, and delete confirmation.
 */

interface SceneCardProps {
  scene: StoryScene;
  projectId: string;
  index: number;
  totalScenes: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export function SceneCard({
  scene,
  projectId,
  index,
  totalScenes,
  onMoveUp,
  onMoveDown,
  onDelete,
}: SceneCardProps) {
  const updateScene = useProjectStore((s) => s.updateScene);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);

  const handleRegenerateImage = async () => {
    setIsRegeneratingImage(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/scenes/${scene.id}/generate-image`,
        { method: "POST" }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate image");
      }
      const data = await response.json();
      updateScene(scene.id, { imageUrl: data.scene.imageUrl });
      toast.success(`Scene ${scene.order} image generated!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate image"
      );
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  // Local edit state
  const [narrationText, setNarrationText] = useState(scene.narrationText);
  const [visualPrompt, setVisualPrompt] = useState(scene.visualPrompt);
  const [cameraDirection, setCameraDirection] = useState(
    scene.cameraDirection || ""
  );
  const [mood, setMood] = useState(scene.mood || "");
  const [duration, setDuration] = useState(scene.duration?.toString() || "");

  const handleStartEdit = () => {
    setNarrationText(scene.narrationText);
    setVisualPrompt(scene.visualPrompt);
    setCameraDirection(scene.cameraDirection || "");
    setMood(scene.mood || "");
    setDuration(scene.duration?.toString() || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    updateScene(scene.id, {
      narrationText,
      visualPrompt,
      cameraDirection: cameraDirection || undefined,
      mood: mood || undefined,
      duration: duration ? parseFloat(duration) : undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Scene {scene.order}
            </Badge>
            {scene.duration && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {scene.duration}s
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSave}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRegenerateImage}
                  disabled={isRegeneratingImage}
                  title={scene.imageUrl ? "Regenerate image" : "Generate image"}
                >
                  {isRegeneratingImage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStartEdit}
                  title="Edit scene"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMoveUp}
                  disabled={index === 0}
                  title="Move up"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMoveDown}
                  disabled={index === totalScenes - 1}
                  title="Move down"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  title="Delete scene"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isEditing ? (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Narration Text
                </label>
                <Textarea
                  value={narrationText}
                  onChange={(e) => setNarrationText(e.target.value)}
                  rows={3}
                  placeholder="The narration text to be spoken..."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Visual Prompt
                </label>
                <Textarea
                  value={visualPrompt}
                  onChange={(e) => setVisualPrompt(e.target.value)}
                  rows={3}
                  placeholder="Detailed image generation prompt..."
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Camera Direction
                  </label>
                  <Input
                    value={cameraDirection}
                    onChange={(e) => setCameraDirection(e.target.value)}
                    placeholder="e.g., close-up"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Mood
                  </label>
                  <Input
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="e.g., mysterious"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Duration (seconds)
                  </label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="8"
                    min={1}
                    max={60}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Image preview */}
              {scene.imageUrl ? (
                <div className="overflow-hidden rounded-md bg-muted">
                  <img
                    src={scene.imageUrl}
                    alt={`Scene ${scene.order}`}
                    className="w-full object-cover"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded-md border border-dashed bg-muted/30">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" />
                    No image
                  </span>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Narration
                </p>
                <p className="mt-0.5 text-sm text-foreground">
                  {scene.narrationText}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Visual Prompt
                </p>
                <p className="mt-0.5 text-sm text-foreground/80">
                  {scene.visualPrompt}
                </p>
              </div>
              {(scene.cameraDirection || scene.mood) && (
                <div className="flex flex-wrap gap-2">
                  {scene.cameraDirection && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Camera className="h-3 w-3" />
                      {scene.cameraDirection}
                    </Badge>
                  )}
                  {scene.mood && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Palette className="h-3 w-3" />
                      {scene.mood}
                    </Badge>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scene {scene.order}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scene? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDeleteDialog(false);
                onDelete();
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
