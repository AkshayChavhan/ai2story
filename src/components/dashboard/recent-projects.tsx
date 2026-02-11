import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Clock, ArrowRight } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

/**
 * Recent projects list — displays the 5 most recent projects.
 * Server Component — receives data as props.
 */

interface RecentProject {
  id: string;
  title: string;
  status: string;
  genre: string | null;
  updatedAt: Date;
}

interface RecentProjectsProps {
  projects: RecentProject[];
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

export function RecentProjects({ projects }: RecentProjectsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Projects</CardTitle>
        {projects.length > 0 && (
          <Link
            href="/projects"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View All
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No projects yet.</p>
            <Link
              href="/projects/new"
              className={cn(buttonVariants({ variant: "default" }), "mt-4 gap-2")}
            >
              <Plus className="h-4 w-4" />
              Create Your First Story
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-accent"
              >
                <div>
                  <p className="font-medium">{project.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={getStatusVariant(project.status)}>
                      {project.status}
                    </Badge>
                    {project.genre && (
                      <span className="text-xs text-muted-foreground capitalize">
                        {project.genre}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(project.updatedAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
