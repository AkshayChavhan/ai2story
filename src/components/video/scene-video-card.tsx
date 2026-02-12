"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film } from "lucide-react";
import type { StoryScene } from "@/types";

/**
 * Scene video card — displays a single scene's video clip
 * with native HTML5 video player or placeholder.
 */

interface SceneVideoCardProps {
  scene: StoryScene;
}

export function SceneVideoCard({ scene }: SceneVideoCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Badge variant="secondary" className="text-xs">
          Scene {scene.order}
        </Badge>
      </CardHeader>
      <CardContent>
        {scene.videoClipUrl ? (
          <div className="overflow-hidden rounded-md bg-muted">
            <video
              controls
              className="aspect-video w-full"
              src={scene.videoClipUrl}
            >
              Your browser does not support the video element.
            </video>
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-md border border-dashed bg-muted/50">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Film className="h-8 w-8" />
              <p className="text-xs">No video composed</p>
            </div>
          </div>
        )}
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {scene.visualPrompt}
        </p>
      </CardContent>
    </Card>
  );
}
