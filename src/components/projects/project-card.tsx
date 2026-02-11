import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Film } from "lucide-react";
import { formatRelativeTime, capitalize } from "@/lib/utils";

/**
 * Project card for the projects grid.
 * Displays title, description excerpt, status badge, genre, and timestamps.
 */

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    genre: string | null;
    updatedAt: string;
    _count: {
      scenes: number;
    };
  };
}

function getStatusVariant(
  status: string
): "default" | "secondary" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "in-progress":
    case "processing":
      return "secondary";
    case "draft":
    default:
      return "outline";
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} className="block">
      <Card className="h-full transition-colors hover:bg-accent/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base">
              {project.title}
            </CardTitle>
            <Badge variant={getStatusVariant(project.status)}>
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {project.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {project.genre && (
              <span className="capitalize">{capitalize(project.genre.replace("-", " "))}</span>
            )}
            {project._count.scenes > 0 && (
              <span className="flex items-center gap-1">
                <Film className="h-3 w-3" />
                {project._count.scenes} scene{project._count.scenes !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(new Date(project.updatedAt))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
