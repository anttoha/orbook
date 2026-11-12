import { describe, expect, it } from "vitest";
import { FACTS, SECTIONS, STAND } from "../datenschutz";
import { isIsoDate } from "./format";

// Тексты Datenschutz — не логика, но ошибки в них дорогие: проверяем форму и что старые неверные фразы не вернулись.
const allText = [...FACTS.map((f) => f.text), ...SECTIONS.flatMap((s) => [...s.intro, ...(s.rows ?? []).flat()])].join(" ");

describe("Datenschutz-Texte", () => {
  it("у каждого раздела есть заголовок и текст, id не повторяются", () => {
    const ids = [...FACTS, ...SECTIONS].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const section of SECTIONS) {
      expect(section.title).toBeTruthy();
      expect(section.intro.length).toBeGreaterThan(0);
    }
  });

  it("дата «Stand» — настоящая дата", () => {
    expect(isIsoDate(STAND)).toBe(true);
  });

  it("называет все три cookie сервера", () => {
    const cookies = SECTIONS.find((s) => s.id === "cookies").rows.map(([name]) => name);
    expect(cookies).toEqual(["orbook_session", "orbook_device", "orbook_admin"]);
  });

  it("без устаревших фраз из первой версии", () => {
    expect(allText).not.toMatch(/gemeinsamen Passwort|ohne Autor|außer der Anmeldung\./);
  });
});
