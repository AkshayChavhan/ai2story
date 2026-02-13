"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles } from "lucide-react";
import { capitalize } from "@/lib/utils";
import type { StoryTemplate } from "@/types";

/**
 * Template card — displays template preview with title, description,
 * genre badge, prompt excerpt, and "Use Template" button.
 */

interface TemplateCardProps {
  template: StoryTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="flex h-full flex-col transition-colors hover:bg-accent/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-base">
            {template.title}
          </CardTitle>
          <Badge variant="secondary" className="shrink-0 capitalize">
            {capitalize(template.genre.replace("-", " "))}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {template.description}
        </p>
        <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2.5">
          <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="line-clamp-3 text-xs text-muted-foreground">
            {template.prompt}
          </p>
        </div>
        <div className="mt-auto pt-2">
          <Link href={`/projects/new?templateId=${template.id}`}>
            <Button className="w-full gap-2" size="sm">
              <Sparkles className="h-4 w-4" />
              Use Template
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
