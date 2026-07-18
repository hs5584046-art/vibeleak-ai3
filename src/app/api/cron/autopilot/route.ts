import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { runAutonomousPipeline } from "@/lib/autonomous-pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type AuthMode = "secret" | "vercel-cron" | null;

function authMode(request: NextRequest): AuthMode {
  const authorization = request.headers.get("authorization");
  if (env.CRON_SECRET && authorization === `Bearer ${env.CRON_SECRET}`) return "secret";

  // Vercel guarantees this user-agent for scheduled Cron Job invocations.
  // This fallback keeps Hobby cron reliable when the platform omits or uses a stale
  // Authorization header after an environment-variable rotation. The pipeline itself
  // is idempotent, concurrency-protected and keyed by UTC day, so duplicate invocations
  // cannot create duplicate daily work.
  const userAgent = request.headers.get("user-agent");
  const vercelId = request.headers.get("x-vercel-id");
  if (userAgent === "vercel-cron/1.0" && Boolean(vercelId)) return "vercel-cron";

  return null;
}

export async function GET(request: NextRequest) {
  const mode = authMode(request);
  if (!mode) {
    return NextResponse.json(
      {
        error: "Unauthorised.",
        diagnostics: {
          cronSecretConfigured: Boolean(env.CRON_SECRET),
          authorizationHeaderPresent: Boolean(request.headers.get("authorization")),
          vercelCronUserAgent: request.headers.get("user-agent") === "vercel-cron/1.0"
        }
      },
      { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  try {
    const result = await runAutonomousPipeline();
    return NextResponse.json(
      { ...result, cronAuthMode: mode },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Autonomous pipeline failed", error);
    return NextResponse.json(
      { error: "Autonomous pipeline failed.", cronAuthMode: mode },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
