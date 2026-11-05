import { describe, expect, it } from "vitest";
import { routeErrorText } from "./routeError";

describe("routeErrorText", () => {
  it("называет несуществующую страницу", () => {
    expect(routeErrorText({ status: 404 })).toBe("Diese Seite gibt es nicht.");
  });

  it("не показывает технический текст ошибки", () => {
    expect(routeErrorText(new Error("Cannot read properties of null"))).not.toContain("Cannot read");
  });

  it("не падает, когда ошибки нет", () => {
    expect(routeErrorText(null)).toContain("Bitte lade");
  });
});
