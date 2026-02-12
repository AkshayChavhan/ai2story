"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/project-store";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

/**
 * Save button — bulk saves all scenes to the database.
 */

interface SaveButtonProps {
  projectId: string;
}

export function SaveButton({ projectId }: SaveButtonProps) {
  const scenes = useProjectStore((s) => s.scenes);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (scenes.length === 0) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/scenes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenes: scenes.map((scene) => ({
            order: scene.order,
            narrationText: scene.narrationText,
            visualPrompt: scene.visualPrompt,
            cameraDirection: scene.cameraDirection || "",
            mood: scene.mood || "",
            duration: scene.duration || undefined,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save scenes");
      }

      toast.success("Scenes saved successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save scenes"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSave}
      disabled={isSaving || scenes.length === 0}
      className="gap-1.5"
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      Save Scenes
    </Button>
  );
}
