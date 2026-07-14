"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PremiumCheckout } from "@/components/assessment/premium-checkout";
import type { RevenueProduct } from "@/lib/products";

type Session = { sessionId: string; sessionToken: string };

export function ProductExperience({ product }: { product: RevenueProduct }) {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment");
  const paymentToken = searchParams.get("token");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [session, setSession] = useState<Session | null>(null);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [remoteStatus, setRemoteStatus] = useState<"pending" | "rejected" | null>(
    paymentId && paymentToken ? "pending" : null
  );

  useEffect(() => {
    if (!paymentId || !paymentToken || remoteStatus !== "pending") return;
    const currentPaymentId = paymentId;
    const currentPaymentToken = paymentToken;
    let active = true;
    async function check() {
      const statusResponse = await fetch(
        `/api/payments?id=${currentPaymentId}&token=${encodeURIComponent(currentPaymentToken)}`,
        { cache: "no-store" }
      );
      const statusData = await statusResponse.json();
      if (!active) return;
      if (statusData.status === "approved") {
        const response = await fetch(
          `/api/unlock?payment=${currentPaymentId}&token=${encodeURIComponent(currentPaymentToken)}`,
          { cache: "no-store" }
        );
        const data = await response.json();
        if (response.ok) setReport(data.report);
      } else if (statusData.status === "rejected") {
        setRemoteStatus("rejected");
        setError(statusData.rejectionReason ?? "The payment could not be verified.");
      }
    }
    void check();
    const timer = window.setInterval(() => void check(), 7000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [paymentId, paymentToken, remoteStatus]);

  async function createPlan() {
    if (product.questions.some((question) => !answers[question.id])) {
      setError("Answer all four questions to prepare your personalised system.");
      return;
    }
    setBusy(true);
    setError("");
    const response = await fetch(`/api/assessment/${product.slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productAnswers: answers })
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Your plan could not be prepared.");
      return;
    }
    setSession({ sessionId: data.sessionId, sessionToken: data.sessionToken });
  }

  if (remoteStatus === "pending" && !report) {
    return (
      <section className="checkout-status">
        <span className="checkout-loader" />
        <p className="eyebrow">Verification pending</p>
        <h2>Your payment reference is being checked.</h2>
        <p>This page checks automatically and unlocks the product after administrator verification.</p>
      </section>
    );
  }

  if (remoteStatus === "rejected" && !report) {
    return (
      <section className="checkout-status">
        <p className="eyebrow">Verification update</p>
        <h2>Payment could not be verified.</h2>
        <p>{error}</p>
        <a className="button button-secondary" href={`/products/${product.slug}`}>Start again</a>
      </section>
    );
  }

  if (report) {
    const value = report as {
      title?: string; subtitle?: string; summary?: string;
      strengths?: string[]; watchouts?: string[]; actionPlan?: string[];
      sevenDayPlan?: string[]; thirtyDayRoadmap?: string[];
    };
    return (
      <section className="product-report">
        <p className="eyebrow">Unlocked personalised system</p>
        <h2>{value.title}</h2>
        <p>{value.subtitle}</p>
        <div className="premium-callout"><p>{value.summary}</p></div>
        <div className="premium-narrative-grid">
          <div><span>Strengths</span>{value.strengths?.map((item) => <p key={item}>{item}</p>)}</div>
          <div><span>Watchouts</span>{value.watchouts?.map((item) => <p key={item}>{item}</p>)}</div>
        </div>
        <section className="report-block">
          <h3>Action system</h3>
          <div className="timeline-plan">{value.actionPlan?.map((item, index) => <div key={item}><span>{index + 1}</span><p>{item}</p></div>)}</div>
        </section>
        <section className="report-block">
          <h3>7-day plan</h3>
          <div className="timeline-plan">{value.sevenDayPlan?.map((item, index) => <div key={item}><span>{index + 1}</span><p>{item}</p></div>)}</div>
        </section>
        <section className="report-block">
          <h3>30-day roadmap</h3>
          <div className="roadmap-grid">{value.thirtyDayRoadmap?.map((item) => <div key={item}><p>{item}</p></div>)}</div>
        </section>
        <button className="button button-secondary" type="button" onClick={() => window.print()}>Save as PDF</button>
      </section>
    );
  }

  if (session) {
    return (
      <PremiumCheckout
        sessionId={session.sessionId}
        sessionToken={session.sessionToken}
        assessmentId={product.slug}
        reportTitle={product.title}
        onUnlocked={(unlocked) => setReport(unlocked as unknown as Record<string, unknown>)}
      />
    );
  }

  return (
    <section className="product-builder">
      <div className="product-question-grid">
        {product.questions.map((question) => (
          <fieldset key={question.id}>
            <legend>{question.label}</legend>
            {question.options.map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name={question.id}
                  checked={answers[question.id] === option}
                  onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </div>
      {error ? <p className="checkout-message" role="alert">{error}</p> : null}
      <button className="button button-primary" type="button" disabled={busy} onClick={() => void createPlan()}>
        {busy ? "Preparing…" : "Prepare my personalised system"}
      </button>
      <small>Preview the product structure before payment. Unlock uses the existing GPay/UPI and UTR verification flow.</small>
    </section>
  );
}
