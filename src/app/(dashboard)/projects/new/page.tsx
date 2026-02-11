import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { CreateForm } from "@/components/projects/create-form";

/**
 * New Project Page — StoryForge AI
 * Server Component: auth check, renders page header + client CreateForm.
 */
export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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
          Set up your story project. You can always edit these settings later.
        </p>
      </div>

      <CreateForm />
    </div>
  );
}
