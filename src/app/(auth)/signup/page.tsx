import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/forms/auth/signup-form";
import { OAuthButtons } from "@/components/forms/auth/oauth-buttons";

/**
 * Signup Page — StoryForge AI
 * New user registration with email/password and OAuth.
 */
export default function SignupPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Get started with StoryForge AI for free
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <OAuthButtons />
        <SignupForm />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
