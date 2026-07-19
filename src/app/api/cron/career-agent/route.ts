import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { runCareerAgent } from "@/lib/career-agent-runner";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorised(request: NextRequest): boolean {
  const authorization = request.headers.get("authorization");
  if (env.CRON_SECRET && authorization === `Bearer ${env.CRON_SECRET}`) return true;
  return request.headers.get("user-agent") === "vercel-cron/1.0" && Boolean(request.headers.get("x-vercel-id"));
}

export async function GET(request: NextRequest) {
  if (!authorised(request)) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const result = await runCareerAgent();
    return NextResponse.json(
      {
        ok: true,
        service: "vibelytix-career-agent",
        result,
        safeguards: {
          dailySendLimit: true,
          duplicateSuppression: true,
          replyAndOptOutSuppression: true,
          maximumFollowUps: 2,
          automaticPortalSubmission: false
        }
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Career agent failed", error);
    return NextResponse.json(
      { ok: false, error: "Career agent execution failed." },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
