import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateForm } from "@/components/projects/create-form";

/**
 * New Project Page — StoryForge AI
 * Server Component: auth check, optional template pre-fill, renders CreateForm.
 * Supports ?templateId= query param to pre-fill form from a story template.
 */
export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ templateId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { templateId } = await searchParams;

  // Fetch template data if templateId is provided
  let templateData: {
    title: string;
    description: string;
    prompt: string;
    genre: string;
  } | null = null;

  if (templateId) {
    const template = await prisma.storyTemplate.findUnique({
      where: { id: templateId },
      select: { title: true, description: true, prompt: true, genre: true },
    });
    if (template) {
      templateData = template;
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 lg:p-8">
      <div>
        <Link
          href="/projects"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Create New Story
        </h1>
        <p className="mt-1 text-muted-foreground">
          {templateData
            ? "Pre-filled from template. Edit any fields before creating."
            : "Set up your story project. You can always edit these settings later."}
        </p>
      </div>

      <CreateForm templateData={templateData} />
    </div>
  );
}
