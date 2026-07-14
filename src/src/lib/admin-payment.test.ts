import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("admin payment operations", () => {
  it("shows explicit signed-out and non-allowlisted admin states", () => {
    const source = readFileSync(resolve(process.cwd(), "src/app/admin/page.tsx"), "utf8");
    expect(source).toContain("Admin sign-in required");
    expect(source).toContain("This account is not an administrator");
    expect(source).toContain("ADMIN_EMAILS");
  });

  it("shows UTR, amount and approve/reject actions in the admin console", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/admin/admin-payments.tsx"),
      "utf8"
    );
    expect(source).toContain("UPI transaction ID / UTR");
    expect(source).toContain("Approve & unlock");
    expect(source).toContain("Reject with reason");
    expect(source).toContain("Copy");
  });

  it("uses product-specific assessment status links after review", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/app/api/admin/payments/route.ts"),
      "utf8"
    );
    expect(source).toContain("assessmentIdFromProduct");
    expect(source).toContain("/assessments/${assessmentId}");
    expect(source).toContain('.eq("status", "pending")');
  });
});
