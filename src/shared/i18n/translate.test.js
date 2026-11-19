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
  it("подставляет значения в шаблон", () => {
    expect(translate("Klasse {name}", { name: "8a" })).toBe("Klasse 8a");
    expect(translateTo("en", "{length} Treffer", { length: 3 })).toBe("3 results");
    expect(translate("ohne {x}")).toBe("ohne {x}");
  });
  it("в переводах те же вставки, что в ключе", () => {
    const slots = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    for (const dict of [en, uk]) for (const [key, text] of Object.entries(dict)) expect([key, slots(text)]).toEqual([key, slots(key)]);
  });
  it("пробел в конце ключа сохраняется в переводе (текст стоит вплотную к значению)", () => {
    for (const dict of [en, uk]) for (const [key, text] of Object.entries(dict)) expect([key, text.endsWith(" ")]).toEqual([key, key.endsWith(" ")]);
  });
  it("в словарях одни и те же ключи", () => {
    expect(Object.keys(uk).sort()).toEqual(Object.keys(en).sort());
  });
  it("в переводах нет русских букв ы, э, ъ, ё", () => {
    for (const text of [...Object.values(en), ...Object.values(uk)]) expect(text).not.toMatch(/[ыэъё]/i);
  });
});
