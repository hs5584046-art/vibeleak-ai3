"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowRightIcon, LockIcon, MailIcon } from "@/components/ui/icons";

export function AuthForm({ next = "/dashboard" }: { next?: "/dashboard" | "/admin" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true
      }
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Check your email and open the secure sign-in link.");
  }

  return (
    <section className="auth-card">
      <div>
        <p className="eyebrow"><LockIcon /> Secure account</p>
        <h1>Save your reports across devices.</h1>
        <p>
          Enter your email. We will send a passwordless sign-in link—no password to remember or reuse.
        </p>
      </div>

      <form onSubmit={signIn}>
        <label htmlFor="email">Email address</label>
        <div className="auth-input-wrap">
          <MailIcon />
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <button className="button button-primary" disabled={status === "loading" || status === "sent"}>
          {status === "loading" ? "Sending secure link…" : status === "sent" ? "Link sent" : "Email me a sign-in link"}
          <ArrowRightIcon />
        </button>
      </form>

      {message ? <p className={`auth-message auth-${status}`} role="status">{message}</p> : null}
      <small>Authentication is handled by Supabase. VibeLytix never receives your email password.</small>
    </section>
  );
}
