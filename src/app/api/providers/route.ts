import { NextResponse } from "next/server";
import { loadProviders } from "@/lib/supabase";

export async function GET() {
  const result = await loadProviders();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result);
}
