"use client";

import { useState } from "react";
import {
  Download,
  FileArchive,
  Film,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/**
 * Export panel — provides download options for project video and asset bundle.
 * Two download modes:
 *   1. Download Video — direct download of final composed video (client-side anchor)
 *   2. Download ZIP Bundle — all assets via POST /api/projects/[id]/export
 */

interface ExportPanelProps {
  projectId: string;
  projectTitle: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  resolution: string | null;
  duration: number | null;
  sceneCount: number;
  imageCount: number;
  audioCount: number;
  clipCount: number;
}

export function ExportPanel({
  projectId,
  projectTitle,
  videoUrl,
  thumbnailUrl,
  resolution,
  duration,
  sceneCount,
  imageCount,
  audioCount,
  clipCount,
}: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);

  const hasVideo = Boolean(videoUrl);

  const handleDownloadVideo = () => {
    if (!videoUrl) return;
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `${projectTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}_storyforge.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Video download started");
  };

  const handleDownloadZip = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create export");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}_storyforge.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Project bundle downloaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export project"
      );
    } finally {
      setIsExporting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Video Preview */}
      {hasVideo ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Video Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg bg-muted">
              <video
                controls
                className="w-full"
                src={videoUrl!}
                poster={thumbnailUrl || undefined}
              >
                Your browser does not support the video element.
              </video>
            </div>
            {(resolution || duration) && (
              <div className="mt-3 flex items-center gap-3">
                {resolution && (
                  <Badge variant="secondary">{resolution}</Badge>
                )}
                {duration != null && (
                  <Badge variant="secondary">{formatDuration(duration)}</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-center text-lg font-medium text-foreground">
              No video to download
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Compose your video first from the Story Editor or Video Composer
              page.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Download Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Download Video</CardTitle>
            </div>
            <CardDescription>
              Download the final composed video as an MP4 file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleDownloadVideo}
              disabled={!hasVideo}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              Download MP4
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileArchive className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Download All Assets</CardTitle>
            </div>
            <CardDescription>
              Download a ZIP bundle with all images, audio, video clips, final
              video, and project metadata.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleDownloadZip}
              disabled={!hasVideo || isExporting}
              variant="outline"
              className="w-full gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileArchive className="h-4 w-4" />
              )}
              {isExporting ? "Preparing ZIP..." : "Download ZIP"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Asset Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Asset Summary</CardTitle>
          <CardDescription>
            Assets included in the ZIP bundle download.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span className="text-sm text-muted-foreground">Images</span>
              <Badge
                variant={
                  imageCount === sceneCount && sceneCount > 0
                    ? "default"
                    : "secondary"
                }
              >
                {imageCount}/{sceneCount}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span className="text-sm text-muted-foreground">Audio</span>
              <Badge
                variant={
                  audioCount === sceneCount && sceneCount > 0
                    ? "default"
                    : "secondary"
                }
              >
                {audioCount}/{sceneCount}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span className="text-sm text-muted-foreground">Video Clips</span>
              <Badge
                variant={
                  clipCount === sceneCount && sceneCount > 0
                    ? "default"
                    : "secondary"
                }
              >
                {clipCount}/{sceneCount}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span className="text-sm text-muted-foreground">Final Video</span>
              <Badge variant={hasVideo ? "default" : "secondary"}>
                {hasVideo && <CheckCircle2 className="mr-1 h-3 w-3" />}
                {hasVideo ? "Ready" : "Not ready"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
