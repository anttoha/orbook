import { describe, expect, it } from "vitest";
import { demoCode } from "./demoAccess";

describe("demoCode", () => {
  it("находит код по роли", () => {
    const info = { demoAccess: [{ role: "student", code: "ORB-A-1111-2222" }, { role: "teacher", code: "ORB-L-3333-4444" }] };
    expect(demoCode(info, "student")).toBe("ORB-A-1111-2222");
    expect(demoCode(info, "teacher")).toBe("ORB-L-3333-4444");
  });

  it("прод и пустые ответы — null", () => {
    expect(demoCode(null, "student")).toBeNull();
    expect(demoCode({ demoAccess: null }, "student")).toBeNull();
    expect(demoCode({ demoAccess: [null, { role: "student" }] }, "student")).toBeNull();
    expect(demoCode({ demoAccess: [{ role: "student", code: "x" }] }, "editor")).toBeNull();
  });
});
