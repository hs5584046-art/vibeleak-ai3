import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { escapeHtml, sendEmail } from "@/lib/email";

type Database = ReturnType<typeof createAdminClient>;

const searchQueries = [
  '"personality test" resources submit tool',
  '"career assessment" useful resources contact',
  '"relationship communication" resources newsletter',
  '"leadership assessment" resource page contact',
  '"self improvement tools" directory submit',
  '"career guidance resources" add resource'
];

const ownResources = [
  {
    slug: "weekly-self-awareness-review",
    title: "Weekly Self-Awareness Review",
    description: "A practical weekly worksheet for noticing patterns, decisions, stress and progress.",
    sections: [
      ["1. What gave you energy?", "Write two situations that created focus, connection or useful momentum. Identify the conditions that made them possible."],
      ["2. What created friction?", "Describe one recurring difficulty without judging your identity. Separate the trigger, interpretation, action and result."],
      ["3. What did stress change?", "Notice whether pressure made you overthink, rush, withdraw or seek reassurance. Choose one healthier reset for next time."],
      ["4. What needs a direct conversation?", "Write the observation, impact, need and one clear request. Remove mind-reading and unnecessary blame."],
      ["5. What is next week’s experiment?", "Choose one action small enough to complete and specific enough to produce evidence."]
    ]
  },
  {
    slug: "career-fit-decision-scorecard",
    title: "Career Fit Decision Scorecard",
    description: "Compare roles using autonomy, learning, impact, structure, energy and sustainability.",
    sections: [
      ["Autonomy", "Score how much control the role gives you over method, priorities and day-to-day execution."],
      ["Learning", "Score whether the role creates a visible path to stronger, valuable and transferable skills."],
      ["Meaningful impact", "Score how clearly you can see the result of your work and why it matters."],
      ["Structure", "Score whether expectations, feedback and decision ownership match your preferred working style."],
      ["Energy", "Score whether the normal daily tasks create focused effort or repeated depletion."],
      ["Sustainability", "Score income, schedule, commute, health impact and realistic long-term fit."]
    ]
  },
  {
    slug: "difficult-conversation-planner",
    title: "Difficult Conversation Planner",
    description: "Prepare a calm, direct conversation using observation, impact, need, request and boundary.",
    sections: [
      ["Observation", "What happened that another person could verify? Avoid labels such as careless, selfish or impossible."],
      ["Impact", "What practical or emotional effect did the behaviour have? Keep the description proportionate."],
      ["Need", "What value or need matters here—clarity, respect, reliability, space, reassurance or fairness?"],
      ["Request", "What specific behaviour are you asking for next? Make it clear enough to answer yes, no or propose an alternative."],
      ["Boundary", "What action will you take if the pattern continues? Choose something you control and can realistically follow."]
    ]
  }
] as const;

function text(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function extractLinks(xml: string) {
  const links = [...xml.matchAll(/<link>(https?:\/\/[^<]+)<\/link>/gi)]
    .map((match) => match[1])
    .filter((url) => !url.includes("bing.com"));
  return [...new Set(links)].slice(0, 12);
}

function extractPublicEmail(html: string) {
  const mailto = html.match(/mailto:([^"'? <]+)/i)?.[1];
  if (mailto) return decodeURIComponent(mailto).toLowerCase();
  const visible = html.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0];
  return visible?.toLowerCase() ?? null;
}

function relevanceScore(url: string, html: string) {
  const value = `${url} ${html.slice(0, 8000)}`.toLowerCase();
  const positive = ["personality", "career", "relationship", "leadership", "self improvement", "resources", "assessment"];
  const negative = ["casino", "betting", "adult", "crypto", "payday", "essay writing", "link farm"];
  let score = 30;
  score += positive.filter((term) => value.includes(term)).length * 10;
  score -= negative.filter((term) => value.includes(term)).length * 30;
  if (value.includes("contact")) score += 5;
  if (value.includes("resources")) score += 8;
  return Math.max(0, Math.min(100, score));
}

async function discoverProspects(database: Database, limit: number) {
  const query = searchQueries[new Date().getUTCDate() % searchQueries.length];
  const response = await fetch(`https://www.bing.com/search?format=rss&q=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": "VibeLytixGrowthBot/1.0 (+https://vibelytix.lol)" },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) return { discovered: 0 };

  const links = extractLinks(await response.text()).slice(0, limit);
  let discovered = 0;

  for (const url of links) {
    try {
      const page = await fetch(url, {
        headers: { "User-Agent": "VibeLytixGrowthBot/1.0 (+https://vibelytix.lol)" },
        redirect: "follow",
        signal: AbortSignal.timeout(10000)
      });
      if (!page.ok || !page.headers.get("content-type")?.includes("text/html")) continue;
      const html = await page.text();
      const score = relevanceScore(url, html);
      if (score < 55) continue;
      const email = extractPublicEmail(html);

      const { error } = await database.from("backlink_prospects").upsert({
        url,
        domain: new URL(url).hostname.replace(/^www\./, ""),
        contact_email: email,
        relevance_score: score,
        status: email ? "ready" : "discovered",
        source: "public-search",
        updated_at: new Date().toISOString()
      }, { onConflict: "url", ignoreDuplicates: true });

      if (!error) discovered += 1;
    } catch {
      // Discovery continues when an individual site is unavailable.
    }
  }
  return { discovered };
}

async function publishOwnResource(database: Database) {
  const index = Math.floor(Date.now() / 86400000) % ownResources.length;
  const resource = ownResources[index];
  const { data: existing } = await database
    .from("autonomous_resources")
    .select("id")
    .eq("slug", resource.slug)
    .maybeSingle();

  if (existing) return { published: 0, url: `/resources/${resource.slug}` };

  const body = resource.sections.map(([heading, paragraph]) => ({ heading, paragraph }));
  const { error } = await database.from("autonomous_resources").insert({
    slug: resource.slug,
    title: resource.title,
    description: resource.description,
    body,
    status: "published",
    published_at: new Date().toISOString()
  });
  if (error) throw error;
  return { published: 1, url: `/resources/${resource.slug}` };
}

async function sendOutreach(database: Database, limit: number) {
  if (!env.RESEND_API_KEY) return { sent: 0, reason: "email_not_configured" };

  const { data: prospects } = await database
    .from("backlink_prospects")
    .select("id,url,domain,contact_email,relevance_score")
    .eq("status", "ready")
    .not("contact_email", "is", null)
    .order("relevance_score", { ascending: false })
    .limit(limit);

  let sent = 0;
  for (const prospect of prospects ?? []) {
    const subject = `Useful self-assessment resource for ${prospect.domain}`;
    const html = `<p>Hello,</p>
<p>I found your resource while researching practical personality, career and communication tools.</p>
<p>VibeLytix offers free assessment previews and practical worksheets. This resource may be useful if it genuinely improves your page:</p>
<p><a href="${escapeHtml(env.NEXT_PUBLIC_APP_URL)}/assessments/personality-dna">${escapeHtml(env.NEXT_PUBLIC_APP_URL)}/assessments/personality-dna</a></p>
<p>No link exchange or payment is requested. Please ignore this message if it is not relevant.</p>
<p>Regards,<br>VibeLytix</p>`;

    const result = await sendEmail({ to: prospect.contact_email, subject, html });
    if (!result.delivered) continue;

    await database.from("outreach_messages").insert({
      prospect_id: prospect.id,
      recipient: prospect.contact_email,
      subject,
      body_html: html,
      status: "sent",
      sent_at: new Date().toISOString(),
      follow_up_number: 0
    });
    await database.from("backlink_prospects").update({
      status: "contacted",
      last_contacted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq("id", prospect.id);
    sent += 1;
  }
  return { sent };
}

async function sendFollowUps(database: Database, limit: number) {
  if (!env.RESEND_API_KEY) return { followUps: 0 };
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: prospects } = await database
    .from("backlink_prospects")
    .select("id,url,domain,contact_email,last_contacted_at,follow_up_count")
    .eq("status", "contacted")
    .lt("last_contacted_at", cutoff)
    .lt("follow_up_count", 2)
    .not("contact_email", "is", null)
    .limit(limit);

  let followUps = 0;
  for (const prospect of prospects ?? []) {
    const nextNumber = (prospect.follow_up_count ?? 0) + 1;
    const subject = `Follow-up: VibeLytix resource for ${prospect.domain}`;
    const html = `<p>Hello,</p>
<p>A brief follow-up in case the VibeLytix resource is useful for your readers:</p>
<p><a href="${escapeHtml(env.NEXT_PUBLIC_APP_URL)}/assessments/personality-dna">${escapeHtml(env.NEXT_PUBLIC_APP_URL)}/assessments/personality-dna</a></p>
<p>I will not send another message after the permitted follow-up sequence.</p>
<p>Regards,<br>VibeLytix</p>`;
    const result = await sendEmail({ to: prospect.contact_email, subject, html });
    if (!result.delivered) continue;

    await database.from("outreach_messages").insert({
      prospect_id: prospect.id,
      recipient: prospect.contact_email,
      subject,
      body_html: html,
      status: "sent",
      sent_at: new Date().toISOString(),
      follow_up_number: nextNumber
    });
    await database.from("backlink_prospects").update({
      follow_up_count: nextNumber,
      last_contacted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq("id", prospect.id);
    followUps += 1;
  }
  return { followUps };
}

async function verifyBacklinks(database: Database, limit: number) {
  const { data: prospects } = await database
    .from("backlink_prospects")
    .select("id,url,status")
    .in("status", ["contacted", "approved", "live"])
    .limit(limit);

  let live = 0;
  for (const prospect of prospects ?? []) {
    try {
      const response = await fetch(prospect.url, {
        headers: { "User-Agent": "VibeLytixGrowthBot/1.0 (+https://vibelytix.lol)" },
        signal: AbortSignal.timeout(10000)
      });
      const html = response.ok ? await response.text() : "";
      const found = html.toLowerCase().includes("vibelytix.lol");
      await database.from("backlink_prospects").update({
        status: found ? "live" : prospect.status === "live" ? "lost" : prospect.status,
        backlink_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq("id", prospect.id);
      if (found) live += 1;
    } catch {
      // Verification continues for remaining prospects.
    }
  }
  return { live };
}

async function notifyIndexNow(urls: string[]) {
  if (!env.INDEXNOW_KEY || urls.length === 0) return { notified: 0 };
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(env.NEXT_PUBLIC_APP_URL).hostname,
      key: env.INDEXNOW_KEY,
      keyLocation: `${env.NEXT_PUBLIC_APP_URL}/api/indexnow-key`,
      urlList: urls.map((path) => `${env.NEXT_PUBLIC_APP_URL}${path}`)
    }),
    signal: AbortSignal.timeout(12000)
  });
  return { notified: response.ok ? urls.length : 0 };
}

export async function runGrowthWorker() {
  const database = createAdminClient();
  const { data: settings } = await database
    .from("bot_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (!settings?.enabled || settings.kill_switch) {
    return { skipped: true, reason: settings?.kill_switch ? "kill_switch" : "disabled" };
  }

  const { data: run, error } = await database.from("autopilot_runs").insert({
    run_type: "growth-worker",
    status: "started",
    summary: {}
  }).select("id").single();
  if (error || !run) throw error ?? new Error("Worker run could not start.");

  try {
    const resource = await publishOwnResource(database);
    const discovery = await discoverProspects(database, settings.discovery_daily_limit);
    const outreach = await sendOutreach(database, settings.outreach_daily_limit);
    const followUps = await sendFollowUps(database, settings.follow_up_daily_limit);
    const verification = await verifyBacklinks(database, settings.verification_daily_limit);
    const indexing = await notifyIndexNow(resource.published ? [resource.url] : []);
    const summary = { resource, discovery, outreach, followUps, verification, indexing };

    await database.from("autopilot_runs").update({
      status: "completed",
      summary,
      completed_at: new Date().toISOString()
    }).eq("id", run.id);

    return { skipped: false, summary };
  } catch (error) {
    await database.from("autopilot_runs").update({
      status: "failed",
      summary: { error: text(error) },
      completed_at: new Date().toISOString()
    }).eq("id", run.id);
    throw error;
  }
}
