"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search } from "lucide-react";

/**
 * Template filters — search input + genre dropdown.
 * Debounces search input by 300ms.
 */

interface Filters {
  search: string;
  genre: string;
}

interface TemplateFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const genreOptions = [
  { value: "", label: "All Genres" },
  { value: "horror", label: "Horror" },
  { value: "comedy", label: "Comedy" },
  { value: "romance", label: "Romance" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "fantasy", label: "Fantasy" },
  { value: "drama", label: "Drama" },
  { value: "educational", label: "Educational" },
  { value: "motivational", label: "Motivational" },
  { value: "fairy-tale", label: "Fairy Tale" },
  { value: "thriller", label: "Thriller" },
  { value: "mystery", label: "Mystery" },
];

export function TemplateFilters({
  filters,
  onFilterChange,
}: TemplateFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ ...filters, search: searchInput });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, filters, onFilterChange]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={filters.genre}
        onChange={(e) =>
          onFilterChange({ ...filters, genre: e.target.value })
        }
        className="w-full sm:w-40"
      >
        {genreOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
