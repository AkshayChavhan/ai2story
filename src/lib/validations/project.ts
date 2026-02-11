import { z } from "zod";

/**
 * Zod validation schemas for project forms and API routes.
 * Used by both client (react-hook-form) and server (API routes) for validation.
 */

const genres = [
  "horror",
  "comedy",
  "romance",
  "sci-fi",
  "fantasy",
  "drama",
  "educational",
  "motivational",
  "fairy-tale",
  "thriller",
  "mystery",
] as const;

const tones = [
  "dark",
  "light",
  "funny",
  "serious",
  "emotional",
  "mysterious",
  "inspirational",
] as const;

const targetAudiences = ["kids", "teens", "adults", "general"] as const;

const imageStyles = [
  "photorealistic",
  "anime",
  "cartoon",
  "cinematic",
  "watercolor",
  "3d-render",
] as const;

const aspectRatios = ["9:16", "16:9", "1:1"] as const;

// ─── Create Project Schema ──────────────────────────────────────────

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  prompt: z
    .string()
    .min(1, "Story prompt is required")
    .max(2000, "Prompt must be at most 2000 characters"),
  genre: z.enum(genres).optional(),
  tone: z.enum(tones).optional(),
  targetAudience: z.enum(targetAudiences).optional(),
  targetLength: z.coerce
    .number()
    .min(30, "Minimum length is 30 seconds")
    .max(300, "Maximum length is 300 seconds")
    .optional(),
  language: z.string().default("en"),
  imageStyle: z.enum(imageStyles).default("photorealistic"),
  aspectRatio: z.enum(aspectRatios).default("9:16"),
});

// ─── Update Project Schema ──────────────────────────────────────────

export const updateProjectSchema = createProjectSchema.partial();

// ─── Inferred Types ─────────────────────────────────────────────────

export type CreateProjectFormData = z.input<typeof createProjectSchema>;
export type UpdateProjectFormData = z.input<typeof updateProjectSchema>;

// ─── Option Arrays for Form Selects ─────────────────────────────────

export const genreOptions = genres.map((g) => ({ value: g, label: g.replace("-", " ") }));
export const toneOptions = tones.map((t) => ({ value: t, label: t }));
export const audienceOptions = targetAudiences.map((a) => ({ value: a, label: a }));
export const imageStyleOptions = imageStyles.map((s) => ({ value: s, label: s.replace("-", " ") }));
export const aspectRatioOptions = aspectRatios.map((r) => ({ value: r, label: r }));
