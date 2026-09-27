import { getPrimaryHeroCampaign } from "@grihamconnect/db";
import { updateHeroAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const hero = await getPrimaryHeroCampaign();

  if (!hero) {
    return <p className="text-sm text-ink-soft">No hero campaign found.</p>;
  }

  const action = updateHeroAction.bind(null, hero.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-medium text-2xl text-ink">Hero campaign</h1>
      <form action={action} className="flex max-w-xl flex-col gap-4 rounded-lg border border-line bg-white p-5">
        <label className="flex flex-col gap-1 text-sm">
          Eyebrow
          <input
            name="eyebrow"
            defaultValue={hero.eyebrow ?? ""}
            className="min-h-11 rounded-md border border-line px-3 py-2 focus:border-griham-green focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Headline
          <input
            name="headline"
            defaultValue={hero.headline}
            required
            className="min-h-11 rounded-md border border-line px-3 py-2 focus:border-griham-green focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Description
          <textarea
            name="description"
            defaultValue={hero.description ?? ""}
            rows={3}
            className="rounded-md border border-line px-3 py-2 focus:border-griham-green focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Accent text (small italic line near the headline)
          <input
            name="accentText"
            defaultValue={hero.accentText ?? ""}
            placeholder="Better information. Brighter tomorrows."
            className="min-h-11 rounded-md border border-line px-3 py-2 focus:border-griham-green focus:outline-none"
          />
        </label>
        <fieldset className="flex flex-col gap-2 rounded-md border border-line p-3">
          <legend className="px-1 text-xs uppercase tracking-wide text-ink-soft">
            Stat counters
          </legend>
          {[1, 2, 3].map((i) => {
            const stat = hero.stats[i - 1];
            return (
              <div key={i} className="flex gap-2">
                <input
                  name={`statValue${i}`}
                  defaultValue={stat?.value ?? ""}
                  placeholder="200+"
                  className="min-h-11 w-24 rounded-md border border-line px-3 py-2 focus:border-griham-green focus:outline-none"
                />
                <input
                  name={`statLabel${i}`}
                  defaultValue={stat?.label ?? ""}
                  placeholder="Data points analysed"
                  className="min-h-11 flex-1 rounded-md border border-line px-3 py-2 focus:border-griham-green focus:outline-none"
                />
              </div>
            );
          })}
        </fieldset>
        <label className="flex flex-col gap-1 text-sm">
          Desktop image URL
          <input
            name="desktopImageUrl"
            defaultValue={hero.desktopImageUrl ?? ""}
            placeholder="/hero/desktop.jpg or https://…"
            className="min-h-11 rounded-md border border-line px-3 py-2 focus:border-griham-green focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Mobile image URL
          <input
            name="mobileImageUrl"
            defaultValue={hero.mobileImageUrl ?? ""}
            placeholder="/hero/mobile.jpg or https://…"
            className="min-h-11 rounded-md border border-line px-3 py-2 focus:border-griham-green focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={hero.isActive} className="h-4 w-4" />
          Active
        </label>
        <button
          type="submit"
          className="min-h-11 w-fit rounded-md bg-griham-green px-4 py-2.5 text-sm font-medium text-white hover:bg-griham-green/90"
        >
          Save
        </button>
      </form>
    </div>
  );
}
