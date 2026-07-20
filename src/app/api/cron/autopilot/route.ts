import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { runAutonomousPipeline } from "@/lib/autonomous-pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!env.CRON_SECRET || authorization !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json(
      {
        error: "Unauthorised.",
        diagnostics: {
          cronSecretConfigured: Boolean(env.CRON_SECRET),
          authorizationHeaderPresent: Boolean(authorization)
        }
      },
      { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  try {
    const result = await runAutonomousPipeline();
    return NextResponse.json(
      { ...result, cronAuthMode: "secret" },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Autonomous pipeline failed", error);
    return NextResponse.json(
      { error: "Autonomous pipeline failed.", cronAuthMode: "secret" },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
