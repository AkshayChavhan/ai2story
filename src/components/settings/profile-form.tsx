"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatBytes, formatDate } from "@/lib/utils";

/**
 * Profile form — edit name + read-only account info.
 * Uses react-hook-form + Zod for name validation.
 */

interface ProfileUser {
  name: string | null;
  email: string;
  provider: string | null;
  emailVerified: string | null;
  videosCreated: number;
  storageUsedBytes: number;
  createdAt: string;
}

interface ProfileFormProps {
  user: ProfileUser;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name || "",
    },
  });

  const onSubmit = async (data: UpdateProfileFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const providerLabel =
    user.provider === "google"
      ? "Google"
      : user.provider === "github"
        ? "GitHub"
        : "Email";

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Information</CardTitle>
          <CardDescription>
            Update your display name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium"
              >
                Display Name
              </label>
              <Input
                id="name"
                placeholder="Your name"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
          <CardDescription>
            Your account details and usage statistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm">{user.email}</p>
                {user.emailVerified ? (
                  <Badge className="bg-green-600 text-white hover:bg-green-600">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="destructive">Unverified</Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Auth Provider
              </p>
              <div className="mt-1">
                <Badge variant="secondary">{providerLabel}</Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Member Since
              </p>
              <p className="mt-1 text-sm">
                {formatDate(new Date(user.createdAt))}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Projects Created
              </p>
              <p className="mt-1 text-sm">{user.videosCreated}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Storage Used
              </p>
              <p className="mt-1 text-sm">
                {formatBytes(user.storageUsedBytes)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
