import { z } from "zod";
import { randomBytes } from "node:crypto";

const ephemeralSecret = () => randomBytes(32).toString("hex");

const schema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.email().default("support@vibelytix.lol"),
  NEXT_PUBLIC_UPI_ID: z.string().min(3).default("demo@upi"),
  NEXT_PUBLIC_UPI_NAME: z.string().min(1).default("VibeLytix"),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().regex(/^G-[A-Z0-9]+$/).default("G-70QB3YH1L2"),
  NEXT_PUBLIC_SUPABASE_URL: z.url().default("https://example.supabase.co"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).default("development-publishable-key"),
  SUPABASE_SECRET_KEY: z.string().min(1).default(ephemeralSecret),
  ADMIN_EMAILS: z.string().default("owner@example.com"),
  PAYMENT_TOKEN_SECRET: z.string().min(32).default(ephemeralSecret),
  PAYMENT_NOTIFICATION_EMAIL: z.email().default("owner@example.com"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("VibeLytix <reports@vibelytix.lol>"),
  CRON_SECRET: z.string().min(24).optional(),
  INDEXNOW_KEY: z.string().min(16).optional(),
  MASTODON_BASE_URL: z.url().optional(),
  MASTODON_ACCESS_TOKEN: z.string().min(10).optional(),
  BLUESKY_HANDLE: z.string().min(3).optional(),
  BLUESKY_APP_PASSWORD: z.string().min(8).optional(),
  DEVTO_API_KEY: z.string().min(10).optional(),
  WORDPRESS_SITE_URL: z.url().optional(),
  WORDPRESS_USERNAME: z.string().min(1).optional(),
  WORDPRESS_APP_PASSWORD: z.string().min(8).optional(),
  GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN: z.string().min(20).optional(),
  GOOGLE_OAUTH_CLIENT_ID: z.string().min(10).optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(10).optional(),
  GOOGLE_OAUTH_REFRESH_TOKEN: z.string().min(10).optional(),
  GOOGLE_ANALYTICS_ACCESS_TOKEN: z.string().min(20).optional(),
  GA4_PROPERTY_ID: z.string().regex(/^\d+$/).default("546133958"),
  AFFILIATE_RELATIONSHIP_BOOK: z.url().optional(),
  AFFILIATE_RELATIONSHIP_COURSE: z.url().optional(),
  AFFILIATE_CAREER_BOOK: z.url().optional(),
  AFFILIATE_CAREER_COURSE: z.url().optional(),
  AFFILIATE_GROWTH_BOOK: z.url().optional(),
  AFFILIATE_GROWTH_COURSE: z.url().optional()
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
  NEXT_PUBLIC_UPI_ID: process.env.NEXT_PUBLIC_UPI_ID,
  NEXT_PUBLIC_UPI_NAME: process.env.NEXT_PUBLIC_UPI_NAME,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  PAYMENT_TOKEN_SECRET: process.env.PAYMENT_TOKEN_SECRET,
  PAYMENT_NOTIFICATION_EMAIL: process.env.PAYMENT_NOTIFICATION_EMAIL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  CRON_SECRET: process.env.CRON_SECRET,
  INDEXNOW_KEY: process.env.INDEXNOW_KEY,
  MASTODON_BASE_URL: process.env.MASTODON_BASE_URL || undefined,
  MASTODON_ACCESS_TOKEN: process.env.MASTODON_ACCESS_TOKEN || undefined,
  BLUESKY_HANDLE: process.env.BLUESKY_HANDLE || undefined,
  BLUESKY_APP_PASSWORD: process.env.BLUESKY_APP_PASSWORD || undefined,
  DEVTO_API_KEY: process.env.DEVTO_API_KEY || undefined,
  WORDPRESS_SITE_URL: process.env.WORDPRESS_SITE_URL || undefined,
  WORDPRESS_USERNAME: process.env.WORDPRESS_USERNAME || undefined,
  WORDPRESS_APP_PASSWORD: process.env.WORDPRESS_APP_PASSWORD || undefined,
  GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN: process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN || undefined,
  GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID || undefined,
  GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET || undefined,
  GOOGLE_OAUTH_REFRESH_TOKEN: process.env.GOOGLE_OAUTH_REFRESH_TOKEN || undefined,
  GOOGLE_ANALYTICS_ACCESS_TOKEN: process.env.GOOGLE_ANALYTICS_ACCESS_TOKEN || undefined,
  GA4_PROPERTY_ID: process.env.GA4_PROPERTY_ID || undefined,
  AFFILIATE_RELATIONSHIP_BOOK: process.env.AFFILIATE_RELATIONSHIP_BOOK || undefined,
  AFFILIATE_RELATIONSHIP_COURSE: process.env.AFFILIATE_RELATIONSHIP_COURSE || undefined,
  AFFILIATE_CAREER_BOOK: process.env.AFFILIATE_CAREER_BOOK || undefined,
  AFFILIATE_CAREER_COURSE: process.env.AFFILIATE_CAREER_COURSE || undefined,
  AFFILIATE_GROWTH_BOOK: process.env.AFFILIATE_GROWTH_BOOK || undefined,
  AFFILIATE_GROWTH_COURSE: process.env.AFFILIATE_GROWTH_COURSE || undefined
});

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
