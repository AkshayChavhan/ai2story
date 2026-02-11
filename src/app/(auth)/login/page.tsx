/**
 * Login Page — StoryForge AI
 * Supports email/password and OAuth (Google, GitHub).
 * Will be fully implemented in feat:1_auth-system.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your StoryForge AI account
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Login form will be implemented in feat:1_auth-system
        </p>
      </div>
    </div>
  );
}
