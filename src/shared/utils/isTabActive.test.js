import { describe, expect, it } from "vitest";
import { isTabActive } from "./isTabActive";

describe("isTabActive", () => {
  it("parent tab stays active on its sub-pages", () => {
    expect(isTabActive({ to: "/mehr" }, "/mehr/darstellung")).toBe(true);
    expect(isTabActive({ to: "/testen" }, "/testen/neu")).toBe(true);
  });

  it("exact tab only on its own address", () => {
    expect(isTabActive({ to: "/admin", exact: true }, "/admin")).toBe(true);
    expect(isTabActive({ to: "/admin", exact: true }, "/admin/codes")).toBe(false);
  });

  it("activeOn: Woche also on / and any day", () => {
    const woche = { to: "/woche", activeOn: ["/", "/tag"] };
    expect(isTabActive(woche, "/")).toBe(true);
    expect(isTabActive(woche, "/tag/2026-10-07")).toBe(true);
    expect(isTabActive(woche, "/testen")).toBe(false);
  });
});
