import { describe, expect, it } from "vitest";
import { normalizeAppUrl } from "./app-url";

describe("normalizeAppUrl", () => {
  it("removes trailing slash", () => {
    expect(normalizeAppUrl("https://vibelytix.lol/")).toBe("https://vibelytix.lol");
  });

  it("removes query strings and hashes", () => {
    expect(normalizeAppUrl("https://vibelytix.lol/?preview=1#top")).toBe("https://vibelytix.lol");
  });

  it("throws for an invalid URL", () => {
    expect(() => normalizeAppUrl("not-a-url")).toThrow();
  });
});
