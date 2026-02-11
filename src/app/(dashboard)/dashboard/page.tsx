/**
 * Dashboard Home — StoryForge AI
 * Shows quick stats, recent projects, and "Create New Story" CTA.
 * Will be fully implemented in feat:2_dashboard-layout.
 */
export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to StoryForge AI. Your projects and stats will appear here.
      </p>
    </div>
  );
}
