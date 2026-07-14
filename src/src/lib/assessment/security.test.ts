import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("premium report client security", () => {
  it("does not import the Personality DNA report engine into the client experience", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/assessment/personality-dna-experience.tsx"),
      "utf8"
    );
    expect(source).not.toContain('from "@/lib/assessment/engine"');
    expect(source).not.toContain("buildPersonalityReport(");
  });

  it("keeps full report generation in server assessment routes", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/app/api/assessment/personality-dna/route.ts"),
      "utf8"
    );
    expect(source).toContain("buildPersonalityReport");
    expect(source).toContain("assessment_sessions");
  });
});
