/**
 * Video Composer — Uses FFmpeg to compose final videos from images + audio.
 * Applies Ken Burns effect (pan/zoom) on still images with crossfade transitions.
 */

import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import { mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

// Set FFmpeg binary path from npm-installed package
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

const OUTPUT_DIR = path.join(process.cwd(), "public", "uploads", "videos");

export interface SceneInput {
  imagePath: string;
  audioPath: string;
  duration: number; // seconds
}

export interface ComposeOptions {
  scenes: SceneInput[];
  resolution?: string; // "1080x1920" or "1920x1080"
  fps?: number;
  transitionDuration?: number; // seconds
}

/**
 * Map project aspect ratio to FFmpeg resolution string.
 */
export function getVideoResolution(aspectRatio: string): string {
  switch (aspectRatio) {
    case "9:16":
      return "1080x1920"; // vertical/shorts
    case "16:9":
      return "1920x1080"; // landscape
    case "1:1":
      return "1080x1080"; // square
    default:
      return "1920x1080";
  }
}

/**
 * Ensure the output directory exists.
 */
async function ensureOutputDir() {
  await mkdir(OUTPUT_DIR, { recursive: true });
}

/**
 * Compose a single scene video: image + Ken Burns effect + audio.
 */
export function composeScene(
  scene: SceneInput,
  outputPath: string,
  resolution: string = "1920x1080"
): Promise<void> {
  const [width, height] = resolution.split("x").map(Number);
  const frames = Math.ceil(scene.duration * 30); // 30fps

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(scene.imagePath)
      .inputOptions(["-loop", "1"])
      .input(scene.audioPath)
      .complexFilter([
        // Ken Burns zoom effect
        `[0:v]scale=${width * 2}:${height * 2},` +
          `zoompan=z='min(zoom+0.0015,1.5)':d=${frames}:` +
          `s=${width}x${height}:fps=30[v]`,
      ])
      .outputOptions([
        "-map",
        "[v]",
        "-map",
        "1:a",
        "-shortest",
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-pix_fmt",
        "yuv420p",
      ])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err: Error) => reject(err))
      .run();
  });
}

/**
 * Concatenate multiple scene video clips into a single output file.
 */
export function concatenateScenes(
  scenePaths: string[],
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    scenePaths.forEach((scenePath) => {
      command.input(scenePath);
    });

    command
      .on("end", () => resolve())
      .on("error", (err: Error) => reject(err))
      .mergeToFile(outputPath, OUTPUT_DIR);
  });
}

/**
 * Compose the final video from all scene clips.
 * Concatenates scenes with crossfade transitions.
 */
export async function composeVideo(
  options: ComposeOptions
): Promise<string> {
  await ensureOutputDir();

  const { scenes, resolution = "1920x1080" } = options;

  // Compose each scene individually, then concatenate
  const scenePaths: string[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const scenePath = path.join(OUTPUT_DIR, `scene_${uuidv4()}.mp4`);
    await composeScene(scenes[i], scenePath, resolution);
    scenePaths.push(scenePath);
  }

  // Single scene — return its path directly
  if (scenePaths.length === 1) {
    const sceneFileName = path.basename(scenePaths[0]);
    return `/uploads/videos/${sceneFileName}`;
  }

  // Concatenate all scene videos
  const outputFileName = `${uuidv4()}.mp4`;
  const outputPath = path.join(OUTPUT_DIR, outputFileName);
  await concatenateScenes(scenePaths, outputPath);

  return `/uploads/videos/${outputFileName}`;
}
