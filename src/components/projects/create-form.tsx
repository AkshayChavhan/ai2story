"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProjectSchema,
  type CreateProjectFormData,
  genreOptions,
  toneOptions,
  audienceOptions,
  imageStyleOptions,
  aspectRatioOptions,
} from "@/lib/validations/project";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { capitalize } from "@/lib/utils";

/**
 * Create project form — react-hook-form + Zod validation.
 * Posts to /api/projects and redirects to the new project on success.
 */

export function CreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      prompt: "",
      language: "en",
      imageStyle: "photorealistic",
      aspectRatio: "9:16",
    },
  });

  const onSubmit = async (data: CreateProjectFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create project");
      }

      toast.success("Project created successfully!");
      router.push(`/projects/${result.project.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create project"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Story Details</CardTitle>
          <CardDescription>
            Give your story a title and describe what you want to create.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              placeholder="My Amazing Story"
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="A brief description of your story..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="prompt" className="mb-1.5 block text-sm font-medium">
              Story Prompt <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="prompt"
              placeholder="Describe your story idea in detail. The AI will use this to generate scenes, visuals, and narration..."
              rows={5}
              {...register("prompt")}
            />
            {errors.prompt && (
              <p className="mt-1 text-sm text-destructive">{errors.prompt.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Story Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Story Settings</CardTitle>
          <CardDescription>
            Configure the genre, tone, and target audience for your story.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="genre" className="mb-1.5 block text-sm font-medium">
              Genre
            </label>
            <Select id="genre" {...register("genre")}>
              <option value="">Select genre...</option>
              {genreOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {capitalize(opt.label)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="tone" className="mb-1.5 block text-sm font-medium">
              Tone
            </label>
            <Select id="tone" {...register("tone")}>
              <option value="">Select tone...</option>
              {toneOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {capitalize(opt.label)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="targetAudience" className="mb-1.5 block text-sm font-medium">
              Target Audience
            </label>
            <Select id="targetAudience" {...register("targetAudience")}>
              <option value="">Select audience...</option>
              {audienceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {capitalize(opt.label)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="targetLength" className="mb-1.5 block text-sm font-medium">
              Target Length (seconds)
            </label>
            <Input
              id="targetLength"
              type="number"
              placeholder="60"
              min={30}
              max={300}
              {...register("targetLength")}
            />
            {errors.targetLength && (
              <p className="mt-1 text-sm text-destructive">{errors.targetLength.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visual Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visual Settings</CardTitle>
          <CardDescription>
            Choose the image style and aspect ratio for your video.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="imageStyle" className="mb-1.5 block text-sm font-medium">
              Image Style
            </label>
            <Select id="imageStyle" {...register("imageStyle")}>
              {imageStyleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {capitalize(opt.label)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="aspectRatio" className="mb-1.5 block text-sm font-medium">
              Aspect Ratio
            </label>
            <Select id="aspectRatio" {...register("aspectRatio")}>
              {aspectRatioOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Project
        </Button>
      </div>
    </form>
  );
}
