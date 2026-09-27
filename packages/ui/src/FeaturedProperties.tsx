import type { PropertySummary } from "@grihamconnect/types";
import { Container } from "./Container";
import { PropertyCard } from "./PropertyCard";

export interface FeaturedPropertiesProps {
  properties: PropertySummary[];
  onSelect?: (property: PropertySummary) => void;
}

export function FeaturedProperties({ properties, onSelect }: FeaturedPropertiesProps) {
  if (properties.length === 0) return null;

  return (
    <section>
      <Container className="py-16">
        <div className="mb-6 flex flex-col gap-1">
          <p className="font-mono text-xs uppercase tracking-wide text-griham-green">
            Featured
          </p>
          <h2 className="font-medium text-2xl text-ink">Projects worth a closer look</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} onSelect={onSelect} />
          ))}
        </div>
      </Container>
    </section>
  );
}
