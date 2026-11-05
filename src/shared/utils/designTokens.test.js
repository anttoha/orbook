// Сторож правил CLAUDE.md: цвета, шрифты и радиусы в коде — только токены из index.css.
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SRC = new URL("../../", import.meta.url);
const css = readFileSync(new URL("index.css", SRC), "utf8");

const codeFiles = readdirSync(SRC, { recursive: true })
  .filter((name) => /\.jsx?$/.test(name) && !name.endsWith(".test.js"))
  .map((name) => ({ name, text: readFileSync(new URL(name, SRC), "utf8") }));

// Все совпадения шаблона в коде, вместе с именем файла
const findAll = (pattern) => codeFiles.flatMap(({ name, text }) => (text.match(pattern) ?? []).map((hit) => `${name}: ${hit}`));

const colorNames = (block) => [...block.matchAll(/--color-([\w-]+):/g)].map((m) => m[1]);

describe("цвета", () => {
  it("у каждого цвета из @theme есть значение в .dark", () => {
    const light = colorNames(css.slice(css.indexOf("@theme"), css.indexOf(".dark {")));
    const dark = colorNames(css.slice(css.indexOf(".dark {"), css.indexOf("@layer base")));
    expect(light.length).toBeGreaterThan(0);
    expect(light.filter((name) => !dark.includes(name))).toEqual([]);
  });

  it("в коде нет hex и rgb()", () => {
    expect(findAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(/g)).toEqual([]);
  });

  it("в коде нет произвольных цветов в классах", () => {
    expect(findAll(/\b(bg|border|ring|fill|stroke|from|to|via)-\[(#|rgb|var|color)[^\]]*\]/g)).toEqual([]);
  });
});

describe("шрифты и радиусы", () => {
  it("в коде нет text-[13px] и подобного", () => {
    expect(findAll(/\btext-\[[^\]]*\]/g)).toEqual([]);
  });

  it("в коде нет rounded-[…]", () => {
    expect(findAll(/\brounded(-[a-z]+)?-\[[^\]]*\]/g)).toEqual([]);
  });

  it("каждый класс rounded-* есть в @theme", () => {
    const known = [...css.matchAll(/--radius-([a-z]+):/g)].map((m) => m[1]);
    const allowed = [...known, "full", "none"];
    // Последнее слово класса — значение: rounded-card, rounded-tr-cell
    const unknown = findAll(/\brounded-[a-z0-9-]+/g).filter((hit) => !allowed.includes(hit.split("-").at(-1)));
    expect(unknown).toEqual([]);
  });
});
