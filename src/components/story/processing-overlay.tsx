"use client";

import { useProjectStore } from "@/store/project-store";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { capitalize } from "@/lib/utils";

/**
 * Processing overlay — shows animated progress bar during AI generation.
 * Reads processingStatus from the Zustand store.
 */
export function ProcessingOverlay() {
  const processingStatus = useProjectStore((s) => s.processingStatus);

  if (!processingStatus) return null;

  return (
    <Card>
      <CardContent className="py-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="w-full max-w-md space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {capitalize(processingStatus.step)}
              </span>
              <span className="text-muted-foreground">
                {processingStatus.progress}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${processingStatus.progress}%` }}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {processingStatus.message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
