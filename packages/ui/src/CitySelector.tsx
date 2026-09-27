import type { City } from "@grihamconnect/types";
import { Building2, Landmark, Waves, Trees, Mountain, MapPin } from "lucide-react";

const ICONS: Record<string, typeof MapPin> = {
  "building-2": Building2,
  landmark: Landmark,
  waves: Waves,
  trees: Trees,
  mountain: Mountain,
};

export interface CitySelectorProps {
  cities: City[];
  selectedCitySlug?: string | null;
  onSelect: (city: City) => void;
}

export function CitySelector({ cities, selectedCitySlug, onSelect }: CitySelectorProps) {
  return (
    <div role="list" aria-label="Select a city" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {cities.map((city) => {
        const Icon = (city.icon && ICONS[city.icon]) || MapPin;
        const selected = city.slug === selectedCitySlug;
        return (
          <button
            key={city.id}
            type="button"
            role="listitem"
            aria-pressed={selected}
            onClick={() => onSelect(city)}
            className={`flex min-h-11 flex-col items-center gap-1.5 rounded-md border p-1 text-center transition-colors ${
              selected
                ? "border-griham-green bg-griham-green-soft/60"
                : "border-line bg-white hover:border-griham-green/50 hover:bg-griham-green-soft/40"
            }`}
          >
            <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-griham-green-soft">
              {city.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={city.imageUrl} alt="" aria-hidden="true" className="h-full w-full object-cover" />
              ) : (
                <Icon className="h-6 w-6 text-griham-green" aria-hidden="true" />
              )}
              {city.imageUrl && (
                <span className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                  <Icon className="h-3 w-3 text-griham-green" aria-hidden="true" />
                </span>
              )}
            </span>
            <span className="text-xs font-medium text-ink">{city.displayName}</span>
          </button>
        );
      })}
    </div>
  );
}
