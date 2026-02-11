/**
 * Email Verification Page — StoryForge AI
 * Will be fully implemented in feat:1_auth-system.
 */
export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Verify Email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Verifying your email address...
          </p>
        </div>
      </div>
    </div>
  );
}
