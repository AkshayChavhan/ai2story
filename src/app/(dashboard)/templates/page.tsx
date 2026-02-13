import { TemplateList } from "@/components/templates/template-list";

/**
 * Story Templates — StoryForge AI
 * Browse pre-built story templates to create projects quickly.
 */
export default function TemplatesPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Story Templates
        </h1>
        <p className="mt-1 text-muted-foreground">
          Browse pre-built story templates to get started quickly.
        </p>
      </div>
      <TemplateList />
    </div>
  );
}
