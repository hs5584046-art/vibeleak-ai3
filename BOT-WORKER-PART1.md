# VibeLytix 7.1 — Bot Worker Part 1

Apply this pack **after** VibeLytix 7.0 Core in the same GitHub repository.

## What this worker actually executes

- Publishes rotating practical resources on VibeLytix itself
- Discovers relevant public web opportunities through low-volume search
- Scores relevance and rejects obvious spam-risk topics
- Extracts a publicly listed contact email when available
- Sends a limited, personalised resource-introduction email through the existing Resend integration
- Sends no more than two follow-ups per prospect
- Tracks prospects and outreach
- Verifies whether a VibeLytix backlink became live
- Detects lost backlinks
- Notifies IndexNow when a new owned resource is published
- Runs daily through Vercel Cron
- Records completed and failed worker runs
- Supports daily limits, Autopilot ON/OFF and an emergency kill switch

## What it does not do

- Create fake accounts
- Bypass CAPTCHA
- Post comments or forum spam
- Evade blocks or moderation
- Guarantee backlinks
- Publish real Google/Meta ads without an authorised ad account
- Send outreach when email delivery is not configured

When email is not configured, own-site publishing, discovery, scoring, verification and run logging still work. Outreach safely pauses.

## New routes

- `/api/admin/bot`
- `/api/indexnow-key`
- `/resources/[slug]`

The secure `/admin` page now includes the Bot Worker control panel.

## Required setup

### 1. Apply files

Upload this add-on pack after the V7 Core commit. Existing files with the same paths must be replaced.

### 2. Run SQL

Run the complete updated:

```text
supabase/schema.sql
```

It adds:

- `bot_settings`
- `backlink_prospects`
- `outreach_messages`
- `autonomous_resources`

### 3. Keep existing cron secret

```env
CRON_SECRET=your-existing-strong-secret
```

### 4. Add IndexNow key

Generate a random value of at least 16 characters and add:

```env
INDEXNOW_KEY=your-random-indexnow-key
```

The app exposes the key through `/api/indexnow-key` only for IndexNow ownership verification.

### 5. Email for automatic outreach

Automatic outreach uses the existing:

```env
RESEND_API_KEY=
EMAIL_FROM=VibeLytix <growth@vibelytix.lol>
```

The sending domain/address must be verified with the email provider. Without this, outreach is not sent.

### 6. Deploy and enable

After deployment:

1. Open `/admin`
2. Find **V7 Bot Worker**
3. Turn **Autopilot** ON
4. Keep the kill switch OFF
5. Start with the default conservative daily limits
6. Select **Run worker now** once for the first verification

## Default daily limits

- Prospect discovery: 12
- New outreach: 5
- Follow-ups: 5
- Backlink checks: 50
- Follow-up maximum per prospect: 2

## Validation

- ESLint: passed
- Strict TypeScript: passed
- Tests: 45/45 passed
- Bot worker security tests: passed
- Production build: passed
- Generated routes/pages: 103/103
