"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AccountActions({
  mode,
  reportId
}: {
  mode: "account" | "report";
  reportId?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  async function deleteReport() {
    if (!reportId || !window.confirm("Delete this saved report permanently?")) return;
    setBusy(true);
    const response = await fetch(`/api/reports?id=${encodeURIComponent(reportId)}`, { method: "DELETE" });
    setBusy(false);
    if (response.ok) router.refresh();
  }

  async function exportReports() {
    setBusy(true);
    const response = await fetch("/api/reports?format=export");
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "vibelytix-reports.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (mode === "report") {
    return (
      <button type="button" className="danger-link" disabled={busy} onClick={deleteReport}>
        {busy ? "Deleting…" : "Delete"}
      </button>
    );
  }

  return (
    <div className="account-actions">
      <button type="button" className="button button-secondary" disabled={busy} onClick={exportReports}>
        Export reports
      </button>
      <button type="button" className="button button-secondary" disabled={busy} onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}
