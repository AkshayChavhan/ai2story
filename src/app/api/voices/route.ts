import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listVoices } from "@/lib/ai/voice-generator";
import type { VoiceOption } from "@/types";

/**
 * GET /api/voices — List available Edge TTS voices.
 * Results are cached in a module-level variable to avoid repeated network calls.
 */

let cachedVoices: VoiceOption[] | null = null;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (cachedVoices) {
      return NextResponse.json({ voices: cachedVoices });
    }

    const rawVoices = await listVoices();

    cachedVoices = rawVoices.map((v: Record<string, string>) => ({
      id: v.ShortName,
      name: v.FriendlyName,
      language: v.Locale.split("-")[0],
      gender: v.Gender,
      locale: v.Locale,
    }));

    return NextResponse.json({ voices: cachedVoices });
  } catch (error) {
    console.error("GET /api/voices error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to list voices";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
