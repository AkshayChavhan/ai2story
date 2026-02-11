/**
 * Signup Page — StoryForge AI
 * New user registration with email/password.
 * Will be fully implemented in feat:1_auth-system.
 */
export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started with StoryForge AI for free
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Signup form will be implemented in feat:1_auth-system
        </p>
      </div>
    </div>
  );
}
