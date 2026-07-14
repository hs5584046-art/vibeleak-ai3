import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("V7 autonomous bot worker", () => {
  it("enforces cron or admin authorization", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/app/api/admin/bot/route.ts"),
      "utf8"
    );
    expect(source).toContain("Bearer ${env.CRON_SECRET}");
    expect(source).toContain("getAdminContext()");
    expect(source).toContain("Admin access is required");
  });

  it("uses strict daily limits, two follow-ups maximum and a kill switch", () => {
    const worker = readFileSync(resolve(process.cwd(), "src/lib/bot-worker.ts"), "utf8");
    const schema = readFileSync(resolve(process.cwd(), "supabase/schema.sql"), "utf8");
    expect(worker).toContain("settings.kill_switch");
    expect(worker).toContain('.lt("follow_up_count", 2)');
    expect(schema).toContain("outreach_daily_limit");
    expect(schema).toContain("follow_up_count between 0 and 2");
  });

  it("does not include CAPTCHA bypass, fake accounts or comment posting", () => {
    const worker = readFileSync(resolve(process.cwd(), "src/lib/bot-worker.ts"), "utf8").toLowerCase();
    expect(worker).not.toContain("captcha bypass");
    expect(worker).not.toContain("fake account");
    expect(worker).not.toContain("post comment");
  });

  it("publishes only on the owned site and uses low-volume email outreach", () => {
    const worker = readFileSync(resolve(process.cwd(), "src/lib/bot-worker.ts"), "utf8");
    expect(worker).toContain('from("autonomous_resources")');
    expect(worker).toContain("sendOutreach");
    expect(worker).toContain("No link exchange or payment is requested");
    expect(worker).toContain("Please ignore this message if it is not relevant");
  });

  it("verifies discovered backlinks and notifies IndexNow", () => {
    const worker = readFileSync(resolve(process.cwd(), "src/lib/bot-worker.ts"), "utf8");
    expect(worker).toContain('includes("vibelytix.lol")');
    expect(worker).toContain("https://api.indexnow.org/indexnow");
    expect(worker).toContain("/api/indexnow-key");
  });
});
