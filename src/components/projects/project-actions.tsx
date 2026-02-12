"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, FileArchive, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { DeleteDialog } from "@/components/projects/delete-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Project action buttons — Edit, Download/Export, and Delete.
 * Client component to handle the delete dialog state and video download.
 */

interface ProjectActionsProps {
  projectId: string;
  projectTitle: string;
  videoUrl?: string | null;
}

export function ProjectActions({ projectId, projectTitle, videoUrl }: ProjectActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const hasVideo = Boolean(videoUrl);

  const handleDownload = () => {
    if (hasVideo) {
      const link = document.createElement("a");
      link.href = videoUrl!;
      link.download = `${projectTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}_storyforge.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Video download started");
    } else {
      router.push(`/projects/${projectId}/share`);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          href={`/projects/${projectId}/story`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Story
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleDownload}
        >
          {hasVideo ? (
            <Download className="h-3.5 w-3.5" />
          ) : (
            <FileArchive className="h-3.5 w-3.5" />
          )}
          {hasVideo ? "Download" : "Export"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>

      <DeleteDialog
        projectId={projectId}
        projectTitle={projectTitle}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDeleted={() => router.push("/projects")}
      />
    </>
  );
}
