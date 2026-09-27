import { getDashboardCounts } from "@grihamconnect/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const counts = await getDashboardCounts();

  const cards = [
    { label: "Cities", value: counts.cities },
    { label: "Properties", value: counts.properties },
    { label: "Tools", value: counts.tools },
    { label: "Analysis runs", value: counts.analysisRuns },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-medium text-2xl text-ink">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-line bg-white p-4">
            <p className="font-mono text-2xl text-ink">{card.value}</p>
            <p className="text-xs text-ink-soft">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
