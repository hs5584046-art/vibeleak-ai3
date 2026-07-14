"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon, LockIcon } from "@/components/ui/icons";
import type { PersonalityReport } from "@/lib/assessment/types";
import type { ExpansionReport } from "@/lib/assessment/expansion";

type UnlockableReport = PersonalityReport | ExpansionReport;

type Quote = {
  amountLabel: string;
  finalAmountLabel: string;
  discountPaise: number;
  couponCode: string | null;
  upiUri: string;
};

export function PremiumCheckout({
  sessionId,
  sessionToken,
  restoredPayment,
  onUnlocked,
  assessmentId,
  reportTitle
}: {
  sessionId: string;
  sessionToken: string;
  restoredPayment?: { id: string; token: string } | null;
  onUnlocked: (report: UnlockableReport) => void;
  assessmentId?: string;
  reportTitle?: string;
}) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [coupon, setCoupon] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [utr, setUtr] = useState("");
  const [payment, setPayment] = useState(restoredPayment ?? null);
  const [status, setStatus] = useState<"checkout" | "pending" | "rejected">(
    restoredPayment ? "pending" : "checkout"
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function getQuote(code = coupon) {
    setBusy(true);
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "quote",
        sessionId,
        sessionToken,
        couponCode: code
      })
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(data.error ?? "Price could not be calculated.");
      return;
    }
    setQuote(data);
    setMessage(code && !data.couponCode ? "Coupon is invalid or expired." : data.couponCode ? `${data.couponCode} applied.` : "");
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => void getQuote(""), 0);
    return () => window.clearTimeout(timeout);
    // Initial quote only; coupon changes are applied explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, sessionToken]);

  useEffect(() => {
    if (!payment || status !== "pending") return;
    const poll = window.setInterval(async () => {
      const response = await fetch(`/api/payments?id=${payment.id}&token=${encodeURIComponent(payment.token)}`, { cache: "no-store" });
      const data = await response.json();
      if (data.status === "approved") {
        const unlock = await fetch(`/api/unlock?payment=${payment.id}&token=${encodeURIComponent(payment.token)}`, { cache: "no-store" });
        const unlocked = await unlock.json();
        if (unlock.ok) onUnlocked(unlocked.report);
      }
      if (data.status === "rejected") {
        setStatus("rejected");
        setMessage(data.rejectionReason ?? "The transaction could not be verified.");
      }
    }, 7000);
    return () => window.clearInterval(poll);
  }, [onUnlocked, payment, status]);

  async function submit(event: React.FormEvent) {
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventName: "payment_submitted",
        path: window.location.pathname,
        metadata: { assessmentId: assessmentId ?? "personality-dna" }
      })
    });
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "submit",
        sessionId,
        sessionToken,
        couponCode: coupon,
        customerName: name,
        customerEmail: email,
        utr
      })
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(data.error ?? "Payment could not be submitted.");
      return;
    }

    const nextPayment = { id: data.paymentId, token: data.statusToken };
    window.localStorage.setItem(`vibelytix-premium-payment-${assessmentId ?? "personality-dna"}-v1`, JSON.stringify(nextPayment));
    setPayment(nextPayment);
    setStatus("pending");
  }

  if (status === "pending") {
    return (
      <div className="checkout-status">
        <span className="checkout-loader" />
        <p className="eyebrow">Verification pending</p>
        <h2>Your payment reference is being checked.</h2>
        <p>This page checks automatically. You will also receive an email status link when email delivery is configured.</p>
        <small>Payment request: {payment?.id.slice(0, 8).toUpperCase()}</small>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="checkout-status">
        <p className="eyebrow">Verification update</p>
        <h2>We could not verify this payment.</h2>
        <p>{message}</p>
        <button type="button" className="button button-secondary" onClick={() => setStatus("checkout")}>
          Submit another UTR
        </button>
      </div>
    );
  }

  return (
    <div className="premium-checkout">
      <div className="checkout-head">
        <p className="eyebrow"><LockIcon /> Premium unlock</p>
        <h2>Unlock the complete {reportTitle ?? "premium report"}.</h2>
        <p>One-time payment. No subscription.</p>
      </div>

      <div className="checkout-price">
        <span>{quote?.discountPaise ? <s>{quote.amountLabel}</s> : "Full report"}</span>
        <strong>{quote?.finalAmountLabel ?? "₹149"}</strong>
      </div>

      <div className="coupon-row">
        <input value={coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} placeholder="Coupon code" />
        <button type="button" className="button button-secondary" disabled={busy} onClick={() => void getQuote()}>
          Apply
        </button>
      </div>

      {message ? <p className="checkout-message">{message}</p> : null}

      {quote ? (
        <a href={quote.upiUri} className="button button-primary checkout-pay">
          Pay {quote.finalAmountLabel} with UPI <ArrowRightIcon />
        </a>
      ) : null}

      <div className="checkout-upi">
        <span>UPI ID</span>
        <strong>{process.env.NEXT_PUBLIC_UPI_ID ?? "Configured on deployment"}</strong>
      </div>

      <form onSubmit={submit}>
        <label>Name<input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>UPI transaction ID / UTR<input required minLength={6} value={utr} onChange={(event) => setUtr(event.target.value.replace(/\s/g, ""))} /></label>
        <button className="button button-primary" disabled={busy}>
          {busy ? "Submitting…" : "Submit for verification"}
        </button>
      </form>

      <small>Never share your UPI PIN, OTP or banking password. Only the transaction reference is required.</small>
    </div>
  );
}
