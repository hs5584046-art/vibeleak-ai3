import crypto from "node:crypto";
import { env } from "@/lib/env";

export type Product = {
  id: string;
  assessmentId: string;
  title: string;
  amountPaise: number;
  currency: "INR";
};

export const PRODUCTS: Record<string, Product> = {
  "personality-dna": { id:"personality-dna-premium", assessmentId:"personality-dna", title:"Personality DNA Premium Report", amountPaise:14900, currency:"INR" },
  "relationship-intelligence": { id:"relationship-intelligence-premium", assessmentId:"relationship-intelligence", title:"Relationship Intelligence Premium Report", amountPaise:9900, currency:"INR" },
  "career-alignment": { id:"career-alignment-premium", assessmentId:"career-alignment", title:"Career Alignment Premium Report", amountPaise:9900, currency:"INR" },
  "growth-systems": { id:"growth-systems-premium", assessmentId:"growth-systems", title:"Growth Systems Premium Report", amountPaise:9900, currency:"INR" },
  "attachment-style": { id:"attachment-style-premium", assessmentId:"attachment-style", title:"Attachment Style Premium Report", amountPaise:7900, currency:"INR" },
  "emotional-intelligence": { id:"emotional-intelligence-premium", assessmentId:"emotional-intelligence", title:"Emotional Intelligence Premium Report", amountPaise:7900, currency:"INR" },
  "communication-style": { id:"communication-style-premium", assessmentId:"communication-style", title:"Communication Style Premium Report", amountPaise:7900, currency:"INR" },
  "leadership-style": { id:"leadership-style-premium", assessmentId:"leadership-style", title:"Leadership Style Premium Report", amountPaise:7900, currency:"INR" }
};

export const PRODUCT = PRODUCTS["personality-dna"];

export function getProduct(assessmentId: string) {
  return PRODUCTS[assessmentId];
}

export function normalizeCoupon(value?: string | null) {
  return (value ?? "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 32);
}

export function calculateDiscount(amountPaise: number, discountType: "percent" | "fixed", discountValue: number) {
  if (amountPaise <= 0 || discountValue <= 0) return 0;
  const raw = discountType === "percent"
    ? Math.round(amountPaise * Math.min(discountValue, 100) / 100)
    : discountValue;
  return Math.min(amountPaise, Math.max(0, raw));
}

export function formatInr(amountPaise: number) {
  return `₹${(amountPaise / 100).toFixed(amountPaise % 100 === 0 ? 0 : 2)}`;
}

export function createOpaqueToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function encryptionKey() {
  return crypto.createHash("sha256").update(env.PAYMENT_TOKEN_SECRET).digest();
}

export function encryptToken(token: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((item) => item.toString("base64url")).join(".");
}

export function decryptToken(payload: string) {
  const [ivValue, tagValue, encryptedValue] = payload.split(".");
  if (!ivValue || !tagValue || !encryptedValue) throw new Error("Invalid encrypted token.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedValue, "base64url")), decipher.final()]).toString("utf8");
}

export function buildUpiUri(amountPaise: number, reference: string, productTitle = PRODUCT.title) {
  const params = new URLSearchParams({
    pa: env.NEXT_PUBLIC_UPI_ID,
    pn: env.NEXT_PUBLIC_UPI_NAME,
    am: (amountPaise / 100).toFixed(2),
    cu: "INR",
    tn: `${productTitle} ${reference.slice(0, 8).toUpperCase()}`
  });
  return `upi://pay?${params.toString()}`;
}
