import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn и токены дизайна", () => {
  it("размер шрифта не вытесняет цвет текста", () => {
    expect(cn("text-on-accent", "text-row")).toBe("text-on-accent text-row");
  });

  it("новый размер заменяет старый, новый цвет заменяет старый", () => {
    expect(cn("text-body", "text-row")).toBe("text-row");
    expect(cn("text-muted", "text-danger")).toBe("text-danger");
  });

  it("радиусы и тени заменяются", () => {
    expect(cn("rounded-full", "rounded-card")).toBe("rounded-card");
    expect(cn("shadow-menu", "shadow-sheet")).toBe("shadow-sheet");
    expect(cn("px-4", "px-gutter")).toBe("px-gutter");
    expect(cn("w-full", "w-sheet")).toBe("w-sheet");
  });

  it("каждый размер шрифта из index.css назван в cn.js", () => {
    const css = readFileSync(new URL("../../index.css", import.meta.url), "utf8");
    const names = [...css.matchAll(/--text-([a-z]+(?:-[a-z]+)*):/g)].map((m) => m[1]);
    expect(names.length).toBeGreaterThan(20);
    for (const name of names) expect(cn("text-ink", `text-${name}`)).toBe(`text-ink text-${name}`);
  });
});
