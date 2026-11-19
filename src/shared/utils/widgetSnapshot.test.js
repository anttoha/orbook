import { describe, expect, it } from "vitest";
import { en } from "../i18n/en";
import { uk } from "../i18n/uk";
import { WIDGET_APP_SETTINGS, WIDGET_KINDS, WIDGET_TEXTS, buildSnapshot, previewSize } from "./widgetSnapshot";

const note = (id, text, updatedAt, deleted = false) => ({ id, text, updatedAt, deleted });

describe("buildSnapshot", () => {
  // Часть 31d: виджет повторяет приложение — каждая настройка, которая меняет вид или содержание Start, должна быть в снимке
  it("каждая настройка приложения, влияющая на виджет, попадает в снимок", () => {
    const changed = { design: "klar", accent: "blau", glassBg: "meer", glassMode: "einfach", plan: { showRoom: false }, showWeekend: true, fontScale: 3, colorOverrides: { Ma: "kunst" } };
    expect(Object.keys(changed).sort()).toEqual([...WIDGET_APP_SETTINGS].sort());
    const base = JSON.stringify(buildSnapshot({ user: {} }));
    for (const key of WIDGET_APP_SETTINGS) {
      expect(JSON.stringify(buildSnapshot({ user: { [key]: changed[key] } })), key).not.toBe(base);
    }
  });

  it("оформление и «Stundenplan»: по умолчанию — как у нового пользователя", () => {
    const snap = buildSnapshot({ user: {} });
    expect(snap.look).toEqual({ design: "soft", accent: "violett", glassBg: "aurora", glassMode: "voll", fontScale: 2 });
    expect(snap.plan.lessonLabel).toBe("kuerzel");
    expect(snap.plan.cancelled).toBe("durchstreichen");
    expect(snap.showWeekend).toBe(false);
  });

  const classes = [
    { id: 1, name: "9b", label: "" },
    { id: 2, name: "5a", label: "Geschwister" },
    { id: 3, name: "7c", gone: true },
  ];
  const user = {
    picked: ["147"],
    hiddenRequired: [],
    notes: [note("a", "Vokabeln lernen", "2026-10-02"), note("b", "alt", "2026-10-01"), note("c", "weg", "2026-10-03", true)],
    colorOverrides: { Ma: "kunst" },
    byClass: { 2: { picked: ["keine"], hiddenRequired: ["131"], notes: [] } },
  };

  it("берёт поля открытого класса сверху, остальных — из byClass; закрытые классы пропускает", () => {
    const snap = buildSnapshot({ classes, activeId: 1, user, marks: [], lang: "de" });
    expect(snap.classes).toEqual([
      { id: 1, name: "9b", courses: ["147"], hidden: [], notes: ["Vokabeln lernen", "alt"] },
      { id: 2, name: "Geschwister", courses: ["keine"], hidden: ["131"], notes: [] },
    ]);
    expect(snap.palette).toEqual({ Ma: "kunst" });
  });

  it("галочки — только выполненные домашки, номера строками", () => {
    const marks = [{ id: "4", done: true }, { id: "5", done: false }];
    expect(buildSnapshot({ classes, activeId: 1, user, marks }).done).toEqual(["4"]);
  });

  it("тема: system → null (виджет следует телефону)", () => {
    expect(buildSnapshot({ theme: "system" }).theme).toBeNull();
    expect(buildSnapshot({ theme: "dark" }).theme).toBe("dark");
  });

  it("старый сервер без классов — один класс без id", () => {
    const snap = buildSnapshot({ classes: [], user: { picked: [], notes: [] }, fallbackName: "8a" });
    expect(snap.classes).toEqual([{ id: null, name: "8a", courses: [], hidden: [], notes: [] }]);
  });

  it("тексты виджета — на языке приложения, плейсхолдер {n} остаётся", () => {
    const snap = buildSnapshot({ lang: "en" });
    expect(snap.lang).toBe("en");
    expect(snap.texts["noch {n} min"]).toContain("{n}");
    expect(Object.keys(snap.texts)).toEqual(WIDGET_TEXTS);
  });
});

it("у каждого текста виджета есть перевод на English и Українська", () => {
  for (const key of WIDGET_TEXTS) {
    expect(en[key], `en: ${key}`).toBeTruthy();
    expect(uk[key], `uk: ${key}`).toBeTruthy();
    if (key.includes("{n}")) {
      expect(en[key]).toContain("{n}");
      expect(uk[key]).toContain("{n}");
    }
  }
});

it("подписи и размеры превью", () => {
  expect(previewSize({ cols: 2, rows: 2 })).toBe("klein");
  expect(previewSize({ cols: 4, rows: 2 })).toBe("breit");
  expect(previewSize({ cols: 4, rows: 4 })).toBe("gross");
  expect(WIDGET_KINDS).toHaveLength(9);
});

it("заголовки видов виджета с заглавной буквы на любом языке", async () => {
  const { upperFirst } = await import("./format");
  expect(upperFirst("зміни")).toBe("Зміни");
  expect(upperFirst("changes")).toBe("Changes");
  expect(upperFirst("")).toBe("");
  expect(upperFirst(undefined)).toBeUndefined();
});
