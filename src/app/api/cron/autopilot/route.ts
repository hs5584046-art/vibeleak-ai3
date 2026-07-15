import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { runAutonomousPipeline } from "@/lib/autonomous-pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorised(request: NextRequest) {
  return Boolean(env.CRON_SECRET && request.headers.get("authorization") === `Bearer ${env.CRON_SECRET}`);
}

export async function GET(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  try {
    return NextResponse.json(await runAutonomousPipeline(), {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (error) {
    console.error("Autonomous pipeline failed", error);
    return NextResponse.json({ error: "Autonomous pipeline failed." }, { status: 500 });
  }
}
