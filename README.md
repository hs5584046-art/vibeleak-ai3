# VibeLytix v11 Verified Stabilization Build

This release strengthens the existing Vercel + Supabase autonomous growth pipeline without claiming control over external outcomes.

## Verified engineering changes

- Durable Supabase job queue and atomic claiming remain in place.
- Evidence-led daily planning remains connected to the worker.
- Content publishing now has an enforced quality gate covering length, structure, limitations, practical exercise, internal linking and placeholder detection.
- Outreach follows the current evidence-led backlink target instead of always linking to a fixed assessment.
- Google OAuth refresh-token configuration is supported for unattended Search Console and GA4 access.
- Cron duration remains suitable for the existing multi-stage pipeline.
- Additional automated tests cover content quality and transient HTTP classification.

## Deployment

1. Run the complete `supabase/schema.sql` in Supabase SQL Editor.
2. Configure all required values from `.env.example` in Vercel.
3. Deploy the repository and keep the included `vercel.json` cron enabled.
4. Check `/api/health` after the first scheduled run.

## Honest boundary

Owned-site actions can execute automatically after deployment. External publishing requires authorised credentials. Editorial backlinks, search rankings, email inbox placement and purchases remain external outcomes. UPI approval remains manual unless an authorised payment provider/webhook is connected.

## Verification command

```bash
npm ci --no-audit --no-fund
npm run check
```
