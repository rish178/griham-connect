import type { PropertySummary } from "@grihamconnect/types";

export interface SampleProjectChipsProps {
  properties: PropertySummary[];
  onSelect: (property: PropertySummary) => void;
}

export function SampleProjectChips({ properties, onSelect }: SampleProjectChipsProps) {
  if (properties.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
        Try a sample project
      </p>
      <div className="flex flex-wrap gap-2">
        {properties.map((property) => (
          <button
            key={property.id}
            type="button"
            onClick={() => onSelect(property)}
            className="min-h-11 rounded-sm border border-line bg-white px-3 py-2 text-sm text-ink transition-colors hover:border-griham-green hover:bg-griham-green-soft"
          >
            {property.name}
          </button>
        ))}
      </div>
    </div>
  );
}
