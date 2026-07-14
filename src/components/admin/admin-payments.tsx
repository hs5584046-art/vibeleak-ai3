"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type PaymentStatus = "pending" | "approved" | "rejected";
type Payment = {
  id: string;
  session_id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  utr: string;
  amount_paise: number;
  discount_paise: number;
  final_amount_paise: number;
  currency: string;
  coupon_code: string | null;
  status: PaymentStatus;
  created_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
};

const productNames: Record<string, string> = {
  "personality-dna-premium": "Personality DNA",
  "relationship-intelligence-premium": "Relationship Intelligence",
  "career-alignment-premium": "Career Alignment",
  "growth-systems-premium": "Growth Systems",
  "attachment-style-premium": "Attachment Style",
  "emotional-intelligence-premium": "Emotional Intelligence",
  "communication-style-premium": "Communication Style",
  "leadership-style-premium": "Leadership Style"
};

export function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("pending");
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search.trim()) params.set("search", search.trim());

    const response = await fetch(`/api/admin/payments?${params.toString()}`, {
      cache: "no-store",
      credentials: "same-origin"
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Payments could not be loaded.");
      return;
    }

    setPayments(data.payments ?? []);
    setEventCounts(data.eventCounts ?? {});
    setTotalCount(data.totalCount ?? data.payments?.length ?? 0);
  }, [search, statusFilter]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  async function copyUtr(utr: string) {
    await navigator.clipboard.writeText(utr);
    setNotice(`UTR ${utr} copied.`);
    window.setTimeout(() => setNotice(""), 2200);
  }

  async function review(payment: Payment, status: "approved" | "rejected") {
    const confirmation = status === "approved"
      ? window.confirm(
          `Approve ₹${(payment.final_amount_paise / 100).toFixed(2)} from ${payment.customer_name}?\n\nUTR: ${payment.utr}\n\nApprove only after matching this UTR in your bank or UPI merchant records.`
        )
      : true;

    if (!confirmation) return;

    const rejectionReason = status === "rejected"
      ? window.prompt(
          "Reason shown to the customer:",
          "The transaction reference or amount could not be matched in our payment records."
        )?.trim()
      : undefined;

    if (status === "rejected" && !rejectionReason) return;

    setReviewingId(payment.id);
    setError("");
    setNotice("");

    const response = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        id: payment.id,
        status,
        rejectionReason
      })
    });
    const data = await response.json();
    setReviewingId("");

    if (!response.ok) {
      setError(data.error ?? "Review failed.");
      return;
    }

    setNotice(
      status === "approved"
        ? `Payment approved. The report status page will unlock automatically.${data.emailSent ? " Email sent." : ""}`
        : `Payment rejected.${data.emailSent ? " Email sent." : ""}`
    );
    setPayments((items) => items.filter((item) => item.id !== payment.id));
    window.setTimeout(() => setNotice(""), 4500);
  }

  const summary = useMemo(() => {
    const pending = payments.filter((item) => item.status === "pending").length;
    const approvedRevenue = payments
      .filter((item) => item.status === "approved")
      .reduce((total, item) => total + item.final_amount_paise, 0);
    return { pending, approvedRevenue };
  }, [payments]);

  return (
    <section className="admin-console">
      <div className="admin-stats">
        <div><strong>{totalCount}</strong><span>All requests</span></div>
        <div><strong>{statusFilter === "pending" ? payments.length : summary.pending}</strong><span>Pending shown</span></div>
        <div><strong>₹{(summary.approvedRevenue / 100).toFixed(0)}</strong><span>Approved in view</span></div>
        <div><strong>{eventCounts.assessment_completed ?? 0}</strong><span>30-day completions</span></div>
        <div><strong>{eventCounts.affiliate_click ?? 0}</strong><span>30-day affiliate clicks</span></div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-filters" role="group" aria-label="Payment status filter">
          {(["pending", "all", "approved", "rejected"] as const).map((value) => (
            <button
              type="button"
              key={value}
              className={statusFilter === value ? "admin-filter active" : "admin-filter"}
              onClick={() => setStatusFilter(value)}
            >
              {value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
        <form
          className="admin-search"
          onSubmit={(event) => {
            event.preventDefault();
            void load();
          }}
        >
          <input
            type="search"
            aria-label="Search payments"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, UTR or product"
          />
          <button type="submit" className="button button-secondary">
            {loading ? "Loading…" : "Search"}
          </button>
          <button type="button" className="button button-secondary" onClick={() => void load()}>
            Refresh
          </button>
        </form>
      </div>

      <div className="admin-verification-note">
        <strong>Verification rule:</strong>
        <span>Approve only after the UTR, amount and date match your real bank or UPI merchant transaction.</span>
      </div>

      {error ? <p className="admin-error" role="alert">{error}</p> : null}
      {notice ? <p className="admin-notice" role="status">{notice}</p> : null}

      <div className="admin-payment-list">
        {payments.map((payment) => {
          const originalAmount = payment.amount_paise / 100;
          const paidAmount = payment.final_amount_paise / 100;
          const discount = payment.discount_paise / 100;

          return (
            <article key={payment.id} className="admin-payment-card">
              <div className="admin-payment-primary">
                <div>
                  <span className={`payment-status payment-${payment.status}`}>{payment.status}</span>
                  <span className="admin-request-id">Request {payment.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <h2>{payment.customer_name}</h2>
                <a href={`mailto:${payment.customer_email}`}>{payment.customer_email}</a>
                <p>{productNames[payment.product_id] ?? payment.product_id}</p>
              </div>

              <dl className="admin-payment-details">
                <div className="utr-detail">
                  <dt>UPI transaction ID / UTR</dt>
                  <dd>
                    <code>{payment.utr}</code>
                    <button type="button" onClick={() => void copyUtr(payment.utr)}>Copy</button>
                  </dd>
                </div>
                <div><dt>Paid amount</dt><dd>₹{paidAmount.toFixed(2)} {payment.currency}</dd></div>
                <div><dt>Original price</dt><dd>₹{originalAmount.toFixed(2)}</dd></div>
                <div><dt>Discount</dt><dd>{discount ? `₹${discount.toFixed(2)}` : "—"}</dd></div>
                <div><dt>Coupon</dt><dd>{payment.coupon_code ?? "—"}</dd></div>
                <div><dt>Submitted</dt><dd>{new Date(payment.created_at).toLocaleString()}</dd></div>
                <div><dt>Session</dt><dd><code>{payment.session_id.slice(0, 8).toUpperCase()}</code></dd></div>
                {payment.reviewed_at ? (
                  <div><dt>Reviewed</dt><dd>{new Date(payment.reviewed_at).toLocaleString()}</dd></div>
                ) : null}
              </dl>

              {payment.rejection_reason ? (
                <p className="admin-rejection-reason">
                  <strong>Rejection reason:</strong> {payment.rejection_reason}
                </p>
              ) : null}

              {payment.status === "pending" ? (
                <div className="payment-actions">
                  <button
                    type="button"
                    className="button button-primary"
                    disabled={reviewingId === payment.id}
                    onClick={() => void review(payment, "approved")}
                  >
                    {reviewingId === payment.id ? "Saving…" : "Approve & unlock"}
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={reviewingId === payment.id}
                    onClick={() => void review(payment, "rejected")}
                  >
                    Reject with reason
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}

        {!loading && payments.length === 0 ? (
          <div className="dashboard-empty">
            <h2>No matching payment requests</h2>
            <p>New UTR submissions will appear here. Try the All filter if you are viewing Pending only.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
