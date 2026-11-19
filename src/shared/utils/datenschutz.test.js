import { describe, expect, it } from "vitest";
import { FACTS, SECTIONS, STAND } from "../datenschutz";
import { isIsoDate } from "./format";
import { en } from "../i18n/en";
import { uk } from "../i18n/uk";

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

// Страница переводится целиком (часть 32): у каждого заголовка, абзаца и строки таблицы — пара в en и uk.
// Имена cookie — не текст, их не переводим.
describe("Datenschutz-Übersetzungen", () => {
  const cookieNames = SECTIONS.find((s) => s.id === "cookies").rows.map(([name]) => name);
  const texts = [
    ...FACTS.flatMap((f) => [f.title, f.text]),
    ...SECTIONS.flatMap((s) => [s.title, ...s.intro, ...(s.rows ?? []).flat()]),
  ].filter((text) => !cookieNames.includes(text));

  it.each([["en", en], ["uk", uk]])("на %s переведён каждый текст", (code, dict) => {
    expect(texts.filter((text) => !(text in dict))).toEqual([]);
  });
});
