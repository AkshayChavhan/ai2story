"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFilters } from "@/components/projects/project-filters";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Project list — client component that fetches and displays projects
 * with search, filter, and pagination support.
 */

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  genre: string | null;
  imageStyle: string;
  aspectRatio: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    scenes: number;
  };
}

interface Filters {
  search: string;
  status: string;
  genre: string;
}

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    genre: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.genre) params.set("genre", filters.genre);
      params.set("page", page.toString());
      params.set("limit", "12");

      const response = await fetch(`/api/projects?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch projects");

      const data = await response.json();
      setProjects(data.projects);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Reset page when filters change
  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <ProjectFilters filters={filters} onFilterChange={handleFilterChange} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
          <p className="text-muted-foreground">
            {filters.search || filters.status || filters.genre
              ? "No projects match your filters."
              : "No projects yet."}
          </p>
          {!filters.search && !filters.status && !filters.genre && (
            <Link
              href="/projects/new"
              className={cn(buttonVariants(), "mt-4 gap-2")}
            >
              <Plus className="h-4 w-4" />
              Create Your First Story
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {total} project{total !== 1 ? "s" : ""} total
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
