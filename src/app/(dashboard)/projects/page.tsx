import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { ProjectList } from "@/components/projects/project-list";
import { cn } from "@/lib/utils";

/**
 * Projects List Page — StoryForge AI
 * Server Component: auth check, renders page header + client ProjectList.
 */
export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            My Projects
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your story projects.
          </p>
        </div>
        <Link
          href="/projects/new"
          className={cn(buttonVariants({ size: "lg" }), "gap-2")}
        >
          <Plus className="h-4 w-4" />
          New Story
        </Link>
      </div>

      <ProjectList />
    </div>
  );
}
