import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function xml(value: unknown) {
  return String(value ?? "").replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;"
  })[character] ?? character);
}

export async function GET() {
  const { data } = await createAdminClient()
    .from("autonomous_resources")
    .select("slug,title,description,published_at,updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const feedUrl = `${base}/feed.xml`;
  const items = (data ?? []).map((item) => {
    const url = `${base}/resources/${item.slug}`;
    const date = new Date(item.updated_at ?? item.published_at ?? Date.now()).toUTCString();
    return `<item><title>${xml(item.title)}</title><link>${xml(url)}</link><guid isPermaLink="true">${xml(url)}</guid><description>${xml(item.description)}</description><pubDate>${xml(date)}</pubDate></item>`;
  }).join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>VibeLytix Resources</title><link>${xml(base)}</link><description>Practical self-awareness, career, relationship and personal-growth resources from VibeLytix.</description><language>en</language><atom:link href="https://pubsubhubbub.appspot.com/" rel="hub"/><atom:link href="${xml(feedUrl)}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      Link: `<https://pubsubhubbub.appspot.com/>; rel="hub", <${feedUrl}>; rel="self"`
    }
  });
}
