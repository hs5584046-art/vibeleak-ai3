"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type ExpansionAnswer,
  type ExpansionAnswers,
  type ExpansionAssessment,
  type ExpansionReport
} from "@/lib/assessment/expansion";
import { AffiliateRecommendations } from "@/components/site/affiliate-recommendations";
import { PremiumCheckout } from "@/components/assessment/premium-checkout";
import { CloudSaveButton } from "@/components/account/cloud-save-button";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ClockIcon, LockIcon, SparklesIcon } from "@/components/ui/icons";

type Preview = Pick<ExpansionReport, "title" | "subtitle" | "summary"> & {
  dimensions: ExpansionReport["dimensions"];
};
type Session = { sessionId: string; sessionToken: string; preview: Preview };
type Payment = { id: string; token: string };
type Stage = "intro" | "questions" | "submitting" | "preview" | "checkout" | "status" | "report";

function track(eventName: "assessment_started" | "assessment_completed" | "checkout_started", assessmentId: string) {
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ eventName, path: window.location.pathname, metadata: { assessmentId } })
  });
}

export function ExpansionExperience({ assessment }: { assessment: ExpansionAssessment }) {
  const keys = useMemo(() => ({
    progress: `vibelytix-${assessment.id}-progress-v2`,
    session: `vibelytix-${assessment.id}-session-v2`,
    payment: `vibelytix-premium-payment-${assessment.id}-v1`,
    report: `vibelytix-${assessment.id}-report-v2`
  }), [assessment.id]);

  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ExpansionAnswers>({});
  const [session, setSession] = useState<Session | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [report, setReport] = useState<ExpansionReport | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const unlock = useCallback((value: ExpansionReport) => {
    window.localStorage.setItem(keys.report, JSON.stringify(value));
    window.localStorage.removeItem(keys.payment);
    setReport(value);
    setPayment(null);
    setStage("report");
  }, [keys.payment, keys.report]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        const url = new URL(window.location.href);
        const paymentId = url.searchParams.get("payment");
        const paymentToken = url.searchParams.get("token");
        const savedReport = window.localStorage.getItem(keys.report);
        const savedSession = window.localStorage.getItem(keys.session);
        const savedPayment = window.localStorage.getItem(keys.payment);
        const savedProgress = window.localStorage.getItem(keys.progress);

        if (paymentId && paymentToken) {
          const response = await fetch(`/api/unlock?payment=${paymentId}&token=${encodeURIComponent(paymentToken)}`, { cache: "no-store" });
          if (response.ok) {
            unlock((await response.json()).report as ExpansionReport);
            window.history.replaceState({}, "", window.location.pathname);
            setReady(true);
            return;
          }
          setPayment({ id: paymentId, token: paymentToken });
          setStage("status");
        } else if (savedReport) {
          setReport(JSON.parse(savedReport) as ExpansionReport);
          setStage("report");
        } else if (savedSession) {
          setSession(JSON.parse(savedSession) as Session);
          setPayment(savedPayment ? JSON.parse(savedPayment) as Payment : null);
          setStage(savedPayment ? "checkout" : "preview");
        } else if (savedProgress) {
          const value = JSON.parse(savedProgress) as { index: number; answers: ExpansionAnswers };
          setIndex(Math.min(value.index, assessment.questions.length - 1));
          setAnswers(value.answers);
          setStage("questions");
        }
      } catch {
        Object.values(keys).forEach((key) => window.localStorage.removeItem(key));
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [assessment.questions.length, keys, unlock]);

  useEffect(() => {
    if (ready && stage === "questions") {
      window.localStorage.setItem(keys.progress, JSON.stringify({ index, answers }));
    }
  }, [answers, index, keys.progress, ready, stage]);

  const question = assessment.questions[index];
  const progress = Math.round((Object.keys(answers).length / assessment.questions.length) * 100);

  async function choose(value: ExpansionAnswer) {
    const nextAnswers = { ...answers, [question.id]: value };
    setAnswers(nextAnswers);
    const complete = assessment.questions.every((item) => Boolean(nextAnswers[item.id]));

    if (!complete) {
      const nextIndex = assessment.questions.findIndex((item, position) => position > index && !nextAnswers[item.id]);
      window.setTimeout(() => setIndex(nextIndex >= 0 ? nextIndex : Math.min(index + 1, assessment.questions.length - 1)), 100);
      return;
    }

    setStage("submitting");
    setError("");
    const response = await fetch(`/api/assessment/${assessment.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: nextAnswers })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Your result could not be generated.");
      setStage("questions");
      return;
    }

    const nextSession: Session = {
      sessionId: data.sessionId,
      sessionToken: data.sessionToken,
      preview: data.preview
    };
    window.localStorage.setItem(keys.session, JSON.stringify(nextSession));
    window.localStorage.removeItem(keys.progress);
    setSession(nextSession);
    track("assessment_completed", assessment.id);
    setStage("preview");
  }

  function reset() {
    Object.values(keys).forEach((key) => window.localStorage.removeItem(key));
    setAnswers({});
    setIndex(0);
    setSession(null);
    setPayment(null);
    setReport(null);
    setError("");
    setStage("intro");
  }

  if (!ready) {
    return (
      <section className="expansion-intro">
        <div>
          <p className="eyebrow"><SparklesIcon /> {assessment.eyebrow}</p>
          <h1>{assessment.title}</h1>
          <p>{assessment.description}</p>
          <div className="assessment-facts">
            <span><ClockIcon /> About {assessment.estimatedMinutes} minutes</span>
            <span><CheckIcon /> {assessment.questions.length} questions</span>
            <span><LockIcon /> {assessment.priceLabel}</span>
          </div>
          <button type="button" className="button button-primary" disabled aria-disabled="true">
            Checking saved progress…
          </button>
          <p className="restore-note" aria-live="polite">
            The assessment will be ready in a moment. Your saved progress remains in this browser.
          </p>
        </div>
        <div className="expansion-dimension-list">
          {assessment.dimensions.map((dimension) => (
            <article key={dimension.id}>
              <strong>{dimension.label}</strong>
              <span>{dimension.description}</span>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (stage === "intro") return (
    <section className="expansion-intro">
      <div>
        <p className="eyebrow"><SparklesIcon /> {assessment.eyebrow}</p>
        <h1>{assessment.title}</h1>
        <p>{assessment.description}</p>
        <div className="assessment-facts">
          <span><ClockIcon /> About {assessment.estimatedMinutes} minutes</span>
          <span><CheckIcon /> {assessment.questions.length} questions</span>
          <span><LockIcon /> {assessment.priceLabel}</span>
        </div>
        <button type="button" className="button button-primary" onClick={() => { track("assessment_started", assessment.id); setStage("questions"); }}>
          Start free assessment <ArrowRightIcon />
        </button>
      </div>
      <div className="expansion-dimension-list">
        {assessment.dimensions.map((dimension) => <article key={dimension.id}><strong>{dimension.label}</strong><span>{dimension.description}</span></article>)}
      </div>
    </section>
  );

  if (stage === "questions") return (
    <section className="question-card">
      <div className="question-topbar">
        <button type="button" className="assessment-back" onClick={() => index === 0 ? setStage("intro") : setIndex((value) => value - 1)}>
          <ArrowLeftIcon /> Back
        </button>
        <span>{Object.keys(answers).length} of {assessment.questions.length} answered</span>
      </div>
      <div className="assessment-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
      <div className="question-number">Question {index + 1}</div>
      <h1>{question.prompt}</h1>
      <div className="answer-grid">
        {([["Strongly disagree",1],["Disagree",2],["Neutral",3],["Agree",4],["Strongly agree",5]] as const).map(([label,value]) => (
          <button type="button" className={answers[question.id] === value ? "answer-option answer-selected" : "answer-option"} key={value} onClick={() => void choose(value)}>
            <span>{label}</span><b>{value}</b>
          </button>
        ))}
      </div>
      {error ? <p className="checkout-message">{error}</p> : null}
    </section>
  );

  if (stage === "submitting") return <div className="checkout-status"><span className="checkout-loader" /><p className="eyebrow">Building your preview</p><h2>Your answers are being scored securely.</h2></div>;

  if (stage === "status" && payment) return <PaymentStatus payment={payment} onUnlocked={unlock} />;

  if (stage === "checkout" && session) return (
    <PremiumCheckout
      sessionId={session.sessionId}
      sessionToken={session.sessionToken}
      restoredPayment={payment}
      assessmentId={assessment.id}
      reportTitle={`${assessment.title} report`}
      onUnlocked={(value) => unlock(value as ExpansionReport)}
    />
  );

  if (stage === "preview" && session) return (
    <div className="result-preview-card">
      <p className="eyebrow"><SparklesIcon /> Your free preview</p>
      <h1>{session.preview.title}</h1>
      <p className="result-subtitle">{session.preview.subtitle}</p>
      <p>{session.preview.summary}</p>
      <div className="preview-dimensions">
        {session.preview.dimensions.map((item) => <div key={item.id}><span>{item.label}</span><strong>{item.score}%</strong><i><b style={{ width:`${item.score}%` }} /></i></div>)}
      </div>
      <div className="preview-lock"><LockIcon /><div><h2>Your detailed report is ready</h2><p>Unlock all four dimensions, strengths, watchouts, action plan and matched recommendations.</p></div></div>
      <div className="result-actions">
        <button type="button" className="button button-primary" onClick={() => { track("checkout_started", assessment.id); setStage("checkout"); }}>
          Unlock full report · ₹{assessment.pricePaise / 100} <ArrowRightIcon />
        </button>
        <button type="button" className="button button-secondary" onClick={reset}>Retake</button>
      </div>
    </div>
  );

  return report ? (
    <article className="full-report-card expansion-report">
      <header className="full-report-hero"><p className="eyebrow"><SparklesIcon /> Premium {assessment.title} report</p><h1>{report.title}</h1><p className="result-subtitle">{report.subtitle}</p><p>{report.summary}</p></header>
      <section className="report-block"><div className="report-block-heading"><span>01</span><div><p className="eyebrow">Score map</p><h2>Your four dimensions</h2></div></div>
        <div className="dimension-report-grid">{report.dimensions.map((item) => <div key={item.id}><div><span>{item.label}</span><b>{item.score}%</b></div><i><b style={{width:`${item.score}%`}} /></i><small>{item.description}</small></div>)}</div>
      </section>
      <section className="report-block"><div className="report-two-column"><div><h3>Strengths</h3><ul>{report.strengths.map((item) => <li key={item}><CheckIcon />{item}</li>)}</ul></div><div><h3>Watchouts</h3><ul>{report.watchouts.map((item) => <li key={item}><span>!</span>{item}</li>)}</ul></div></div></section>
      <section className="report-block">
        <div className="report-block-heading"><span>02</span><div><p className="eyebrow">Deep interpretation</p><h2>What each score may look like in real life</h2></div></div>
        <div className="premium-narrative-grid">
          {report.dimensionInsights.map((item) => {
            const dimension = report.dimensions.find((value) => value.id === item.id);
            return <div key={item.id}><span>{dimension?.label}</span><p>{item.interpretation}</p><small>{item.growthEdge}</small></div>;
          })}
        </div>
      </section>
      <section className="report-block">
        <div className="report-block-heading"><span>03</span><div><p className="eyebrow">Under pressure</p><h2>Your likely stress pattern</h2></div></div>
        <div className="premium-callout"><p>{report.stressPattern}</p></div>
      </section>
      <section className="report-block">
        <div className="report-block-heading"><span>04</span><div><p className="eyebrow">Real-life application</p><h2>Three situations to use this insight</h2></div></div>
        <div className="scenario-grid">{report.realLifeScenarios.map((item) => <div key={item.title}><span>{item.title}</span><p>{item.insight}</p></div>)}</div>
      </section>
      <section className="report-block">
        <div className="report-block-heading"><span>05</span><div><p className="eyebrow">Action plan</p><h2>Practical next steps</h2></div></div>
        <div className="report-actions-list">{report.actionPlan.map((item,position) => <div key={item}><span>{position+1}</span><p>{item}</p></div>)}</div>
      </section>
      <section className="report-block">
        <div className="report-block-heading"><span>06</span><div><p className="eyebrow">7-day reset</p><h2>Build momentum this week</h2></div></div>
        <div className="timeline-plan">{report.sevenDayPlan.map((item,position) => <div key={item}><span>{position+1}</span><p>{item}</p></div>)}</div>
      </section>
      <section className="report-block">
        <div className="report-block-heading"><span>07</span><div><p className="eyebrow">30-day roadmap</p><h2>Make the result useful beyond today</h2></div></div>
        <div className="roadmap-grid">{report.thirtyDayRoadmap.map((item) => <div key={item}><p>{item}</p></div>)}</div>
      </section>
      <AffiliateRecommendations category={report.affiliateCategory} />
      <div className="full-report-footer">
        <p>This is an educational self-reflection report, not a diagnosis or guaranteed prediction.</p>
        <div>
          <CloudSaveButton report={report} />
          <button type="button" className="button button-secondary" onClick={() => window.print()}>Download / save PDF</button>
          <button type="button" className="button button-secondary" onClick={reset}>Retake assessment</button>
        </div>
      </div>
    </article>
  ) : null;
}

function PaymentStatus({ payment, onUnlocked }: { payment: Payment; onUnlocked: (report: ExpansionReport) => void }) {
  const [message, setMessage] = useState("Your payment is waiting for verification.");
  useEffect(() => {
    async function check() {
      const response = await fetch(`/api/payments?id=${payment.id}&token=${encodeURIComponent(payment.token)}`, { cache:"no-store" });
      const data = await response.json();
      if (data.status === "approved") {
        const unlocked = await fetch(`/api/unlock?payment=${payment.id}&token=${encodeURIComponent(payment.token)}`, { cache:"no-store" });
        if (unlocked.ok) onUnlocked((await unlocked.json()).report as ExpansionReport);
      } else if (data.status === "rejected") {
        setMessage(data.rejectionReason ?? "The transaction could not be verified.");
      }
    }
    void check();
    const poll = window.setInterval(() => void check(), 7000);
    return () => window.clearInterval(poll);
  }, [onUnlocked, payment.id, payment.token]);
  return <div className="checkout-status"><span className="checkout-loader" /><p className="eyebrow">Payment status</p><h2>Your report is waiting to unlock.</h2><p>{message}</p></div>;
}
