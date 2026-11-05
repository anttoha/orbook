import { describe, expect, it } from "vitest";
import { barRows, changedCount, compareWith, statsEyebrow, statsPath, tooLittleText, untilText, weekdayBars } from "./stats";

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
  it("тиждень — Vorwoche", () => {
    expect(compareWith(2, 1, { range: "week", previous: { from: "2026-10-26", daysCounted: 5 } }).text).toBe("+1 ggü. Vorwoche");
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
