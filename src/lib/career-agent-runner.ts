import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

const FOLLOW_UP_DELAYS_DAYS = [7, 14] as const;

type ProfileRow = {
  full_name: string;
  current_title: string;
  location: string;
  email: string;
  resume_url: string | null;
  enabled: boolean;
  daily_send_limit: number;
};

type OpportunityRow = {
  id: string;
  title: string;
  organisation: string;
  source_url: string;
  contact_email: string | null;
  status: string;
};

type OutreachRow = {
  id: string;
  opportunity_id: string;
  recipient: string;
  subject: string;
  body_text: string;
  message_type: "initial" | "follow_up_1" | "follow_up_2";
};

function addDays(value: Date, days: number): string {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

async function sendWithResend(input: {
  to: string;
  subject: string;
  text: string;
  replyTo: string;
}): Promise<string> {
  if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      reply_to: input.replyTo
    })
  });

  const payload = (await response.json()) as { id?: string; message?: string };
  if (!response.ok || !payload.id) throw new Error(payload.message ?? `Resend failed with ${response.status}`);
  return payload.id;
}

async function scheduleFollowUp(
  outreach: OutreachRow,
  opportunity: OpportunityRow,
  profile: ProfileRow,
  sentAt: Date
) {
  const supabase = createAdminClient();
  const currentIndex = outreach.message_type === "initial" ? 0 : outreach.message_type === "follow_up_1" ? 1 : 2;
  if (currentIndex >= 2) return;

  const nextType = currentIndex === 0 ? "follow_up_1" : "follow_up_2";
  const delay = FOLLOW_UP_DELAYS_DAYS[currentIndex];
  const final = nextType === "follow_up_2";
  const body = [
    "Dear Hiring Team,",
    "",
    final
      ? `I wanted to send one final, brief follow-up regarding my application for ${opportunity.title} at ${opportunity.organisation}.`
      : `I wanted to follow up regarding my application for ${opportunity.title} at ${opportunity.organisation}.`,
    "",
    "I remain interested and would be glad to share any additional information that may help your review.",
    "",
    final
      ? "I understand priorities change, so I will not send further follow-ups after this message."
      : "Thank you for your time and consideration.",
    "",
    "Best regards,",
    profile.full_name,
    profile.email
  ].join("\n");

  await supabase.from("career_outreach").upsert(
    {
      opportunity_id: opportunity.id,
      recipient: outreach.recipient,
      subject: `Re: ${outreach.subject.replace(/^Re:\s*/i, "")}`,
      body_text: body,
      message_type: nextType,
      status: "queued",
      scheduled_for: addDays(sentAt, delay)
    },
    { onConflict: "opportunity_id,message_type", ignoreDuplicates: true }
  );
}

export async function runCareerAgent() {
  const supabase = createAdminClient();
  const startedAt = new Date();
  const { data: run } = await supabase
    .from("career_agent_runs")
    .insert({ status: "started", summary: {} })
    .select("id")
    .single();

  try {
    const { data: profileData, error: profileError } = await supabase
      .from("agent_profile")
      .select("full_name,current_title,location,email,resume_url,enabled,daily_send_limit")
      .eq("id", 1)
      .single();
    if (profileError) throw profileError;

    const profile = profileData as ProfileRow;
    if (!profile.enabled) {
      const summary = { sent: 0, skipped: 0, status: "disabled", reason: "Enable agent_profile only after profile and sender verification." };
      if (run?.id) await supabase.from("career_agent_runs").update({ status: "completed", summary, completed_at: new Date().toISOString() }).eq("id", run.id);
      return summary;
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const { count: sentToday } = await supabase
      .from("career_outreach")
      .select("id", { count: "exact", head: true })
      .eq("status", "sent")
      .gte("sent_at", today.toISOString());

    const remaining = Math.max(0, profile.daily_send_limit - (sentToday ?? 0));
    if (!remaining) return { sent: 0, skipped: 0, status: "daily-limit-reached" };

    const { data: queued, error: queueError } = await supabase
      .from("career_outreach")
      .select("id,opportunity_id,recipient,subject,body_text,message_type")
      .eq("status", "queued")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true })
      .limit(remaining);
    if (queueError) throw queueError;

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const item of (queued ?? []) as OutreachRow[]) {
      const recipient = item.recipient.trim().toLowerCase();
      const [{ data: suppression }, { data: opportunityData }] = await Promise.all([
        supabase.from("career_suppressions").select("email").eq("email", recipient).maybeSingle(),
        supabase.from("career_opportunities").select("id,title,organisation,source_url,contact_email,status").eq("id", item.opportunity_id).single()
      ]);
      const opportunity = opportunityData as OpportunityRow | null;

      if (suppression || !opportunity || ["replied", "rejected", "closed", "blocked"].includes(opportunity.status)) {
        await supabase.from("career_outreach").update({ status: "suppressed" }).eq("id", item.id);
        skipped += 1;
        continue;
      }

      await supabase.from("career_outreach").update({ status: "sending" }).eq("id", item.id).eq("status", "queued");

      try {
        const resumeLine = profile.resume_url ? `\nCV: ${profile.resume_url}` : "";
        const providerId = await sendWithResend({
          to: recipient,
          subject: item.subject,
          text: `${item.body_text}${resumeLine}`,
          replyTo: profile.email
        });
        const sentAt = new Date();
        await supabase.from("career_outreach").update({ status: "sent", provider_message_id: providerId, sent_at: sentAt.toISOString(), last_error: null }).eq("id", item.id);
        await supabase.from("career_opportunities").update({ status: "contacted", updated_at: sentAt.toISOString() }).eq("id", opportunity.id);
        await scheduleFollowUp(item, opportunity, profile, sentAt);
        sent += 1;
      } catch (error) {
        await supabase.from("career_outreach").update({ status: "failed", last_error: error instanceof Error ? error.message.slice(0, 500) : "Unknown send error" }).eq("id", item.id);
        failed += 1;
      }
    }

    const summary = { sent, skipped, failed, queued: queued?.length ?? 0, remainingAfterRun: Math.max(0, remaining - sent) };
    if (run?.id) await supabase.from("career_agent_runs").update({ status: "completed", summary, completed_at: new Date().toISOString() }).eq("id", run.id);
    return summary;
  } catch (error) {
    const summary = { error: error instanceof Error ? error.message : "Unknown career agent error", startedAt: startedAt.toISOString() };
    if (run?.id) await supabase.from("career_agent_runs").update({ status: "failed", summary, completed_at: new Date().toISOString() }).eq("id", run.id);
    throw error;
  }
}
