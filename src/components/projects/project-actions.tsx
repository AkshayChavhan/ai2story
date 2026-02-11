"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { DeleteDialog } from "@/components/projects/delete-dialog";
import { cn } from "@/lib/utils";

/**
 * Project action buttons — Edit and Delete.
 * Client component to handle the delete dialog state.
 */

interface ProjectActionsProps {
  projectId: string;
  projectTitle: string;
}

export function ProjectActions({ projectId, projectTitle }: ProjectActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
