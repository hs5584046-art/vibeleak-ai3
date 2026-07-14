import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    PAYMENT_TOKEN_SECRET: "12345678901234567890123456789012",
    NEXT_PUBLIC_UPI_ID: "merchant@upi",
    NEXT_PUBLIC_UPI_NAME: "VibeLytix"
  }
}));

import {
  calculateDiscount,
  createOpaqueToken,
  decryptToken,
  encryptToken,
  formatInr,
  hashToken,
  normalizeCoupon
} from "@/lib/payments";

describe("payment helpers", () => {
  it("normalizes coupon codes", () => {
    expect(normalizeCoupon(" vibe 20! ")).toBe("VIBE20");
  });

  it("calculates bounded percentage and fixed discounts", () => {
    expect(calculateDiscount(14900, "percent", 20)).toBe(2980);
    expect(calculateDiscount(14900, "fixed", 20000)).toBe(14900);
  });

  it("formats whole and fractional rupee values", () => {
    expect(formatInr(14900)).toBe("₹149");
    expect(formatInr(14950)).toBe("₹149.50");
  });

  it("creates and hashes opaque tokens", () => {
    const token = createOpaqueToken();
    expect(token.length).toBeGreaterThan(30);
    expect(hashToken(token)).toHaveLength(64);
  });

  it("encrypts and decrypts status tokens", () => {
    const token = createOpaqueToken();
    expect(decryptToken(encryptToken(token))).toBe(token);
  });
});
