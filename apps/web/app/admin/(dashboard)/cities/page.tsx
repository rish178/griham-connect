import { getAllCitiesAdmin } from "@grihamconnect/db";
import { setCitySortOrderAction, toggleCityActiveAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminCitiesPage() {
  const cities = await getAllCitiesAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-medium text-2xl text-ink">Cities</h1>
      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Sort order</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cities.map((city) => {
              const toggle = toggleCityActiveAction.bind(null, city.id, !city.isActive);
              const setSort = setCitySortOrderAction.bind(null, city.id);
              return (
                <tr key={city.id}>
                  <td className="px-4 py-3 font-medium text-ink">{city.displayName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{city.slug}</td>
                  <td className="px-4 py-3">
                    <form action={setSort} className="flex items-center gap-2">
                      <input
                        type="number"
                        name="sortOrder"
                        defaultValue={city.sortOrder}
                        className="min-h-9 w-16 rounded-sm border border-line px-2 py-1"
                      />
                      <button type="submit" className="min-h-9 text-xs text-griham-green underline">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggle}>
                      <button
                        type="submit"
                        className={`min-h-9 rounded-sm px-2 py-1 text-xs ${
                          city.isActive
                            ? "bg-griham-green-soft text-griham-green"
                            : "bg-danger-soft text-danger"
                        }`}
                      >
                        {city.isActive ? "Active — deactivate" : "Inactive — activate"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
