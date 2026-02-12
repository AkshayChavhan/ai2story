"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Volume2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { VoiceSelector } from "@/components/voice/voice-selector";
import { SceneVoiceCard } from "@/components/voice/scene-voice-card";
import type { StoryScene } from "@/types";

/**
 * Voice gallery — grid of scene voice cards with default voice settings
 * and batch generation. Uses local state (not Zustand).
 */

interface VoiceGalleryProps {
  projectId: string;
  initialScenes: StoryScene[];
}

export function VoiceGallery({ projectId, initialScenes }: VoiceGalleryProps) {
  const [scenes, setScenes] = useState<StoryScene[]>(initialScenes);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [defaultVoiceId, setDefaultVoiceId] = useState("en-US-AriaNeural");
  const [defaultSpeed, setDefaultSpeed] = useState(1.0);
  const [defaultPitch, setDefaultPitch] = useState("+0Hz");

  const hasAnyAudio = scenes.some((s) => s.audioUrl);
  const audioCount = scenes.filter((s) => s.audioUrl).length;

  const handleAudioUpdated = (sceneId: string, audioUrl: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, audioUrl } : s))
    );
  };

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/generate-voices`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voiceId: defaultVoiceId,
            speed: defaultSpeed,
            pitch: defaultPitch,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate voices");
      }

      const data = await response.json();

      // Map API response to StoryScene type
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
        toast.warning(`Generated ${success} voices, ${failed} failed`);
      } else {
        toast.success(`Generated ${success} scene voices!`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate voices"
      );
    } finally {
      setIsGeneratingAll(false);
    }
  };

  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-12">
        <Volume2 className="h-10 w-10 text-muted-foreground" />
        <p className="text-center text-lg font-medium text-foreground">
          No scenes yet
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Generate story scenes first, then come back to add voice narration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with default voice settings */}
      <div className="space-y-4 rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {hasAnyAudio
              ? `${audioCount} of ${scenes.length} scene${scenes.length !== 1 ? "s" : ""} have audio`
              : `${scenes.length} scene${scenes.length !== 1 ? "s" : ""} ready for voice generation`}
          </p>
          <Button
            onClick={handleGenerateAll}
            disabled={isGeneratingAll}
            className="gap-1.5"
          >
            {isGeneratingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : hasAnyAudio ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            {isGeneratingAll
              ? "Generating..."
              : hasAnyAudio
                ? "Regenerate All"
                : "Generate All Voices"}
          </Button>
        </div>

        {/* Default voice settings */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Default Voice
          </p>
          <VoiceSelector
            selectedVoiceId={defaultVoiceId}
            onVoiceChange={setDefaultVoiceId}
            disabled={isGeneratingAll}
          />
          <div className="flex gap-2">
            <div className="w-24">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Speed
              </label>
              <Input
                type="number"
                value={defaultSpeed}
                onChange={(e) =>
                  setDefaultSpeed(parseFloat(e.target.value) || 1.0)
                }
                min={0.5}
                max={2.0}
                step={0.1}
                disabled={isGeneratingAll}
                className="h-8 text-xs"
              />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Pitch
              </label>
              <Input
                value={defaultPitch}
                onChange={(e) => setDefaultPitch(e.target.value)}
                placeholder="+0Hz"
                disabled={isGeneratingAll}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of scene voice cards */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {scenes.map((scene) => (
          <SceneVoiceCard
            key={scene.id}
            scene={scene}
            projectId={projectId}
            defaultVoiceId={defaultVoiceId}
            onAudioUpdated={handleAudioUpdated}
          />
        ))}
      </div>
    </div>
  );
}
