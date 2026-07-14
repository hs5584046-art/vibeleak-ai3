import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.email().default("support@vibelytix.lol"),
  NEXT_PUBLIC_UPI_ID: z.string().min(3).default("demo@upi"),
  NEXT_PUBLIC_UPI_NAME: z.string().min(1).default("VibeLytix"),
  NEXT_PUBLIC_SUPABASE_URL: z.url().default("https://example.supabase.co"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).default("development-publishable-key"),
  SUPABASE_SECRET_KEY: z.string().min(1).default("development-secret-key"),
  ADMIN_EMAILS: z.string().default("owner@example.com"),
  PAYMENT_TOKEN_SECRET: z.string().min(32).default("development-secret-change-before-prod"),
  PAYMENT_NOTIFICATION_EMAIL: z.email().default("owner@example.com"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("VibeLytix <reports@vibelytix.lol>"),
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
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  PAYMENT_TOKEN_SECRET: process.env.PAYMENT_TOKEN_SECRET,
  PAYMENT_NOTIFICATION_EMAIL: process.env.PAYMENT_NOTIFICATION_EMAIL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
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
