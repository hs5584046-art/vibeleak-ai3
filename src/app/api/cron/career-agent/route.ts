import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorised(request: NextRequest): boolean {
  const authorization = request.headers.get("authorization");
  if (env.CRON_SECRET && authorization === `Bearer ${env.CRON_SECRET}`) return true;
  return request.headers.get("user-agent") === "vercel-cron/1.0" && Boolean(request.headers.get("x-vercel-id"));
}

export async function GET(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  return NextResponse.json({
    ok: true,
    service: "vibelytix-career-agent",
    mode: "safe-discovery",
    status: "foundation-ready",
    message: "Career agent schema and matching engine are installed. Discovery connectors and authorised sending are enabled only when their credentials are configured.",
    safeguards: {
      duplicateSuppression: true,
      replyStopsFollowUps: true,
      unsubscribeStopsContact: true,
      maximumFollowUps: 2,
      followUpCadenceDays: [7, 14],
      automaticPortalSubmission: false
    }
  }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
