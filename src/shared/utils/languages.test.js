import { describe, expect, it } from "vitest";
import { detectLanguage, filterLanguages, isLanguage } from "./languages";

describe("detectLanguage", () => {
  it("берёт первый знакомый язык браузера", () => {
    expect(detectLanguage(["uk-UA", "de"])).toBe("uk");
    expect(detectLanguage(["fr-FR", "en-GB"])).toBe("en");
  });
  it("без знакомого языка или без списка — немецкий", () => {
    expect(detectLanguage(["ru-RU", "fr"])).toBe("de");
    expect(detectLanguage(undefined)).toBe("de");
    expect(detectLanguage([])).toBe("de");
  });
});

describe("filterLanguages", () => {
  it("пустой запрос — все три языка", () => expect(filterLanguages("  ")).toHaveLength(3));
  it("ищет по началу названия и по другим названиям", () => {
    expect(filterLanguages("uk").map((l) => l.code)).toEqual(["uk"]);
    expect(filterLanguages("GERMAN").map((l) => l.code)).toEqual(["de"]);
    expect(filterLanguages("eng").map((l) => l.code)).toEqual(["en"]);
  });
  it("ничего не нашлось — пустой список", () => expect(filterLanguages("fr")).toEqual([]));
});

describe("isLanguage", () => {
  it("знает только de, en, uk", () => {
    expect(isLanguage("uk")).toBe(true);
    expect(isLanguage("ru")).toBe(false);
    expect(isLanguage(null)).toBe(false);
  });
});
