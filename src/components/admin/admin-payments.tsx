"use client";

import { useCallback, useEffect, useState } from "react";

type Payment = {
  id: string;
  customer_name: string;
  customer_email: string;
  utr: string;
  final_amount_paise: number;
  coupon_code: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  rejection_reason: string | null;
};

export function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/payments", { cache: "no-store" });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Payments could not be loaded.");
      return;
    }
    setPayments(data.payments);
    setEventCounts(data.eventCounts ?? {});
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  async function review(id: string, status: "approved" | "rejected") {
    const rejectionReason = status === "rejected"
      ? window.prompt("Reason shown to the customer:", "The transaction could not be verified.") ?? ""
      : undefined;

    const response = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, rejectionReason })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Review failed.");
      return;
    }
    setPayments((items) => items.map((item) => item.id === id ? {
      ...item,
      status,
      rejection_reason: rejectionReason ?? null
    } : item));
  }

  const pending = payments.filter((item) => item.status === "pending").length;
  const approvedRevenue = payments
    .filter((item) => item.status === "approved")
    .reduce((total, item) => total + item.final_amount_paise, 0);

  return (
    <section>
      <div className="admin-stats">
        <div><strong>{payments.length}</strong><span>Total requests</span></div>
        <div><strong>{pending}</strong><span>Pending review</span></div>
        <div><strong>₹{(approvedRevenue / 100).toFixed(0)}</strong><span>Approved revenue</span></div>
        <div><strong>{eventCounts.assessment_completed ?? 0}</strong><span>30-day completions</span></div>
        <div><strong>{eventCounts.affiliate_click ?? 0}</strong><span>30-day affiliate clicks</span></div>
        <button type="button" className="button button-secondary" onClick={() => void load()}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-payment-list">
        {payments.map((payment) => (
          <article key={payment.id}>
            <div>
              <span className={`payment-status payment-${payment.status}`}>{payment.status}</span>
              <h2>{payment.customer_name}</h2>
              <p>{payment.customer_email}</p>
            </div>
            <div className="payment-meta">
              <span>UTR <b>{payment.utr}</b></span>
              <span>Amount <b>₹{(payment.final_amount_paise / 100).toFixed(2)}</b></span>
              <span>Coupon <b>{payment.coupon_code ?? "—"}</b></span>
              <span>Submitted <b>{new Date(payment.created_at).toLocaleString()}</b></span>
            </div>
            {payment.status === "pending" ? (
              <div className="payment-actions">
                <button type="button" className="button button-primary" onClick={() => void review(payment.id, "approved")}>
                  Approve
                </button>
                <button type="button" className="button button-secondary" onClick={() => void review(payment.id, "rejected")}>
                  Reject
                </button>
              </div>
            ) : null}
          </article>
        ))}
        {!loading && payments.length === 0 ? <p className="dashboard-empty">No payment requests yet.</p> : null}
      </div>
    </section>
  );
}
