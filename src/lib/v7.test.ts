import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildProductReport, revenueProducts } from "@/lib/products";
import { PRODUCTS } from "@/lib/payments";

describe("VibeLytix 7 revenue products and autopilot", () => {
  it("ships four distinct personalised products", () => {
    expect(revenueProducts).toHaveLength(4);
    expect(new Set(revenueProducts.map((item) => item.slug)).size).toBe(4);
    expect(revenueProducts.every((item) => item.questions.length === 4)).toBe(true);
    expect(revenueProducts.every((item) => item.features.length >= 6)).toBe(true);
  });

  it("builds actionable product reports", () => {
    for (const product of revenueProducts) {
      const answers = Object.fromEntries(
        product.questions.map((question) => [question.id, question.options[0]])
      );
      const report = buildProductReport(product, answers);
      expect(report.assessmentId).toBe(product.slug);
      expect(report.actionPlan.length).toBeGreaterThanOrEqual(6);
      expect(report.sevenDayPlan).toHaveLength(7);
      expect(report.thirtyDayRoadmap).toHaveLength(4);
    }
  });

  it("makes every V7 product purchasable through the existing UPI catalog", () => {
    for (const product of revenueProducts) {
      expect(PRODUCTS[product.slug]?.amountPaise).toBe(product.pricePaise);
    }
  });

  it("configures a secure daily Growth OS cron", () => {
    const vercel = readFileSync(resolve(process.cwd(), "vercel.json"), "utf8");
    const route = readFileSync(
      resolve(process.cwd(), "src/app/api/admin/growth/route.ts"),
      "utf8"
    );
    expect(vercel).toContain("/api/admin/growth");
    expect(route).toContain("Bearer ${env.CRON_SECRET}");
    expect(route).toContain("createPlan(createAdminClient(), null)");
  });

  it("does not expose payment or cron secrets to the browser", () => {
    const env = readFileSync(resolve(process.cwd(), "src/lib/env.ts"), "utf8");
    expect(env).toContain("CRON_SECRET");
    expect(env).not.toContain("NEXT_PUBLIC_CRON_SECRET");
    expect(env).not.toContain("NEXT_PUBLIC_PAYMENT_TOKEN_SECRET");
  });
});
