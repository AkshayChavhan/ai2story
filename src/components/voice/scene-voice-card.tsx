"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { VoiceSelector } from "@/components/voice/voice-selector";
import type { StoryScene } from "@/types";

/**
 * Scene voice card — displays a single scene's audio with
 * voice selection, speed/pitch controls, and regeneration.
 */

interface SceneVoiceCardProps {
  scene: StoryScene;
  projectId: string;
  defaultVoiceId: string;
  onAudioUpdated: (sceneId: string, audioUrl: string) => void;
}

export function SceneVoiceCard({
  scene,
  projectId,
  defaultVoiceId,
  onAudioUpdated,
}: SceneVoiceCardProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [voiceId, setVoiceId] = useState(defaultVoiceId);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState("+0Hz");

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/scenes/${scene.id}/generate-voice`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voiceId, speed, pitch }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to regenerate voice");
      }
      const data = await response.json();
      onAudioUpdated(scene.id, data.scene.audioUrl);
      toast.success(`Scene ${scene.order} voice regenerated!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to regenerate voice"
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Badge variant="secondary" className="text-xs">
          Scene {scene.order}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          title={scene.audioUrl ? "Regenerate voice" : "Generate voice"}
        >
          {isRegenerating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Audio player or placeholder */}
        {scene.audioUrl ? (
          <div className="rounded-md bg-muted p-2">
            <audio controls className="w-full" src={scene.audioUrl}>
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : (
          <div className="flex h-16 items-center justify-center rounded-md border border-dashed bg-muted/50">
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Volume2 className="h-6 w-6" />
              <p className="text-xs">No audio generated</p>
            </div>
          </div>
        )}

        {/* Narration text */}
        <p className="line-clamp-3 text-xs text-muted-foreground">
          {scene.narrationText}
        </p>

        {/* Voice controls */}
        <div className="space-y-2">
          <VoiceSelector
            selectedVoiceId={voiceId}
            onVoiceChange={setVoiceId}
            disabled={isRegenerating}
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Speed
              </label>
              <Input
                type="number"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value) || 1.0)}
                min={0.5}
                max={2.0}
                step={0.1}
                disabled={isRegenerating}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Pitch
              </label>
              <Input
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="+0Hz"
                disabled={isRegenerating}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
