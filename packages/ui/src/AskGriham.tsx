"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

const DEFAULT_PROMPTS = [
  "Is this suitable for end use?",
  "How does this compare with another project?",
  "What should I be careful about?",
  "How is the location?",
  "Is the price reasonable?",
];

export interface AskGrihamProps {
  suggestedPrompts?: string[];
  onAsk: (question: string) => void;
  disabled?: boolean;
}

export function AskGriham({ suggestedPrompts = DEFAULT_PROMPTS, onAsk, disabled }: AskGrihamProps) {
  const [value, setValue] = useState("");

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-white p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-griham-green" aria-hidden="true" />
        <h3 className="font-medium text-base text-ink">Ask Griham</h3>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) {
            onAsk(value.trim());
            setValue("");
          }
        }}
        className="flex items-center gap-2 rounded-md border border-line px-3 py-2.5 focus-within:border-griham-green"
      >
        <label htmlFor="ask-griham" className="sr-only">
          Ask a follow-up question about this property
        </label>
        <input
          id="ask-griham"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          placeholder="Ask a follow-up question about this property..."
          className="min-h-6 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-soft focus:outline-none"
        />
      </form>
      <div className="flex flex-wrap gap-2">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled}
            onClick={() => onAsk(prompt)}
            className="min-h-11 rounded-sm border border-line px-3 py-2 text-xs text-ink-soft transition-colors hover:border-griham-green hover:text-ink"
          >
            {prompt}
          </button>
        ))}
      </div>
    </section>
  );
}
