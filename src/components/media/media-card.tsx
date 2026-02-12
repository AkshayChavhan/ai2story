"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Image as ImageIcon, Music, Video } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { MediaItem } from "@/types";

/**
 * Media card — type-specific preview (image/audio/video).
 * Opens the raw media URL in a new tab on click.
 */

interface MediaCardProps {
  item: MediaItem;
}

function getTypeIcon(type: string) {
  switch (type) {
    case "image":
      return <ImageIcon className="h-3 w-3" />;
    case "audio":
      return <Music className="h-3 w-3" />;
    case "video":
      return <Video className="h-3 w-3" />;
    default:
      return null;
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "image":
      return "Image";
    case "audio":
      return "Audio";
    case "video":
      return "Video";
    default:
      return type;
  }
}

export function MediaCard({ item }: MediaCardProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="h-full overflow-hidden transition-colors hover:bg-accent/50">
        {/* Preview area */}
        <div className="relative h-40 bg-muted">
          {item.type === "image" && (
            <img
              src={item.url}
              alt={`Scene ${item.sceneOrder} — ${item.projectTitle}`}
              className="h-full w-full object-cover"
            />
          )}
          {item.type === "audio" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-4">
              <Music className="h-10 w-10 text-muted-foreground" />
              <audio
                controls
                src={item.url}
                className="w-full"
                onClick={(e) => e.preventDefault()}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          {item.type === "video" && (
            <video
              src={item.url}
              className="h-full w-full object-cover"
              muted
              preload="metadata"
            />
          )}
        </div>

        <CardContent className="space-y-2 p-3">
          <p className="line-clamp-1 text-sm font-medium">
            {item.projectTitle}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="gap-1 text-xs">
              {getTypeIcon(item.type)}
              {getTypeLabel(item.type)}
            </Badge>
            <span>Scene {item.sceneOrder + 1}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(new Date(item.createdAt))}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
