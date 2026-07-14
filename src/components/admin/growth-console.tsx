"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Channel = "seo" | "content" | "backlink" | "social" | "ads";
type Status = "draft" | "approved" | "published" | "rejected";

type GrowthItem = {
  id: string;
  channel: Channel;
  title: string;
  objective: string;
  target_url: string;
  content: string;
  metadata: Record<string, unknown>;
  status: Status;
  priority: number;
  scheduled_for: string;
};

const channelLabels: Record<Channel, string> = {
  seo: "SEO",
  content: "Content",
  backlink: "Backlink outreach",
  social: "Social",
  ads: "Ads"
};

export function GrowthConsole() {
  const [items, setItems] = useState<GrowthItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/growth", { cache: "no-store" });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Growth plan could not be loaded.");
      return;
    }
    setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  async function generate() {
    setWorking("generate");
    setError("");
    const response = await fetch("/api/admin/growth", { method: "POST" });
    const data = await response.json();
    setWorking("");
    if (!response.ok) {
      setError(data.error ?? "Plan generation failed.");
      return;
    }
    setItems(data.items ?? []);
    setNotice("Today’s five-channel growth plan is ready.");
    window.setTimeout(() => setNotice(""), 3500);
  }

  async function updateStatus(id: string, status: Status) {
    setWorking(id);
    const response = await fetch("/api/admin/growth", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
    const data = await response.json();
    setWorking("");
    if (!response.ok) {
      setError(data.error ?? "Status update failed.");
      return;
    }
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value.replaceAll("{{PUBLIC_URL}}", window.location.origin));
    setNotice("Draft copied. Personalise and verify it before publishing.");
    window.setTimeout(() => setNotice(""), 2800);
  }

  const counts = useMemo(() => (
    items.reduce<Record<Channel, number>>((result, item) => {
      result[item.channel] += 1;
      return result;
    }, { seo: 0, content: 0, backlink: 0, social: 0, ads: 0 })
  ), [items]);

  return (
    <section className="growth-console">
      <div className="growth-heading">
        <div>
          <p className="eyebrow">VibeLytix Growth OS</p>
          <h2>Daily traffic and revenue actions.</h2>
          <p>
            Core now applies owned-site SEO changes and publishes safe resources automatically.
            The worker also discovers prospects, sends limited outreach and verifies backlinks.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary"
          disabled={working === "generate" || items.length > 0}
          onClick={() => void generate()}
        >
          {working === "generate" ? "Generating…" : items.length ? "Today’s plan ready" : "Generate today’s plan"}
        </button>
      </div>

      <div className="growth-channel-summary">
        {(Object.keys(counts) as Channel[]).map((channel) => (
          <div key={channel}><strong>{counts[channel]}</strong><span>{channelLabels[channel]}</span></div>
        ))}
      </div>

      <div className="growth-safety-note">
        <strong>Safe automation:</strong>
        <span>
          Owned-site SEO and content run automatically. External publishing remains controlled.
          Outreach uses strict limits and public business contacts. Ads require owner approval and budget controls.
        </span>
      </div>

      {error ? <p className="admin-error" role="alert">{error}</p> : null}
      {notice ? <p className="admin-notice" role="status">{notice}</p> : null}
      {loading ? <p className="growth-loading">Loading today’s plan…</p> : null}

      <div className="growth-item-list">
        {items.map((item) => (
          <article key={item.id} className="growth-item-card">
            <div className="growth-item-top">
              <span className={`growth-channel growth-${item.channel}`}>{channelLabels[item.channel]}</span>
              <span className={`growth-status status-${item.status}`}>{item.status}</span>
              <span className="growth-priority">Priority {item.priority}</span>
            </div>
            <h3>{item.title}</h3>
            <p className="growth-objective">{item.objective}</p>
            <a href={item.target_url} target="_blank" rel="noreferrer">{item.target_url}</a>
            <pre>{item.content}</pre>
            <div className="growth-item-actions">
              <button type="button" className="button button-secondary" onClick={() => void copy(item.content)}>
                Copy details
              </button>
              <select
                aria-label={`Status for ${item.title}`}
                value={item.status}
                disabled={working === item.id}
                onChange={(event) => void updateStatus(item.id, event.target.value as Status)}
              >
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </article>
        ))}
      </div>

      {!loading && items.length === 0 ? (
        <div className="dashboard-empty">
          <h3>No plan generated for today</h3>
          <p>Generate one focused action for each growth channel. A new plan can be created each day.</p>
        </div>
      ) : null}
    </section>
  );
}
