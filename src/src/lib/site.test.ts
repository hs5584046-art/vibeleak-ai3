import { describe, expect, it } from "vitest";
import { assessmentCategories, faqItems, siteConfig } from "./site";

describe("public site content", () => {
  it("keeps exactly one flagship assessment", () => {
    expect(assessmentCategories.filter((item) => item.featured)).toHaveLength(1);
  });

  it("uses unique category ids", () => {
    const ids = assessmentCategories.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("provides a complete footer structure", () => {
    expect(siteConfig.footer.product.length).toBeGreaterThanOrEqual(4);
    expect(siteConfig.footer.legal.map((item) => item.label)).toEqual(
      expect.arrayContaining(["Privacy", "Terms", "Refunds"])
    );
  });

  it("contains safety-focused FAQ content", () => {
    expect(faqItems.some((item) => item.answer.toLowerCase().includes("does not diagnose"))).toBe(true);
  });
});
