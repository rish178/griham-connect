"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export interface ProjectSearchProps {
  onSubmit: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ProjectSearch({
  onSubmit,
  placeholder = "Search project name...",
  disabled,
}: ProjectSearchProps) {
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
      className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2.5 focus-within:border-griham-green"
    >
      <Search className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden="true" />
      <label htmlFor="project-search" className="sr-only">
        Search project name
      </label>
      <input
        id="project-search"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-6 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-soft focus:outline-none"
      />
    </form>
  );
}
