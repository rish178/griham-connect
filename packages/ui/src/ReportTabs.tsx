"use client";

import type { ReportSection } from "@grihamconnect/types";
import type { ComponentType } from "react";
import { useState } from "react";
import { REPORT_COMPONENTS } from "./ReportSections";

export interface ReportTabsProps {
  sections: ReportSection[];
  /** Controlled active tab id — omit for internal state. */
  activeId?: string;
  onActiveChange?: (id: string) => void;
}

/** Tab bar over whatever sections the backend sent — adding a section type upstream adds a tab, no UI change needed. */
export function ReportTabs({ sections, activeId: controlledId, onActiveChange }: ReportTabsProps) {
  const [internalId, setInternalId] = useState(sections[0]?.id);
  const activeId = controlledId ?? internalId;
  const setActiveId = onActiveChange ?? setInternalId;
  const active = sections.find((s) => s.id === activeId) ?? sections[0];
  if (!active) return null;

  const Component = REPORT_COMPONENTS[active.type] as unknown as
    | ComponentType<Record<string, unknown>>
    | undefined;

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Report sections" className="flex flex-wrap gap-1 border-b border-line">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={section.id === active.id}
            onClick={() => setActiveId(section.id)}
            className={`min-h-11 rounded-t-sm px-3 py-2 text-sm ${
              section.id === active.id
                ? "border-b-2 border-griham-green font-medium text-ink"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>
      <div role="tabpanel">{Component && <Component {...active} />}</div>
    </div>
  );
}
