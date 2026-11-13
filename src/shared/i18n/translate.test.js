import { afterEach, describe, expect, it } from "vitest";
import { setCurrentLanguage, translate, translateTo } from "./translate";
import { en } from "./en";
import { uk } from "./uk";

afterEach(() => setCurrentLanguage("de"));

describe("translate", () => {
  it("немецкий и неизвестный текст остаются как есть", () => {
    expect(translate("Darstellung")).toBe("Darstellung");
    setCurrentLanguage("en");
    expect(translate("Text ohne Übersetzung")).toBe("Text ohne Übersetzung");
  });
  it("переводит по текущему языку", () => {
    setCurrentLanguage("uk");
    expect(translate("Mehr")).toBe("Ще");
    expect(translateTo("en", "Mehr")).toBe("More");
  });
  it("в словарях одни и те же ключи", () => {
    expect(Object.keys(uk).sort()).toEqual(Object.keys(en).sort());
  });
  it("в переводах нет русских букв ы, э, ъ, ё", () => {
    for (const text of [...Object.values(en), ...Object.values(uk)]) expect(text).not.toMatch(/[ыэъё]/i);
  });
});
