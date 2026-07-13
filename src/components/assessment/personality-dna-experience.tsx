"use client";

import { useCallback, useEffect, useState } from "react";
import { personalityDnaAssessment } from "@/lib/assessment/personality-dna";
import { buildPersonalityReport } from "@/lib/assessment/engine";
import type {
  AnswerValue,
  AssessmentAnswers,
  PersonalityReport
} from "@/lib/assessment/types";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  LockIcon,
  SparklesIcon
} from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/button-link";
import { CloudSaveButton } from "@/components/account/cloud-save-button";
import { PremiumCheckout } from "@/components/assessment/premium-checkout";

const PROGRESS_KEY = "vibelytix-personality-progress-v2";
const SESSION_KEY = "vibelytix-personality-session-v2";
const PAYMENT_KEY = "vibelytix-premium-payment-v1";
const REPORT_KEY = "vibelytix-premium-report-v1";

type Stage = "intro" | "questions" | "submitting" | "preview" | "checkout" | "status" | "report";

type Preview = {
  profile: PersonalityReport["profile"];
  dimensions: PersonalityReport["dimensions"];
};

type SavedSession = {
  sessionId: string;
  sessionToken: string;
  preview: Preview;
};

type SavedPayment = {
  id: string;
  token: string;
};

export function PersonalityDnaExperience() {
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [session, setSession] = useState<SavedSession | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [payment, setPayment] = useState<SavedPayment | null>(null);
  const [report, setReport] = useState<PersonalityReport | null>(null);
  const [restored, setRestored] = useState(false);
  const [error, setError] = useState("");

  const unlockReport = useCallback((nextReport: PersonalityReport) => {
    window.localStorage.setItem(REPORT_KEY, JSON.stringify(nextReport));
    window.localStorage.removeItem(PAYMENT_KEY);
    setReport(nextReport);
    setPayment(null);
    setStage("report");
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        const savedProgress = window.localStorage.getItem(PROGRESS_KEY);
        const savedSession = window.localStorage.getItem(SESSION_KEY);
        const savedPayment = window.localStorage.getItem(PAYMENT_KEY);
        const savedReport = window.localStorage.getItem(REPORT_KEY);

        const url = new URL(window.location.href);
        const paymentId = url.searchParams.get("payment");
        const paymentToken = url.searchParams.get("token");

        if (paymentId && paymentToken) {
          const response = await fetch(
            `/api/unlock?payment=${encodeURIComponent(paymentId)}&token=${encodeURIComponent(paymentToken)}`,
            { cache: "no-store" }
          );
          if (response.ok) {
            const data = await response.json();
            unlockReport(data.report);
            window.history.replaceState({}, "", window.location.pathname);
            setRestored(true);
            return;
          }

          const statusResponse = await fetch(
            `/api/payments?id=${encodeURIComponent(paymentId)}&token=${encodeURIComponent(paymentToken)}`,
            { cache: "no-store" }
          );
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (statusData.status === "pending") {
              const restoredPayment = { id: paymentId, token: paymentToken };
              window.localStorage.setItem(PAYMENT_KEY, JSON.stringify(restoredPayment));
              setPayment(restoredPayment);
              setStage("status");
            }
          }
        }

        if (savedReport) {
          setReport(JSON.parse(savedReport) as PersonalityReport);
        }

        if (savedSession) {
          const parsedSession = JSON.parse(savedSession) as SavedSession;
          setSession(parsedSession);
          setPreview(parsedSession.preview);
          if (!paymentId) setStage(savedPayment ? "checkout" : "preview");
        } else if (savedProgress && !paymentId) {
          const parsed = JSON.parse(savedProgress) as { index: number; answers: AssessmentAnswers };
          setAnswers(parsed.answers ?? {});
          setIndex(Math.min(parsed.index ?? 0, personalityDnaAssessment.questions.length - 1));
          if (Object.keys(parsed.answers ?? {}).length > 0) setStage("questions");
        }

        if (savedPayment) setPayment(JSON.parse(savedPayment) as SavedPayment);
      } catch {
        window.localStorage.removeItem(PROGRESS_KEY);
        window.localStorage.removeItem(SESSION_KEY);
        window.localStorage.removeItem(PAYMENT_KEY);
        window.localStorage.removeItem(REPORT_KEY);
      } finally {
        setRestored(true);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [unlockReport]);

  useEffect(() => {
    if (!restored || stage !== "questions") return;
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify({ index, answers }));
  }, [answers, index, restored, stage]);

  const question = personalityDnaAssessment.questions[index];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / personalityDnaAssessment.questions.length) * 100);
  const currentAnswer = answers[question?.id];

  async function createSecureSession(nextAnswers: AssessmentAnswers) {
    setError("");
    try {
      const response = await fetch("/api/assessment/personality-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: nextAnswers })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Secure checkout is temporarily unavailable.");

      const nextSession: SavedSession = {
        sessionId: data.sessionId,
        sessionToken: data.sessionToken,
        preview: data.preview
      };
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      setPreview(nextSession.preview);
      return nextSession;
    } catch (sessionError) {
      setError(sessionError instanceof Error ? sessionError.message : "Secure checkout is temporarily unavailable.");
      return null;
    }
  }

  async function selectAnswer(value: AnswerValue) {
    const nextAnswers = { ...answers, [question.id]: value };
    setAnswers(nextAnswers);

    const isComplete = personalityDnaAssessment.questions.every(
      (item) => Boolean(nextAnswers[item.id])
    );

    if (!isComplete) {
      const nextUnansweredIndex = personalityDnaAssessment.questions.findIndex(
        (item, position) => position > index && !nextAnswers[item.id]
      );
      window.setTimeout(
        () => setIndex(nextUnansweredIndex >= 0 ? nextUnansweredIndex : Math.min(index + 1, personalityDnaAssessment.questions.length - 1)),
        120
      );
      return;
    }

    const localReport = buildPersonalityReport(nextAnswers);
    const localPreview: Preview = {
      profile: localReport.profile,
      dimensions: localReport.dimensions.slice(0, 2)
    };
    setPreview(localPreview);
    window.localStorage.removeItem(PROGRESS_KEY);
    setStage("preview");
    void createSecureSession(nextAnswers);
  }

  async function openCheckout() {
    let activeSession = session;
    if (!activeSession) {
      setStage("submitting");
      activeSession = await createSecureSession(answers);
    }
    setStage(activeSession ? "checkout" : "preview");
  }

  function resetAssessment() {
    [PROGRESS_KEY, SESSION_KEY, PAYMENT_KEY, REPORT_KEY].forEach((key) =>
      window.localStorage.removeItem(key)
    );
    setAnswers({});
    setIndex(0);
    setSession(null);
    setPreview(null);
    setPayment(null);
    setReport(null);
    setError("");
    setStage("intro");
  }

  if (!restored) {
    return (
      <section className="assessment-shell">
        <div className="assessment-loading" aria-label="Loading saved assessment">
          <span />
          <p>Restoring your secure progress…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="assessment-shell">
      {stage === "intro" ? (
        <Intro
          hasReport={Boolean(report)}
          onStart={() => setStage("questions")}
          onViewReport={() => setStage("report")}
        />
      ) : null}

      {stage === "questions" ? (
        <div className="question-card">
          <div className="question-topbar">
            <button
              type="button"
              className="assessment-back"
              onClick={() => index === 0 ? setStage("intro") : setIndex((value) => value - 1)}
            >
              <ArrowLeftIcon /> Back
            </button>
            <span>{answeredCount} of {personalityDnaAssessment.questions.length} answered</span>
          </div>

          <div
            className="assessment-progress"
            aria-label={`${progress}% complete`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="question-number">Question {index + 1}</div>
          <h1>{question.prompt}</h1>
          {question.helper ? <p className="question-helper">{question.helper}</p> : null}

          <div className="answer-grid">
            {question.options.map((option) => (
              <button
                type="button"
                key={option.value}
                className={currentAnswer === option.value ? "answer-option answer-selected" : "answer-option"}
                onClick={() => void selectAnswer(option.value)}
              >
                <span>{option.label}</span>
                <b>{option.value}</b>
              </button>
            ))}
          </div>

          {error ? <p className="checkout-message">{error}</p> : null}
          <p className="autosave-note"><LockIcon /> Unfinished answers remain in this browser.</p>
        </div>
      ) : null}

      {stage === "submitting" ? (
        <div className="checkout-status">
          <span className="checkout-loader" />
          <p className="eyebrow">Building your preview</p>
          <h2>Your answers are being scored securely.</h2>
        </div>
      ) : null}

      {stage === "preview" && preview ? (
        <div className="result-preview-card">
          <p className="eyebrow"><SparklesIcon /> Your free preview</p>
          <h1>{preview.profile.title}</h1>
          <p className="result-subtitle">{preview.profile.subtitle}</p>
          <p>{preview.profile.summary}</p>

          <div className="preview-dimensions">
            {preview.dimensions.map((item) => (
              <div key={item.id}>
                <span>{item.label}</span>
                <strong>{item.score}%</strong>
                <i><b style={{ width: `${item.score}%` }} /></i>
              </div>
            ))}
          </div>

          <div className="preview-lock">
            <LockIcon />
            <div>
              <h2>Your complete report is securely locked</h2>
              <p>Unlock all four dimensions, strengths, watchouts, communication style, ideal environment and action plan.</p>
            </div>
          </div>

          {error ? <p className="checkout-message">{error} You can retry below.</p> : null}

          <div className="result-actions">
            <button type="button" className="button button-primary" onClick={() => void openCheckout()}>
              Unlock full report · ₹149 <ArrowRightIcon />
            </button>
            <button type="button" className="button button-secondary" onClick={resetAssessment}>
              Retake assessment
            </button>
          </div>
        </div>
      ) : null}

      {stage === "checkout" && session ? (
        <PremiumCheckout
          sessionId={session.sessionId}
          sessionToken={session.sessionToken}
          restoredPayment={payment}
          assessmentId="personality-dna"
          reportTitle="Personality DNA report"
          onUnlocked={(value) => unlockReport(value as PersonalityReport)}
        />
      ) : null}

      {stage === "status" && payment ? (
        <ExternalPaymentStatus payment={payment} onUnlocked={unlockReport} />
      ) : null}

      {stage === "report" && report ? (
        <FullReport report={report} onReset={resetAssessment} />
      ) : null}
    </section>
  );
}


function ExternalPaymentStatus({
  payment,
  onUnlocked
}: {
  payment: SavedPayment;
  onUnlocked: (report: PersonalityReport) => void;
}) {
  const [message, setMessage] = useState("Your payment is waiting for verification.");
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    async function check() {
      const statusResponse = await fetch(
        `/api/payments?id=${payment.id}&token=${encodeURIComponent(payment.token)}`,
        { cache: "no-store" }
      );
      const statusData = await statusResponse.json();

      if (statusData.status === "approved") {
        const unlockResponse = await fetch(
          `/api/unlock?payment=${payment.id}&token=${encodeURIComponent(payment.token)}`,
          { cache: "no-store" }
        );
        const unlockData = await unlockResponse.json();
        if (unlockResponse.ok) onUnlocked(unlockData.report);
      }

      if (statusData.status === "rejected") {
        setRejected(true);
        setMessage(statusData.rejectionReason ?? "The payment could not be verified.");
      }
    }

    void check();
    const poll = window.setInterval(() => void check(), 7000);
    return () => window.clearInterval(poll);
  }, [onUnlocked, payment.id, payment.token]);

  return (
    <div className="checkout-status">
      {!rejected ? <span className="checkout-loader" /> : null}
      <p className="eyebrow">{rejected ? "Verification update" : "Payment status"}</p>
      <h2>{rejected ? "Payment not verified" : "Your report is waiting to unlock."}</h2>
      <p>{message}</p>
      <small>Request: {payment.id.slice(0, 8).toUpperCase()}</small>
    </div>
  );
}

function Intro({
  hasReport,
  onStart,
  onViewReport
}: {
  hasReport: boolean;
  onStart: () => void;
  onViewReport: () => void;
}) {
  return (
    <div className="assessment-intro-card">
      <div className="assessment-intro-copy">
        <p className="eyebrow"><SparklesIcon /> Flagship assessment</p>
        <h1>Discover your Personality DNA.</h1>
        <p>
          Explore four practical dimensions that shape how you process emotion, make decisions,
          connect with people and adapt to change.
        </p>

        <div className="assessment-facts">
          <span><ClockIcon /> About 8 minutes</span>
          <span><CheckIcon /> 16 questions</span>
          <span><LockIcon /> Secure premium report</span>
        </div>

        <div className="assessment-actions">
          <button type="button" className="button button-primary" onClick={onStart}>
            {hasReport ? "Retake assessment" : "Start free assessment"} <ArrowRightIcon />
          </button>
          {hasReport ? (
            <button type="button" className="button button-secondary" onClick={onViewReport}>
              View unlocked report
            </button>
          ) : (
            <ButtonLink href="/" variant="secondary">Return home</ButtonLink>
          )}
        </div>

        <small>
          Free preview included. Full report requires a one-time payment. This is not clinical diagnosis.
        </small>
      </div>

      <div className="assessment-intro-visual">
        {["Depth", "Agency", "Connection", "Adaptability"].map((label, position) => (
          <div key={label} style={{ "--delay": `${position * 90}ms` } as React.CSSProperties}>
            <span>{label}</span>
            <i><b style={{ width: `${74 + position * 5}%` }} /></i>
          </div>
        ))}
      </div>
    </div>
  );
}

function FullReport({
  report,
  onReset
}: {
  report: PersonalityReport;
  onReset: () => void;
}) {
  return (
    <article className="full-report-card">
      <header className="full-report-hero">
        <p className="eyebrow"><SparklesIcon /> Premium Personality DNA report</p>
        <h1>{report.profile.title}</h1>
        <p className="result-subtitle">{report.profile.subtitle}</p>
        <p>{report.profile.summary}</p>
        <div className="report-date">Completed {new Date(report.completedAt).toLocaleDateString()}</div>
      </header>

      <section className="report-block">
        <div className="report-block-heading">
          <span>01</span>
          <div><p className="eyebrow">Dimension map</p><h2>Your four core dimensions</h2></div>
        </div>
        <div className="dimension-report-grid">
          {report.dimensions.map((item) => (
            <div key={item.id}>
              <div><span>{item.label}</span><b>{item.score}%</b></div>
              <i><b style={{ width: `${item.score}%` }} /></i>
              <small>{item.band}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="report-block">
        <div className="report-block-heading">
          <span>02</span>
          <div><p className="eyebrow">Interpretation</p><h2>What this pattern may look like</h2></div>
        </div>
        <div className="report-two-column">
          <div>
            <h3>Strengths</h3>
            <ul>{report.strengths.map((item) => <li key={item}><CheckIcon /> {item}</li>)}</ul>
          </div>
          <div>
            <h3>Watchouts</h3>
            <ul>{report.watchouts.map((item) => <li key={item}><span>!</span>{item}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="report-block">
        <div className="report-block-heading">
          <span>03</span>
          <div><p className="eyebrow">Practical fit</p><h2>How you may operate best</h2></div>
        </div>
        <div className="report-guidance-grid">
          <div><span>Communication style</span><p>{report.communicationStyle}</p></div>
          <div><span>Decision style</span><p>{report.decisionStyle}</p></div>
          <div><span>Ideal environment</span><p>{report.idealEnvironment}</p></div>
        </div>
      </section>

      <section className="report-block">
        <div className="report-block-heading">
          <span>04</span>
          <div><p className="eyebrow">Action plan</p><h2>Three useful next steps</h2></div>
        </div>
        <div className="report-actions-list">
          {report.actionPlan.map((item, position) => (
            <div key={item}><span>{position + 1}</span><p>{item}</p></div>
          ))}
        </div>
      </section>

      <div className="full-report-footer">
        <p>This report reflects your current answers. Context, stress and life stage can change how traits appear.</p>
        <div>
          <CloudSaveButton report={report} />
          <button type="button" className="button button-secondary" onClick={onReset}>Retake assessment</button>
          <ButtonLink href="/" variant="secondary">Explore VibeLytix <ArrowRightIcon /></ButtonLink>
        </div>
      </div>
    </article>
  );
}
