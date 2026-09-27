import {
  getActiveCities,
  getActiveHeroCampaign,
  getActiveTools,
  getFeaturedProperties,
} from "@grihamconnect/db";
import { FeaturedProperties, GrihamHero } from "@grihamconnect/ui";
import { PropertyHealthCard } from "../components/PropertyHealthCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [hero, cities, tools, featuredProperties] = await Promise.all([
    getActiveHeroCampaign(),
    getActiveCities(),
    getActiveTools(),
    getFeaturedProperties(),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <GrihamHero
        eyebrow={hero?.eyebrow ?? "Griham Connect"}
        headline={hero?.headline ?? "Understand a property before you decide."}
        description={
          hero?.description ??
          "A data-first way to verify a project's builder, location, price and legal standing."
        }
        accentText={hero?.accentText}
        stats={hero?.stats}
        desktopImageUrl={hero?.desktopImageUrl ?? null}
        mobileImageUrl={hero?.mobileImageUrl ?? null}
      >
        <PropertyHealthCard cities={cities} tools={tools} />
      </GrihamHero>
      <FeaturedProperties properties={featuredProperties} />
    </main>
  );
}
