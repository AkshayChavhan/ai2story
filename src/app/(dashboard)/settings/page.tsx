import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";
import { Separator } from "@/components/ui/separator";

/**
 * Settings — StoryForge AI
 * Server Component: auth check, fetch user profile, render forms.
 */
export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      avatar: true,
      provider: true,
      emailVerified: true,
      passwordHash: true,
      videosCreated: true,
      storageUsedBytes: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  const profileUser = {
    name: user.name,
    email: user.email,
    provider: user.provider,
    emailVerified: user.emailVerified?.toISOString() ?? null,
    videosCreated: user.videosCreated,
    storageUsedBytes: user.storageUsedBytes,
    createdAt: user.createdAt.toISOString(),
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile and security settings.
        </p>
      </div>

      <ProfileForm user={profileUser} />

      <Separator />

      <PasswordForm hasPassword={!!user.passwordHash} />
    </div>
  );
}
