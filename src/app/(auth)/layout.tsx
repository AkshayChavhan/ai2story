import Link from "next/link";

/**
 * Auth Layout — wraps all auth pages (login, signup, forgot-password, etc.)
 * Centers content and adds StoryForge AI branding.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">
            StoryForge <span className="text-primary">AI</span>
          </span>
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
