import { getAllToolsAdmin } from "@grihamconnect/db";
import { setToolSortOrderAction, toggleToolActiveAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminToolsPage() {
  const tools = await getAllToolsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-medium text-2xl text-ink">Tools</h1>
      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">Tool</th>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Sort order</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tools.map((tool) => {
              const toggle = toggleToolActiveAction.bind(null, tool.id, !tool.isActive);
              const setSort = setToolSortOrderAction.bind(null, tool.id);
              return (
                <tr key={tool.id}>
                  <td className="px-4 py-3 font-medium text-ink">{tool.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{tool.key}</td>
                  <td className="px-4 py-3">
                    <form action={setSort} className="flex items-center gap-2">
                      <input
                        type="number"
                        name="sortOrder"
                        defaultValue={tool.sortOrder}
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
                          tool.isActive
                            ? "bg-griham-green-soft text-griham-green"
                            : "bg-danger-soft text-danger"
                        }`}
                      >
                        {tool.isActive ? "Active — deactivate" : "Inactive — activate"}
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
