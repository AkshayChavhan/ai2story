"use client";

import { useState, useEffect, useCallback } from "react";
import { MediaCard } from "@/components/media/media-card";
import { MediaFilters } from "@/components/media/media-filters";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { MediaItem } from "@/types";

/**
 * Media list — client component that fetches and displays media items
 * with search, type filter, and pagination support.
 */

interface Filters {
  search: string;
  type: string;
}

export function MediaList() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.type) params.set("type", filters.type);
      params.set("page", page.toString());
      params.set("limit", "24");

      const response = await fetch(`/api/media?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch media");

      const data = await response.json();
      setItems(data.items);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Reset page when filters change
  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <MediaFilters filters={filters} onFilterChange={handleFilterChange} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
          <p className="text-muted-foreground">
            {filters.search || filters.type
              ? "No media items match your filters."
              : "No media yet. Generate images, audio, or videos in your projects."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {total} item{total !== 1 ? "s" : ""} total
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
