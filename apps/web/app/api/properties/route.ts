import { getSamplePropertiesForCity } from "@grihamconnect/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const citySlug = request.nextUrl.searchParams.get("city");
  if (!citySlug) {
    return NextResponse.json({ error: "Missing city parameter." }, { status: 400 });
  }

  try {
    const properties = await getSamplePropertiesForCity(citySlug);
    return NextResponse.json({ properties });
  } catch {
    return NextResponse.json(
      { error: "Couldn't load sample projects right now. Please try again." },
      { status: 502 }
    );
  }
}
