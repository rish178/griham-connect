import { getReportByRunId } from "@grihamconnect/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  runId: z.string().uuid(),
  question: z.string().min(1).max(300),
});

/**
 * Milestone-1 stand-in for a real follow-up chat: matches the question
 * against the already-generated report's sections rather than calling an
 * LLM. Swappable later without changing the request/response contract.
 */
function answerFromReport(question: string, report: NonNullable<Awaited<ReturnType<typeof getReportByRunId>>>): string {
  const q = question.toLowerCase();
  const find = (type: string) => report.sections.find((s) => s.type === type);

  if (q.includes("price") || q.includes("cost") || q.includes("reasonable")) {
    const section = find("price");
    return section && "content" in section
      ? section.content
      : "We don't have enough price data yet for this property.";
  }
  if (q.includes("location") || q.includes("connect")) {
    const section = find("location");
    return section && "content" in section ? section.content : "Location data isn't available yet.";
  }
  if (q.includes("builder") || q.includes("developer")) {
    const section = find("builder");
    return section && "content" in section ? section.content : "Builder data isn't available yet.";
  }
  if (q.includes("careful") || q.includes("risk") || q.includes("consider")) {
    const section = find("risk");
    return section && "items" in section
      ? section.items.join(" ")
      : "No specific concerns flagged yet.";
  }
  if (q.includes("compare") || q.includes("another")) {
    return "Property comparison against other projects in this city is coming soon — for now, see the Property Health Score and risk band above as the fastest signal.";
  }

  return `${report.property.name} has a Property Health Score of ${report.score.value}/100 (${report.riskLevel.toLowerCase()} risk). ${report.summary.text}`;
}

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const report = await getReportByRunId(parsed.data.runId);
  if (!report) {
    return NextResponse.json({ error: "report_not_found" }, { status: 404 });
  }

  return NextResponse.json({ answer: answerFromReport(parsed.data.question, report) });
}
