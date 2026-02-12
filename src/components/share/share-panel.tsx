"use client";

import { useState } from "react";
import { Share2, Copy, Check, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/**
 * Share panel — toggle public sharing and display shareable link.
 * Three states: no video (disabled), video + private, video + public (link shown).
 */

interface SharePanelProps {
  projectId: string;
  initialIsPublic: boolean;
  initialShareToken: string | null;
  videoUrl: string | null;
}

export function SharePanel({
  projectId,
  initialIsPublic,
  initialShareToken,
  videoUrl,
}: SharePanelProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasVideo = Boolean(videoUrl);
  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareToken}`
    : "";

  const handleEnableSharing = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/share`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to enable sharing");
      }
      const data = await res.json();
      setIsPublic(data.isPublic);
      setShareToken(data.shareToken);
      toast.success("Sharing enabled! Your video is now public.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to enable sharing"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableSharing = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/share`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to disable sharing");
      }
      setIsPublic(false);
      setShareToken(null);
      toast.success("Sharing disabled. Your video is now private.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to disable sharing"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Share Project</CardTitle>
          {isPublic && (
            <Badge variant="default" className="ml-auto">
              <Globe className="mr-1 h-3 w-3" />
              Public
            </Badge>
          )}
        </div>
        <CardDescription>
          Share your video with anyone via a public link. No sign-in required to
          view.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasVideo ? (
          <p className="text-sm text-muted-foreground">
            Compose your video first before sharing.
          </p>
        ) : isPublic && shareToken ? (
          <>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                disabled={isLoading}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              variant="destructive"
              onClick={handleDisableSharing}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Disable Sharing
            </Button>
          </>
        ) : (
          <Button
            onClick={handleEnableSharing}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            Enable Sharing
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
