import { describe, expect, it } from "vitest";
import { pageAnimation, pageKey } from "./pageMotion";

describe("pageAnimation", () => {
  it("вглиб — справа", () => expect(pageAnimation("/mehr", "/mehr/kurse", "PUSH")).toBe("animate-page-forward"));
  it("на рівень вище — зліва", () => expect(pageAnimation("/mehr/kurse", "/mehr", "PUSH")).toBe("animate-page-back"));
  it("назад браузера — зліва", () => expect(pageAnimation("/testen", "/statistik", "POP")).toBe("animate-page-back"));
  it("між вкладками — плавно", () => expect(pageAnimation("/woche", "/statistik", "PUSH")).toBe("animate-page-fade"));
  it("перший показ і та сама сторінка — без анімації", () => {
    expect(pageAnimation(null, "/woche", "POP")).toBe("");
    expect(pageAnimation("/tag/2026-10-05", "/tag/2026-10-06", "PUSH")).toBe("");
  });
  it("дні мають один ключ", () => expect(pageKey("/tag/2026-10-05")).toBe("/tag"));
});

describe("Einstellungen auf dem PC", () => {
  it("eine Seite mit Tabs: die ganze Seite fährt nicht", () => {
    expect(pageKey("/mehr/kurse", { desktop: true })).toBe("/mehr");
    expect(pageAnimation("/mehr", "/mehr/kurse", "PUSH", { desktop: true })).toBe("");
    expect(pageAnimation("/mehr/kurse", "/woche", "PUSH", { desktop: true })).toBe("animate-page-back");
  });
  it("Handy wie bisher", () => expect(pageAnimation("/mehr", "/mehr/kurse", "PUSH")).toBe("animate-page-forward"));
});
