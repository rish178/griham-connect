import { getReportByRunId } from "@grihamconnect/db";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const report = await getReportByRunId(runId);
  if (!report) {
    return NextResponse.json({ error: "not_found", message: "Report not found." }, { status: 404 });
  }
  return NextResponse.json({ report });
}
