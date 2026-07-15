# VibeLytix v12 Agentic Autonomous Growth OS

A cumulative GitHub/Vercel/Supabase build kept within the 100-file repository limit.

## What changed

- Added a durable 18-agent logical operating council without creating 18 separate services.
- Added an `evaluate_agents` queue stage between evidence collection and plan generation.
- Added evidence-based agents for orchestration, analytics, SEO, content strategy, content production, CRO, experiments, prospect discovery, outreach, backlink verification, distribution, affiliate quality, competitor intelligence, memory, reliability, security, reporting and product opportunities.
- Agent decisions are stored in `agent_runs` and the latest council is stored in `growth_memory`.
- Missing integrations are marked `blocked`; the system does not fake execution.
- Existing owned-site publishing, SEO, RSS, WebSub, IndexNow, prospect discovery, public-email outreach, follow-ups and link verification remain connected to the scheduled pipeline.
- `/api/health` now reports live agent readiness and blocked/watch states.

## Daily pipeline

1. Collect first-party, Search Console and GA4 signals when configured.
2. Evaluate historical memory.
3. Evaluate experiments and roll back harmful SEO overrides.
4. Run the 18-agent council.
5. Generate the daily evidence-led growth plan.
6. Execute owned publishing, SEO, distribution, discovery, outreach, follow-ups and verification.

## Deployment

1. Replace the existing GitHub repository contents with this cumulative build.
2. Run the complete `supabase/schema.sql` in Supabase SQL Editor.
3. Keep the included daily Vercel cron enabled.
4. Configure available environment variables from `.env.example`.
5. After the first run, inspect `/api/health`, `agent_runs`, `growth_jobs` and `autopilot_runs`.

## Honest boundaries

- Search Console, GA4 and authorised external publishing require their initial credentials.
- Public-email discovery cannot produce an address when a site does not publish one.
- Editorial backlink acceptance, rankings, inbox placement and purchases remain external outcomes.
- The logical agents coordinate deterministic evidence-based operations; they are not 18 independent paid LLM processes.

## Verification

```bash
npm ci --no-audit --no-fund
npm run lint
npm run typecheck
npm run test
npm run build
```
