import { describe, expect, it } from "vitest";
import { barRows, byWeekTitle, cancelRateText, changedCount, compareWith, lessonsText, periodBars, statsEyebrow, statsPath, tooLittleText, untilText, weekBars, weekdayBars } from "./stats";

const month = {
  range: "month",
  period: { from: "2025-09-01", to: "2025-09-30", daysCounted: 18 },
  previous: { from: "2025-08-01", to: "2025-08-31", daysCounted: 6, totals: { cancelled: 8 } },
};

describe("statsPath", () => {
  it("без вибору курсів — без параметра", () => {
    expect(statsPath("month", [])).toBe("/stats?range=month");
  });
  it("вибрані курси — через кому", () => {
    expect(statsPath("week", ["131", "141"])).toBe("/stats?range=week&courses=131,141");
  });
  it("приховані обов'язкові — параметр hidden", () => {
    expect(statsPath("month", [], ["131"])).toBe("/stats?range=month&hidden=131");
  });
  it("«усі за вибором вимкнено» іде як є", () => {
    expect(statsPath("month", ["keine"])).toBe("/stats?range=month&courses=keine");
  });
});

describe("statsEyebrow", () => {
  it("місяць", () => expect(statsEyebrow("9b", month)).toBe("9b · September"));
  it("тиждень — номер KW", () => expect(statsEyebrow("9b", { range: "week", period: { from: "2026-11-02" } })).toBe("9b · KW 45"));
  it("без класу і без даних", () => {
    expect(statsEyebrow(null, month)).toBe("September");
    expect(statsEyebrow("9b", null)).toBe("9b");
  });
});

describe("compareWith", () => {
  it("більше — «+» і місяць минулого періоду", () => {
    expect(compareWith(11, 8, month)).toEqual({ text: "+3 ggü. Aug", tone: "up" });
  });
  it("менше — справжній мінус", () => {
    expect(compareWith(9, 11, month)).toEqual({ text: "−2 ggü. Aug", tone: "down" });
  });
  it("однаково", () => expect(compareWith(4, 4, month).tone).toBe("same"));
  it("тиждень — номер минулого KW", () => {
    expect(compareWith(2, 1, { range: "week", previous: { from: "2026-10-26", daysCounted: 5 } }).text).toBe("+1 ggü. KW 44");
  });
  it("минулий період без даних або null — без порівняння", () => {
    expect(compareWith(3, 0, { ...month, previous: { ...month.previous, daysCounted: 0 } })).toBeNull();
    expect(compareWith(3, 0, { ...month, previous: null })).toBeNull();
  });
});

describe("підписи", () => {
  it("Vertretungen — заміна, перенос і доданий урок", () => {
    expect(changedCount({ substitutions: 3, moved: 2, added: 1 })).toBe(6);
    expect(changedCount(null)).toBe(0);
  });
  it("bis 30. Sept", () => expect(untilText(month)).toBe("bis 30. Sept"));
  it("Gezählt wird ab — лише коли є дата", () => {
    expect(tooLittleText("2025-09-22")).toMatch(/Gezählt wird ab 22\. September\.$/);
    expect(tooLittleText(null)).not.toMatch(/Gezählt/);
  });
});

describe("weekdayBars", () => {
  it("висоти від найвищого дня", () => {
    const bars = weekdayBars([
      { weekday: "Mo", cancelled: 1, substitutions: 0 },
      { weekday: "Do", cancelled: 3, substitutions: 1 },
    ]);
    expect(bars[0].cancelledPct).toBe(25);
    expect(bars[1].cancelledPct + bars[1].substitutionsPct).toBe(100);
    expect(bars.map((b) => [b.label, b.total])).toEqual([["Mo", 1], ["Do", 4]]);
  });
  it("тиждень без змін — нулі, без ділення на нуль", () => {
    expect(weekdayBars([{ weekday: "Mo", cancelled: 0, substitutions: 0 }])[0].cancelledPct).toBe(0);
    expect(weekdayBars(null)).toEqual([]);
  });
});

describe("barRows", () => {
  it("довжина смужки від найбільшого; предмет може бути null", () => {
    const rows = barRows([{ subject: { code: "En", name: "Englisch" }, cancelled: 4 }, { subject: null, cancelled: 2 }], "cancelled");
    expect(rows.map((r) => r.pct)).toEqual([100, 50]);
    expect(rows[1].subject).toBeNull();
  });
});

const half = { range: "halfyear", period: { from: "2025-04-01", to: "2025-09-30" }, previous: { from: "2024-10-01", daysCounted: 40 } };

describe("ПК: Halbjahr і повні підписи", () => {
  it("eyebrow і порівняння для Halbjahr", () => {
    expect(statsEyebrow("9b", half)).toBe("9b · April–September");
    expect(compareWith(5, 2, half).text).toBe("+3 ggü. Vorhalbjahr");
  });
  it("повна назва місяця і дати", () => {
    expect(compareWith(11, 8, month, { long: true }).text).toBe("+3 ggü. August");
    expect(untilText(month, { long: true })).toBe("bis 30. September");
  });
  it("частка відмін і кількість уроків", () => {
    expect(cancelRateText(0.0591)).toBe("6 %");
    expect(cancelRateText(0)).toBe("0 %");
    expect(cancelRateText(undefined)).toBe("0 %");
    expect(lessonsText(186)).toBe("von 186 Stunden");
    expect(lessonsText(1)).toBe("von 1 Stunde");
  });
  it("заголовок графіка по тижнях", () => {
    expect(byWeekTitle(month)).toBe("September nach Woche");
    expect(byWeekTitle(half)).toBe("Halbjahr nach Woche");
  });
});

describe("weekBars і periodBars", () => {
  it("тижні підписані номером KW", () => {
    const bars = weekBars([{ week: "2025-W36", from: "2025-09-01", cancelled: 3, substitutions: 2 }]);
    expect(bars[0]).toMatchObject({ label: "KW 36", total: 5, cancelledPct: 60, substitutionsPct: 40 });
  });
  it("уроки: «1.», висота від найбільшого, порожньо без даних", () => {
    expect(periodBars([{ period: 1, cancelled: 1 }, { period: 3, cancelled: 3 }]).map((b) => [b.label, Math.round(b.pct)])).toEqual([["1.", 33], ["3.", 100]]);
    expect(periodBars(null)).toEqual([]);
  });
});
