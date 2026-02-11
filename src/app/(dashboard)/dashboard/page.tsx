import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { cn } from "@/lib/utils";

/**
 * Dashboard Home — StoryForge AI
 * Server Component: fetches user stats and recent projects via Prisma.
 */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, recentProjects, totalProjects] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        videosCreated: true,
        storageUsedBytes: true,
      },
    }),
    prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        genre: true,
        updatedAt: true,
      },
    }),
    prisma.project.count({
      where: { userId: session.user.id },
    }),
  ]);

  const displayName =
    user?.name ||
    session.user.name ||
    session.user.email?.split("@")[0] ||
    "Creator";

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening with your stories.
          </p>
        </div>
        <Link
          href="/projects/new"
          className={cn(buttonVariants({ size: "lg" }), "gap-2")}
        >
          <Plus className="h-4 w-4" />
          Create New Story
        </Link>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalProjects={totalProjects}
        videosCreated={user?.videosCreated ?? 0}
        storageUsedBytes={user?.storageUsedBytes ?? 0}
      />

      {/* Recent Projects */}
      <RecentProjects projects={recentProjects} />
    </div>
  );
}
