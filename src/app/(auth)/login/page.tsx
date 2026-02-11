import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/auth/login-form";
import { OAuthButtons } from "@/components/forms/auth/oauth-buttons";
import { Suspense } from "react";

/**
 * Login Page — StoryForge AI
 * Sign in with email/password or OAuth (Google, GitHub).
 */
export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your StoryForge AI account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <OAuthButtons />
        <Suspense>
          <LoginForm />
        </Suspense>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
