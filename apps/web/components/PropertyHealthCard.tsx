"use client";

import {
  AnalysisPipeline,
  AskGriham,
  CitySelector,
  PropertyCard,
  ProjectSearch,
  ReportPreview,
  SampleProjectChips,
  StartNewSearch,
  ToolCard,
} from "@grihamconnect/ui";
import type {
  AnalysisEvent,
  AnalysisStep,
  City,
  PropertyReport,
  PropertySummary,
  Tool,
  ToolComponentType,
} from "@grihamconnect/types";
import { Sparkles, ShieldCheck, PartyPopper } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Phase = "city_selection" | "city_selected" | "analysis_running" | "report_ready";

interface AskEntry {
  question: string;
  answer: string;
}

const TOOL_TO_SECTION: Partial<Record<ToolComponentType, string>> = {
  location_intelligence: "location",
  price_analysis: "price",
  builder_intelligence: "builder",
  risk_insights: "risk",
};

const TOOL_ACTION_LABELS: Partial<Record<ToolComponentType, string>> = {
  location_intelligence: "Explore location",
  price_analysis: "View price analysis",
  builder_intelligence: "Analyse builder",
  risk_insights: "See considerations",
};

export function PropertyHealthCard({
  cities,
  tools,
}: {
  cities: City[];
  tools: Tool[];
}) {
  const [phase, setPhase] = useState<Phase>("city_selection");
  const [city, setCity] = useState<City | null>(null);
  const [sampleProperties, setSampleProperties] = useState<PropertySummary[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [property, setProperty] = useState<PropertySummary | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [steps, setSteps] = useState<AnalysisStep[]>([]);
  const [report, setReport] = useState<PropertyReport | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>();
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [askEntries, setAskEntries] = useState<AskEntry[]>([]);
  const [asking, setAsking] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  function reset() {
    eventSourceRef.current?.close();
    setPhase("city_selection");
    setCity(null);
    setSampleProperties([]);
    setSearchError(null);
    setProperty(null);
    setRunId(null);
    setSteps([]);
    setReport(null);
    setActiveSectionId(undefined);
    setAnalysisError(null);
    setAskEntries([]);
  }

  async function handleSelectCity(selected: City) {
    setCity(selected);
    setPhase("city_selected");
    setSearchError(null);
    setLoadingSamples(true);
    try {
      const res = await fetch(`/api/properties?city=${encodeURIComponent(selected.slug)}`);
      const data = await res.json();
      setSampleProperties(res.ok ? data.properties : []);
    } catch {
      setSampleProperties([]);
    } finally {
      setLoadingSamples(false);
    }
  }

  function cancelAnalysis() {
    eventSourceRef.current?.close();
    setPhase("city_selected");
  }

  async function startAnalysis(requestText: string, propertyId?: string) {
    if (!city) return;
    setSubmitting(true);
    setSearchError(null);
    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citySlug: city.slug, requestText, propertyId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.message ?? "Something went wrong. Please try again.");
        return;
      }

      setProperty(data.property);
      setRunId(data.runId);
      setSteps(data.steps);
      setPhase("analysis_running");

      const es = new EventSource(`/api/analysis/${data.runId}/stream`);
      eventSourceRef.current = es;
      es.onmessage = (event) => {
        const parsed: AnalysisEvent = JSON.parse(event.data);
        if (parsed.type === "analysis.step.updated") {
          setSteps((prev) => prev.map((s) => (s.key === parsed.step.key ? parsed.step : s)));
        } else if (parsed.type === "analysis.completed") {
          setReport(parsed.report);
          setActiveSectionId(parsed.report.sections[0]?.id);
          setPhase("report_ready");
          es.close();
        } else if (parsed.type === "analysis.failed") {
          setAnalysisError(parsed.errorMessage);
          setPhase("city_selected");
          es.close();
        }
      };
      es.onerror = () => {
        setAnalysisError("Lost connection while analysing. Please try again.");
        setPhase("city_selected");
        es.close();
      };
    } catch {
      setSearchError("Couldn't start the analysis. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAsk(question: string) {
    if (!runId) return;
    setAsking(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, question }),
      });
      const data = await res.json();
      setAskEntries((prev) => [
        ...prev,
        { question, answer: res.ok ? data.answer : "Couldn't answer that right now." },
      ]);
    } finally {
      setAsking(false);
    }
  }

  function focusToolSection(componentType: ToolComponentType) {
    const sectionType = TOOL_TO_SECTION[componentType];
    if (sectionType) setActiveSectionId(sectionType);
  }

  const relatedProperties = sampleProperties.filter((p) => p.id !== property?.id);

  const suggestedPrompts = [
    "Is this a good property for end-use?",
    relatedProperties[0]
      ? `How does it compare with ${relatedProperties[0].name}?`
      : "How does this compare with similar projects?",
    "Is the price reasonable?",
    "What are the major risks?",
    "What should I verify before buying?",
  ];

  return (
    <div
      id="property-health-card"
      className="flex scroll-mt-6 flex-col gap-5 rounded-xl border border-line bg-white/95 p-5 shadow-[0_20px_50px_rgba(10,11,10,0.08)] sm:p-6"
    >
      {phase === "city_selection" && (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-s font-medium uppercase tracking-wide text-griham-green">
                Property Health Report
              </p>
              <h2 className="text-[28px] font-medium leading-tight text-ink">
                Select a city to get started.
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Choose a city and verify any project to get a comprehensive property health
                report with real data and expert insights.
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-griham-green-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-griham-green">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              AI Powered
            </span>
          </div>
          <CitySelector cities={cities} onSelect={handleSelectCity} />
          <p className="flex items-center gap-1.5 rounded-md bg-paper px-3 py-2 text-xs text-ink-soft">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-griham-green" aria-hidden="true" />
            <span>
              <span className="font-medium text-ink">Powered by real data sources</span> — RERA,
              government data, market insights, news and more.
            </span>
          </p>
        </>
      )}

      {phase === "city_selected" && city && (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-griham-green">
                Property Health Report
              </p>
              <span className="mt-1 inline-flex w-fit items-center rounded-full bg-griham-green-soft px-3 py-1 text-xs font-medium text-griham-green">
                {city.displayName}
              </span>
              <h2 className="mt-2 text-[28px] font-medium leading-tight text-ink">
                Verify the project
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Enter any project name to get a complete property health report.
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="min-h-11 shrink-0 text-xs text-ink-soft underline hover:text-ink"
            >
              Change city
            </button>
          </div>

          <ProjectSearch
            onSubmit={(query) => startAnalysis(`Verify ${query}`)}
            placeholder={`Search a project in ${city.displayName}...`}
            disabled={submitting}
          />

          {(searchError || analysisError) && (
            <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
              {searchError ?? analysisError}
            </p>
          )}

          {loadingSamples ? (
            <p className="text-sm text-ink-soft">Loading sample projects…</p>
          ) : (
            <SampleProjectChips
              properties={sampleProperties}
              onSelect={(p) => startAnalysis(`Verify ${p.name}`, p.id)}
            />
          )}
        </>
      )}

      {phase === "analysis_running" && property && (
        <AnalysisPipeline propertyName={property.name} steps={steps} onCancel={cancelAnalysis} />
      )}

      {phase === "report_ready" && report && property && (
        <div className="flex flex-col gap-6">
          <ReportPreview
            report={report}
            property={property}
            activeSectionId={activeSectionId}
            onActiveSectionChange={setActiveSectionId}
          />

          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink-soft">
              I&apos;ve analysed <span className="font-medium text-ink">{property.name}</span>.
              Here are the areas worth exploring.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tools
                .filter((t) => t.componentType in TOOL_TO_SECTION)
                .map((tool) => (
                  <ToolCard
                    key={tool.key}
                    componentType={tool.componentType}
                    title={tool.name}
                    summary={tool.description ?? ""}
                    actionLabel={TOOL_ACTION_LABELS[tool.componentType] ?? "Explore"}
                    onAction={() => focusToolSection(tool.componentType)}
                  />
                ))}
            </div>
          </div>

          <AskGriham onAsk={handleAsk} suggestedPrompts={suggestedPrompts} disabled={asking} />

          {askEntries.length > 0 && (
            <div className="flex flex-col gap-3">
              {askEntries.map((entry, i) => (
                <div key={i} className="rounded-md bg-griham-green-soft p-3 text-sm">
                  <p className="font-medium text-ink">{entry.question}</p>
                  <p className="mt-1 text-ink-soft">{entry.answer}</p>
                </div>
              ))}
            </div>
          )}

          {relatedProperties.length > 0 && city && (
            <div className="flex flex-col gap-3">
              <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                Explore more in {city.displayName}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {relatedProperties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    onSelect={(selected) => startAnalysis(`Verify ${selected.name}`, selected.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-md bg-griham-green-soft p-4 text-center">
            <PartyPopper className="mx-auto h-5 w-5 text-griham-green" aria-hidden="true" />
            <div>
              <p className="font-medium text-ink">Report generated successfully.</p>
              <p className="mt-1 text-sm text-ink-soft">
                You can now explore detailed insights, ask follow-up questions, or start a new
                project search.
              </p>
            </div>
            <StartNewSearch onStartNewSearch={reset} />
          </div>
        </div>
      )}
    </div>
  );
}
