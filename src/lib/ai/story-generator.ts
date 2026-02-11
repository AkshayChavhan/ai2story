/**
 * AI Story Generator — Uses Google Gemini (free tier) to generate structured stories.
 * Fallback: Groq API (free tier with Llama/Mixtral models).
 *
 * The generator takes a user prompt and story parameters, then produces
 * a structured story broken into scenes, each with narration text and
 * visual descriptions for image generation.
 */

interface StoryParams {
  prompt: string;
  genre?: string;
  tone?: string;
  targetLength?: number; // in seconds (15, 30, 60, 90, 120)
  targetAudience?: string;
  language?: string;
  imageStyle?: string;
}

interface GeneratedScene {
  order: number;
  narrationText: string;
  visualPrompt: string;
  cameraDirection: string;
  mood: string;
  duration: number; // estimated seconds
}

interface GeneratedStory {
  title: string;
  scenes: GeneratedScene[];
}

/**
 * Generate a structured story using Google Gemini API (free tier).
 */
export async function generateStory(
  params: StoryParams
): Promise<GeneratedStory> {
  const {
    prompt,
    genre = "General",
    tone = "Neutral",
    targetLength = 60,
    targetAudience = "General",
    language = "English",
    imageStyle = "photorealistic",
  } = params;

  // Calculate number of scenes based on target length
  const numScenes = Math.max(3, Math.min(10, Math.ceil(targetLength / 10)));

  const systemPrompt = `You are a professional story writer for short video content.
Generate a structured story based on the user's prompt.

Requirements:
- Genre: ${genre}
- Tone: ${tone}
- Target Length: ${targetLength} seconds (${numScenes} scenes)
- Target Audience: ${targetAudience}
- Language: ${language}
- Visual Style: ${imageStyle}

Return a JSON object with this exact structure:
{
  "title": "Story Title",
  "scenes": [
    {
      "order": 1,
      "narrationText": "The narration text to be spoken aloud for this scene",
      "visualPrompt": "Detailed image generation prompt describing the visual for this scene, in ${imageStyle} style",
      "cameraDirection": "e.g., wide shot, close-up, pan left, zoom in",
      "mood": "e.g., mysterious, joyful, tense",
      "duration": 8
    }
  ]
}

Rules:
- Each scene's narrationText should be 1-3 sentences
- visualPrompt should be a detailed image prompt suitable for AI image generation
- Total duration of all scenes should approximately equal ${targetLength} seconds
- Make the story engaging and complete with a beginning, middle, and end`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\nUser's story prompt: ${prompt}` }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No response from Gemini API");
  }

  const story: GeneratedStory = JSON.parse(text);
  return story;
}
