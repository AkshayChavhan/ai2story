import { z } from "zod";

/**
 * Zod validation schemas for scene forms and API routes.
 */

// ─── Scene Schema ───────────────────────────────────────────────────

export const sceneSchema = z.object({
  narrationText: z
    .string()
    .min(1, "Narration text is required")
    .max(2000, "Narration text must be at most 2000 characters"),
  visualPrompt: z
    .string()
    .min(1, "Visual prompt is required")
    .max(2000, "Visual prompt must be at most 2000 characters"),
  cameraDirection: z
    .string()
    .max(200, "Camera direction must be at most 200 characters")
    .optional()
    .or(z.literal("")),
  mood: z
    .string()
    .max(100, "Mood must be at most 100 characters")
    .optional()
    .or(z.literal("")),
  duration: z.coerce
    .number()
    .min(1, "Minimum duration is 1 second")
    .max(60, "Maximum duration is 60 seconds")
    .optional(),
});

// ─── Update Scene Schema ────────────────────────────────────────────

export const updateSceneSchema = sceneSchema.partial();

// ─── Bulk Scenes Schema ─────────────────────────────────────────────

export const bulkScenesSchema = z.object({
  scenes: z.array(
    sceneSchema.extend({
      order: z.number().min(1),
    })
  ),
});

// ─── Inferred Types ─────────────────────────────────────────────────

export type SceneFormData = z.input<typeof sceneSchema>;
export type UpdateSceneFormData = z.input<typeof updateSceneSchema>;
export type BulkScenesData = z.input<typeof bulkScenesSchema>;
