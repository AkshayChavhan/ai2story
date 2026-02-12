/**
 * AI Image Generator — Uses Pollinations.ai (free, no API key) for scene images.
 * Fallback: Hugging Face Inference API (free tier).
 *
 * Generates images for each story scene based on the visual prompt.
 */

interface ImageGenerationParams {
  prompt: string;
  width?: number;
  height?: number;
  model?: string;
  style?: string;
}

/**
 * Generate an image using Pollinations.ai (completely free, no API key needed).
 * Returns the image URL directly.
 */
export function getPollinationsImageUrl(params: ImageGenerationParams): string {
  const {
    prompt,
    width = 1024,
    height = 1792,
    model = "flux",
  } = params;

  // Pollinations.ai generates images via URL — no API key needed
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&nologo=true`;
}

/**
 * Download an image from Pollinations.ai and return as Buffer.
 */
export async function generateImage(
  params: ImageGenerationParams
): Promise<Buffer> {
  const imageUrl = getPollinationsImageUrl(params);

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Image generation failed: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate an image using Hugging Face Inference API (fallback).
 * Requires HUGGINGFACE_TOKEN environment variable.
 */
export async function generateImageHuggingFace(
  prompt: string
): Promise<Buffer> {
  const token = process.env.HUGGINGFACE_TOKEN;
  if (!token) {
    throw new Error("HUGGINGFACE_TOKEN is not configured");
  }

  const response = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Get the appropriate image dimensions based on aspect ratio.
 */
export function getImageDimensions(aspectRatio: string): {
  width: number;
  height: number;
} {
  switch (aspectRatio) {
    case "9:16": // Portrait (TikTok, Reels, Shorts)
      return { width: 1024, height: 1792 };
    case "16:9": // Landscape (YouTube)
      return { width: 1792, height: 1024 };
    case "1:1": // Square (Instagram)
      return { width: 1024, height: 1024 };
    default:
      return { width: 1024, height: 1792 };
  }
}
