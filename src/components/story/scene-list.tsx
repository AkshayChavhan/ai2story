"use client";

import { useProjectStore } from "@/store/project-store";
import { SceneCard } from "@/components/story/scene-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * Scene list — renders all scenes with reorder and add controls.
 */
export function SceneList() {
  const scenes = useProjectStore((s) => s.scenes);
  const currentProject = useProjectStore((s) => s.currentProject);
  const reorderScenes = useProjectStore((s) => s.reorderScenes);
  const removeScene = useProjectStore((s) => s.removeScene);
  const addScene = useProjectStore((s) => s.addScene);

  const handleAddScene = () => {
    addScene({
      id: crypto.randomUUID(),
      order: scenes.length + 1,
      narrationText: "",
      visualPrompt: "",
    });
  };

  return (
    <div className="space-y-4">
      {scenes.map((scene, index) => (
        <SceneCard
          key={scene.id}
          scene={scene}
          projectId={currentProject?.id || ""}
          index={index}
          totalScenes={scenes.length}
          onMoveUp={() => reorderScenes(index, index - 1)}
          onMoveDown={() => reorderScenes(index, index + 1)}
          onDelete={() => removeScene(scene.id)}
        />
      ))}

      <Button
        variant="outline"
        onClick={handleAddScene}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-4 w-4" />
        Add Scene
      </Button>
    </div>
  );
}
