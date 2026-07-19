# VibeLytix Career and Sales Agent

This module adds a safe foundation for opportunity discovery, matching, personalised outreach and professional follow-ups.

## Included

- Profile-based matching for international business development, commercial, partnerships and foreign-market roles.
- Job, company and client opportunity types.
- Public business-contact validation.
- Duplicate-safe database design in `supabase/career-agent.sql`.
- Professional follow-up timing at 7 and 14 days, with a maximum of two follow-ups.
- Automatic stop states for replies, opt-outs, bounces and closed opportunities.
- A scheduled health endpoint at `/api/cron/career-agent`.

## Required before authorised sending

Configure the sender address, resume URL, Supabase service credentials and an authorised email provider in Vercel. Automatic sending must remain disabled until sender ownership and the final profile are verified.

## Boundaries

The agent does not bypass job-portal anti-bot controls, CAPTCHAs or platform terms. It can discover public opportunities, prepare applications, send authorised direct email and maintain follow-ups. Portal applications remain review-and-submit unless an official integration allows automation.
