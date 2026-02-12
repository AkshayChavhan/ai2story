import { MediaList } from "@/components/media/media-list";

/**
 * Media Library — StoryForge AI
 * Browse all generated images, audio, and videos across projects.
 */
export default function MediaLibraryPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Media Library
        </h1>
        <p className="mt-1 text-muted-foreground">
          Browse all your generated images, audio, and videos.
        </p>
      </div>
      <MediaList />
    </div>
  );
}
