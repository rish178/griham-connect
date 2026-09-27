import type { PropertySummary } from "@grihamconnect/types";

export interface PropertyCardProps {
  property: PropertySummary;
  /** Omit to render a plain anchor to #property-health-card (works from a Server Component, no client JS needed). */
  onSelect?: (property: PropertySummary) => void;
  /** Anchor target used when onSelect is omitted. */
  scrollTargetId?: string;
}

export function PropertyCard({
  property,
  onSelect,
  scrollTargetId = "property-health-card",
}: PropertyCardProps) {
  const priceLabel =
    property.priceFrom && property.priceTo
      ? `₹${(property.priceFrom / 10000000).toFixed(1)}Cr – ₹${(property.priceTo / 10000000).toFixed(1)}Cr`
      : "Price on request";

  const content = (
    <>
      <div className="aspect-video w-full bg-griham-green-soft">
        {property.heroImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.heroImageUrl}
            alt={`${property.name} exterior`}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span className="text-sm font-medium text-ink">{property.name}</span>
        <span className="text-xs text-ink-soft">{property.sector}</span>
        <span className="font-mono text-xs text-ink-soft">{priceLabel}</span>
      </div>
    </>
  );

  const className =
    "flex flex-col overflow-hidden rounded-lg border border-line bg-white text-left transition-colors hover:border-griham-green";

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(property)} className={className}>
        {content}
      </button>
    );
  }

  return (
    <a href={`#${scrollTargetId}`} className={className}>
      {content}
    </a>
  );
}
