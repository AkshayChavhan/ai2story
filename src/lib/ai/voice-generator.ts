/**
 * AI Voice Generator — Uses Edge TTS (free, 300+ voices) for voiceover.
 * Microsoft Edge TTS provides high-quality, natural voices at no cost.
 */

import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

interface VoiceGenerationParams {
  text: string;
  voiceId?: string;
  speed?: number; // 0.5 to 2.0
  pitch?: string; // e.g., "+0Hz", "+10Hz", "-5Hz"
}

/**
 * Generate voiceover audio using Edge TTS.
 * Returns audio as a Buffer (MP3 format).
 */
export async function generateVoice(
  params: VoiceGenerationParams
): Promise<Buffer> {
  const {
    text,
    voiceId = "en-US-AriaNeural",
    speed = 1.0,
    pitch = "+0Hz",
  } = params;

  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  // Build SSML for speed and pitch control
  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice name="${voiceId}">
        <prosody rate="${speed}" pitch="${pitch}">
          ${text}
        </prosody>
      </voice>
    </speak>
  `;

  const readable = tts.toStream(ssml);

  // Collect stream into buffer
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    readable.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    readable.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readable.on("error", reject);
  });
}

/**
 * List available Edge TTS voices.
 * Returns an array of voice metadata.
 */
export async function listVoices() {
  const tts = new MsEdgeTTS();
  const voices = await tts.getVoices();
  return voices;
}
