import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

const links: Record<string, { envValue?: string; fallback: string; category: string }> = {
  "relationship-book": {
    envValue: env.AFFILIATE_RELATIONSHIP_BOOK,
    fallback: "/learn/healthy-relationship-communication",
    category: "relationships"
  },
  "relationship-course": {
    envValue: env.AFFILIATE_RELATIONSHIP_COURSE,
    fallback: "/learn/healthy-relationship-communication",
    category: "relationships"
  },
  "career-book": {
    envValue: env.AFFILIATE_CAREER_BOOK,
    fallback: "/learn/choose-a-career-that-fits",
    category: "career"
  },
  "career-course": {
    envValue: env.AFFILIATE_CAREER_COURSE,
    fallback: "/learn/choose-a-career-that-fits",
    category: "career"
  },
  "growth-book": {
    envValue: env.AFFILIATE_GROWTH_BOOK,
    fallback: "/learn/build-habits-that-survive-bad-days",
    category: "growth"
  },
  "growth-course": {
    envValue: env.AFFILIATE_GROWTH_COURSE,
    fallback: "/learn/build-habits-that-survive-bad-days",
    category: "growth"
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const item = links[slug];
  if (!item) return NextResponse.redirect(new URL("/", request.url));

  createAdminClient()
    .from("analytics_events")
    .insert({
      event_name: "affiliate_click",
      path: request.nextUrl.pathname,
      metadata: { slug, category: item.category }
    })
    .then(() => null);

  const target = item.envValue?.startsWith("https://")
    ? item.envValue
    : new URL(item.fallback, request.url).toString();

  return NextResponse.redirect(target, 302);
}
