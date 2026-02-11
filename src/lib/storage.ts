import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * File storage utility for StoryForge AI.
 * MVP uses local disk storage. Can be swapped to Cloudflare R2 or Uploadthing later.
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Ensure the upload directory exists.
 */
async function ensureUploadDir(subDir?: string) {
  const dir = subDir ? path.join(UPLOAD_DIR, subDir) : UPLOAD_DIR;
  await mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Save a file to local storage and return the public URL path.
 */
export async function saveFile(
  buffer: Buffer,
  fileName: string,
  subDir: string = "general"
): Promise<string> {
  const dir = await ensureUploadDir(subDir);
  const ext = path.extname(fileName);
  const uniqueName = `${uuidv4()}${ext}`;
  const filePath = path.join(dir, uniqueName);

  await writeFile(filePath, buffer);

  // Return the public URL path
  return `/uploads/${subDir}/${uniqueName}`;
}

/**
 * Save an image from a URL (e.g., from Pollinations.ai).
 */
export async function saveImageFromUrl(
  imageUrl: string,
  subDir: string = "images"
): Promise<string> {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return saveFile(buffer, "image.png", subDir);
}

/**
 * Save audio buffer to local storage.
 */
export async function saveAudio(
  buffer: Buffer,
  subDir: string = "audio"
): Promise<string> {
  return saveFile(buffer, "audio.mp3", subDir);
}
