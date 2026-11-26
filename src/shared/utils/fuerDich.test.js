import { describe, expect, it } from "vitest";
import { hintsFor } from "../constants/packHints";
import { DEFAULT_FUER_DICH, ITEMS_PER_SUBJECT, STEPS, addItem, canStep, cleanFuerDich, removeItem, renameItem, stepValue, subjectsWithItems } from "./fuerDich";

describe("Einstellungen «Für dich jetzt»", () => {
  it("пустое или мусор — по умолчанию", () => {
    expect(cleanFuerDich(null)).toEqual(DEFAULT_FUER_DICH);
    expect(cleanFuerDich({ leaveMinutes: 47, eveningFrom: "25:00", show: { wetter: "ja" }, tips: { jacke: 99 } })).toEqual(DEFAULT_FUER_DICH);
  });

  it("годное сохраняется, «Aus» (null) у совета — тоже", () => {
    const s = cleanFuerDich({ leaveMinutes: 30, eveningFrom: "19:30", tips: { sonnencreme: null }, items: { Ku: ["  Malkasten ", ""] } });
    expect(s.leaveMinutes).toBe(30);
    expect(s.eveningFrom).toBe("19:30");
    expect(s.tips.sonnencreme).toBeNull();
    expect(s.items).toEqual({ Ku: ["Malkasten"] });
  });

  it("степперы: границы и «Aus»", () => {
    expect(STEPS.leaveMinutes[0]).toBe(5);
    expect(STEPS.leaveMinutes.at(-1)).toBe(120);
    expect(STEPS.eveningFrom[0]).toBe("14:00");
    expect(STEPS.eveningFrom.at(-1)).toBe("22:00");
    expect(stepValue(STEPS.leaveMinutes, 5, -1)).toBe(5);
    expect(canStep(STEPS.leaveMinutes, 120, 1)).toBe(false);
    expect(stepValue(STEPS.regenjacke, 90, 1)).toBeNull(); // выше 90 % — Aus
    expect(stepValue(STEPS.jacke, 0, -1)).toBeNull(); // ниже 0° — Aus
    expect(stepValue(STEPS.jacke, null, 1)).toBe(0);
    expect(stepValue(STEPS.eveningFrom, "17:00", 1)).toBe("17:30");
  });

  it("вещи: свой текст, без повторов, до 10, пустое убирает", () => {
    let items = addItem({}, "Ku", " Zeichenblock ");
    items = addItem(items, "Ku", "zeichenblock");
    expect(items).toEqual({ Ku: ["Zeichenblock"] });
    items = renameItem(items, "Ku", 0, "Pinsel");
    expect(items.Ku).toEqual(["Pinsel"]);
    expect(removeItem(items, "Ku", 0)).toEqual({});
    expect(renameItem(items, "Ku", 0, "  ")).toEqual({});
    let full = {};
    for (let i = 0; i < 12; i++) full = addItem(full, "Ma", `Ding ${i}`);
    expect(full.Ma).toHaveLength(ITEMS_PER_SUBJECT);
    expect(addItem({}, "Ma", "x".repeat(50)).Ma[0]).toHaveLength(40);
    expect(subjectsWithItems({ Sp: ["a"], Ku: ["b"] })).toBe(2);
  });

  it("подсказки без уже добавленных; незнакомый предмет — общие", () => {
    expect(hintsFor("Ku", ["Pinsel"])).not.toContain("Pinsel");
    expect(hintsFor("Xy")).toEqual(["Heft", "Buch", "Mappe"]);
  });
});
