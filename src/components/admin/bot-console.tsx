"use client";

import { useCallback, useEffect, useState } from "react";

type Settings = {
  enabled: boolean;
  kill_switch: boolean;
  discovery_daily_limit: number;
  outreach_daily_limit: number;
  follow_up_daily_limit: number;
  verification_daily_limit: number;
};

type Run = {
  id: number;
  status: "started" | "completed" | "failed";
  summary: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
};

type Prospect = {
  id: string;
  url: string;
  domain: string;
  contact_email: string | null;
  relevance_score: number;
  status: string;
  last_contacted_at: string | null;
  backlink_verified_at: string | null;
};

type Resource = {
  id: string;
  slug: string;
  title: string;
  status: string;
  published_at: string | null;
};

export function BotConsole() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setError("");
    const response = await fetch("/api/admin/bot", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Bot status could not be loaded.");
      return;
    }
    setSettings(data.settings);
    setRuns(data.runs ?? []);
    setProspects(data.prospects ?? []);
    setResources(data.resources ?? []);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  async function save(next: Settings) {
    setWorking("save");
    const response = await fetch("/api/admin/bot", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled: next.enabled,
        killSwitch: next.kill_switch,
        discoveryDailyLimit: next.discovery_daily_limit,
        outreachDailyLimit: next.outreach_daily_limit,
        followUpDailyLimit: next.follow_up_daily_limit,
        verificationDailyLimit: next.verification_daily_limit
      })
    });
    const data = await response.json();
    setWorking("");
    if (!response.ok) {
      setError(data.error ?? "Settings could not be saved.");
      return;
    }
    setSettings(data.settings);
    setNotice("Bot settings saved.");
    window.setTimeout(() => setNotice(""), 2500);
  }

  async function runNow() {
    setWorking("run");
    setError("");
    const response = await fetch("/api/admin/bot?action=run", { method: "POST" });
    const data = await response.json();
    setWorking("");
    if (!response.ok) {
      setError(data.error ?? "Bot run failed.");
      return;
    }
    setNotice(data.skipped ? `Run skipped: ${data.reason}.` : "Worker completed.");
    await load();
  }

  if (!settings) {
    return <section className="bot-console"><p>Loading bot controls…</p>{error ? <p className="admin-error">{error}</p> : null}</section>;
  }

  const liveLinks = prospects.filter((item) => item.status === "live").length;
  const contacted = prospects.filter((item) => item.status === "contacted").length;

  return (
    <section className="bot-console">
      <div className="growth-heading">
        <div>
          <p className="eyebrow">V7 Bot Worker</p>
          <h2>Autonomous organic operations.</h2>
          <p>
            Publishes useful VibeLytix resources, discovers relevant public opportunities, sends limited outreach,
            follows up twice at most, verifies backlinks and records every run.
          </p>
        </div>
        <button type="button" className="button button-primary" disabled={working === "run"} onClick={() => void runNow()}>
          {working === "run" ? "Running…" : "Run worker now"}
        </button>
      </div>

      <div className="bot-control-grid">
        <label className="bot-toggle">
          <span><strong>Autopilot</strong><small>Daily scheduled execution</small></span>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(event) => void save({ ...settings, enabled: event.target.checked })}
          />
        </label>
        <label className="bot-toggle bot-kill">
          <span><strong>Emergency kill switch</strong><small>Stops every worker action</small></span>
          <input
            type="checkbox"
            checked={settings.kill_switch}
            onChange={(event) => void save({ ...settings, kill_switch: event.target.checked })}
          />
        </label>
      </div>

      <div className="bot-limits">
        {[
          ["Discovery/day", "discovery_daily_limit", 50],
          ["Outreach/day", "outreach_daily_limit", 20],
          ["Follow-ups/day", "follow_up_daily_limit", 20],
          ["Verification/day", "verification_daily_limit", 200]
        ].map(([label, key, max]) => (
          <label key={String(key)}>
            <span>{label}</span>
            <input
              type="number"
              min="0"
              max={Number(max)}
              value={settings[key as keyof Settings] as number}
              onChange={(event) => setSettings({ ...settings, [key]: Number(event.target.value) })}
              onBlur={() => void save(settings)}
            />
          </label>
        ))}
      </div>

      <div className="admin-stats">
        <div><strong>{resources.length}</strong><span>Own resources</span></div>
        <div><strong>{prospects.length}</strong><span>Prospects loaded</span></div>
        <div><strong>{contacted}</strong><span>Contacted</span></div>
        <div><strong>{liveLinks}</strong><span>Verified links</span></div>
        <div><strong>{runs.filter((run) => run.status === "failed").length}</strong><span>Failed runs</span></div>
      </div>

      {error ? <p className="admin-error" role="alert">{error}</p> : null}
      {notice ? <p className="admin-notice" role="status">{notice}</p> : null}

      <div className="bot-columns">
        <div>
          <h3>Latest prospects</h3>
          <div className="bot-list">
            {prospects.slice(0, 12).map((prospect) => (
              <article key={prospect.id}>
                <div><strong>{prospect.domain}</strong><span>{prospect.status}</span></div>
                <a href={prospect.url} target="_blank" rel="noreferrer">{prospect.url}</a>
                <small>Relevance {prospect.relevance_score}/100 · {prospect.contact_email ?? "No public email found"}</small>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h3>Recent worker runs</h3>
          <div className="bot-list">
            {runs.map((run) => (
              <article key={run.id}>
                <div><strong>{new Date(run.started_at).toLocaleString()}</strong><span>{run.status}</span></div>
                <pre>{JSON.stringify(run.summary, null, 2)}</pre>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
