"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search } from "lucide-react";

/**
 * Media filters — search input + type dropdown.
 * Debounces search input by 300ms.
 */

interface Filters {
  search: string;
  type: string;
}

interface MediaFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "image", label: "Images" },
  { value: "audio", label: "Audio" },
  { value: "video", label: "Videos" },
];

export function MediaFilters({ filters, onFilterChange }: MediaFiltersProps) {
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
          placeholder="Search by project name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={filters.type}
        onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
        className="w-full sm:w-40"
      >
        {typeOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
