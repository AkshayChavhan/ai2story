import Link from "next/link";

/**
 * Landing Page — StoryForge AI
 * This is the public-facing homepage with hero, features, and CTA.
 * Will be fully built in feat:15_landing-page.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-8 px-6 text-center">
        {/* Hero Section */}
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Create AI-Powered
          <span className="text-primary"> Video Stories</span>
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground">
          Transform your ideas into stunning short videos. Write stories,
          generate images, add voiceovers, and compose videos — all powered
          by AI, all completely free.
        </p>

        <div className="flex gap-4">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="AI Story Writing"
            description="Generate structured stories from a simple text prompt using Google Gemini."
          />
          <FeatureCard
            title="Image Generation"
            description="Auto-generate stunning images for every scene using Pollinations.ai."
          />
          <FeatureCard
            title="AI Voiceover"
            description="300+ natural voices with Edge TTS. Multiple languages and styles."
          />
          <FeatureCard
            title="Video Export"
            description="Compose polished videos with Ken Burns effects and smooth transitions."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border p-6 text-left">
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
