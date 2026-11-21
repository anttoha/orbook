import { describe, expect, it } from "vitest";
import { NOTEN_KINDS, WIDGET_DEFAULTS, WIDGET_KIND_LIST, WIDGET_ROWS, isNotenKind, cellsLabel, configToSave, parseWidget, parseWidgets, widgetClass, widgetConfigOf } from "./widgetConfig";

describe("parseWidget", () => {
  it("читает ответ моста и подставляет значения по умолчанию", () => {
    const w = parseWidget('{"id":7,"kind":"woche","classId":2,"mine":false,"look":"dunkel","design":"klar","accent":"gruen","alpha":40,"cols":4,"rows":4}');
    expect(w).toMatchObject({ id: 7, kind: "woche", classId: 2, mine: false, look: "dunkel", design: "klar", accent: "gruen", alpha: 40, cols: 4, rows: 4 });
    expect(w.font).toBe("m");
    expect(parseWidget('{"id":3,"kind":"materialien","classId":null}')).toMatchObject({ kind: "jetzt", classId: null, mine: true, look: "app", design: "app", alpha: 100, cols: 4, rows: 2 });
  });

  it("мусор → null, список с мусором → только верные", () => {
    expect(parseWidget("nope")).toBeNull();
    expect(parseWidget(null)).toBeNull();
    expect(parseWidgets('[{"id":1},{"x":2}]').map((w) => w.id)).toEqual([1]);
    expect(parseWidgets(undefined)).toEqual([]);
  });
});

describe("widgetConfigOf", () => {
  it("старая настройка 31b: «Halb» → фон 70 %, «Voll» → 100 %", () => {
    expect(widgetConfigOf({ background: "halb" }).alpha).toBe(70);
    expect(widgetConfigOf({ background: "voll" }).alpha).toBe(100);
  });

  it("чужие значения → по умолчанию; прозрачность — шагами по 10 от 0 до 100", () => {
    const c = widgetConfigOf({ design: "neon", refresh: 5, testsDays: "14", showDone: "ja", alpha: 137 });
    expect(c).toMatchObject({ design: "app", refresh: 30, testsDays: 14, showDone: false, alpha: 100 });
    expect(widgetConfigOf({ alpha: 44 }).alpha).toBe(40);
    expect(widgetConfigOf({ alpha: 0 }).alpha).toBe(0);
    expect(widgetConfigOf(null)).toEqual(WIDGET_DEFAULTS);
  });

  it("сохраняем только поля настройки, без id и размера", () => {
    const saved = configToSave({ ...WIDGET_DEFAULTS, id: 4, cols: 4, rows: 2 });
    expect(Object.keys(saved)).toEqual(Object.keys(WIDGET_DEFAULTS));
  });
});

it("строки «Anzeige» есть у каждого вида и только из известных полей", () => {
  expect(Object.keys(WIDGET_ROWS)).toEqual(WIDGET_KIND_LIST);
  for (const rows of Object.values(WIDGET_ROWS)) for (const key of rows) expect(WIDGET_DEFAULTS).toHaveProperty(key);
});

it("подпись размера", () => {
  expect(cellsLabel({ cols: 4, rows: 2 })).toBe("4 × 2");
});

it("класс виджета: сохранённый, если он ещё есть, иначе открытый", () => {
  const classes = [{ id: 1 }, { id: 2 }];
  expect(widgetClass({ classId: 2 }, classes, 1)).toBe(2);
  expect(widgetClass({ classId: 9 }, classes, 1)).toBe(1);
  expect(widgetClass({ classId: null }, [], null)).toBeNull();
});

describe("часть 39: виды с оценками", () => {
  it("оценки по умолчанию скрыты; «Noten anzeigen» сохраняется только как true/false", () => {
    expect(WIDGET_DEFAULTS.showGrades).toBe(false);
    expect(widgetConfigOf({ kind: "neueNoten", showGrades: true })).toMatchObject({ kind: "neueNoten", showGrades: true });
    expect(widgetConfigOf({ kind: "fehlzeiten", showGrades: "ja" }).showGrades).toBe(false);
  });

  it("у видов с оценками в «Anzeige» только «Noten anzeigen»", () => {
    for (const kind of NOTEN_KINDS) expect(WIDGET_ROWS[kind]).toEqual(["showGrades"]);
    expect(isNotenKind("noten")).toBe(true);
    expect(isNotenKind("tests")).toBe(false);
  });
});
