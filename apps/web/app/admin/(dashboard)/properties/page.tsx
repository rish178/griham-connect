import { getAllPropertiesAdmin } from "@grihamconnect/db";
import {
  setPropertySortOrderAction,
  togglePropertyFeaturedAction,
  togglePropertyStatusAction,
} from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const properties = await getAllPropertiesAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-medium text-2xl text-ink">Properties</h1>
      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Sort order</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {properties.map((property) => {
              const toggleFeatured = togglePropertyFeaturedAction.bind(
                null,
                property.id,
                !property.isFeatured
              );
              const toggleStatus = togglePropertyStatusAction.bind(
                null,
                property.id,
                property.status
              );
              const setSort = setPropertySortOrderAction.bind(null, property.id);
              return (
                <tr key={property.id}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{property.name}</span>
                    {property.isSample && (
                      <span className="ml-2 rounded-sm bg-warning-soft px-1.5 py-0.5 font-mono text-[10px] uppercase text-warning">
                        sample
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{property.citySlug}</td>
                  <td className="px-4 py-3">
                    <form action={setSort} className="flex items-center gap-2">
                      <input
                        type="number"
                        name="sortOrder"
                        defaultValue={property.sortOrder}
                        className="min-h-9 w-16 rounded-sm border border-line px-2 py-1"
                      />
                      <button type="submit" className="min-h-9 text-xs text-griham-green underline">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleFeatured}>
                      <button
                        type="submit"
                        className={`min-h-9 rounded-sm px-2 py-1 text-xs ${
                          property.isFeatured
                            ? "bg-griham-green-soft text-griham-green"
                            : "bg-paper text-ink-soft"
                        }`}
                      >
                        {property.isFeatured ? "Featured" : "Not featured"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleStatus}>
                      <button
                        type="submit"
                        className={`min-h-9 rounded-sm px-2 py-1 text-xs ${
                          property.status === "active"
                            ? "bg-griham-green-soft text-griham-green"
                            : "bg-danger-soft text-danger"
                        }`}
                      >
                        {property.status}
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
