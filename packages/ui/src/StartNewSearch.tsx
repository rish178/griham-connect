import { ArrowRight } from "lucide-react";

export interface StartNewSearchProps {
  onStartNewSearch: () => void;
}

export function StartNewSearch({ onStartNewSearch }: StartNewSearchProps) {
  return (
    <button
      type="button"
      onClick={onStartNewSearch}
      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-griham-green px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-griham-green/90"
    >
      Start New Project Search
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
