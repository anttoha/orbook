import { describe, expect, it } from "vitest";
import { defaultNav, restPaths } from "./navLayout";
import { isFullScreenPage, isTabActive } from "./isTabActive";

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

  it("Materialien: на телефоні світиться «Mehr», форма — на весь екран", () => {
    const mehr = { to: "/mehr", activeOn: restPaths(defaultNav("phone"), {}) }; // часть 35: «Mehr» светится на разделах не из панели
    expect(isTabActive(mehr, "/materialien")).toBe(true);
    expect(isFullScreenPage("/materialien/neu")).toBe(true);
    expect(isFullScreenPage("/materialien/3/bearbeiten")).toBe(true);
    expect(isFullScreenPage("/materialien")).toBe(false);
  });
});
