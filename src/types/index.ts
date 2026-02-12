/**
 * Shared TypeScript type definitions for StoryForge AI.
 */

// ─── Story Parameters ────────────────────────────────────────────────

export type Genre =
  | "horror"
  | "comedy"
  | "romance"
  | "sci-fi"
  | "fantasy"
  | "drama"
  | "educational"
  | "motivational"
  | "fairy-tale"
  | "thriller"
  | "mystery";

export type Tone =
  | "dark"
  | "light"
  | "funny"
  | "serious"
  | "emotional"
  | "mysterious"
  | "inspirational";

export type TargetAudience = "kids" | "teens" | "adults" | "general";

export type ImageStyle =
  | "photorealistic"
  | "anime"
  | "cartoon"
  | "cinematic"
  | "watercolor"
  | "3d-render";

export type AspectRatio = "9:16" | "16:9" | "1:1";

export type ProjectStatus =
  | "draft"
  | "in-progress"
  | "processing"
  | "completed"
  | "archived";

// ─── Story & Scene Types ─────────────────────────────────────────────

export interface StoryScene {
  id: string;
  order: number;
  narrationText: string;
  visualPrompt: string;
  cameraDirection?: string;
  mood?: string;
  duration?: number;
  imageUrl?: string;
  audioUrl?: string;
  videoClipUrl?: string;
}

export interface StoryProject {
  id: string;
  title: string;
  description?: string;
  prompt: string;
  status: ProjectStatus;
  genre?: Genre;
  tone?: Tone;
  targetLength?: number;
  targetAudience?: TargetAudience;
  language: string;
  imageStyle: ImageStyle;
  aspectRatio: AspectRatio;
  scenes: StoryScene[];
  videoUrl?: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Media Types ────────────────────────────────────────────────────

export type MediaType = "image" | "audio" | "video";

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  projectId: string;
  projectTitle: string;
  sceneOrder: number;
  createdAt: string;
}

// ─── API Response Types ──────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Voice Types ─────────────────────────────────────────────────────

export interface VoiceOption {
  id: string;
  name: string;
  language: string;
  gender: string;
  locale: string;
}

// ─── Processing Status (SSE) ─────────────────────────────────────────

export type ProcessingStep =
  | "story"
  | "images"
  | "voice"
  | "video"
  | "complete";

export interface ProcessingStatus {
  step: ProcessingStep;
  progress: number; // 0-100
  message: string;
  sceneIndex?: number;
  totalScenes?: number;
}
