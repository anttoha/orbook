import { describe, expect, it } from "vitest";
import { dayOf, degrees, samePlace, standLabel, hourAt, leaveLine, leaveTime, rainText, schoolHours, summaryLine, weatherKind, weatherTips } from "./weather";

const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((hour) => ({ hour, temp: hour + 2, code: 3, rain: hour >= 13 ? 60 : 0 }));
const DAY = { date: "2026-11-26", code: 61, tMax: 17, tMin: 9, rainMax: 60, rainFrom: 13, windMax: 18, uvMax: 1.2, hours };
const WEATHER = { place: { name: "Hannover" }, updatedAt: "2026-11-26T05:12:00Z", days: [DAY] };

describe("weatherKind", () => {
  it("ordnet WMO-Codes Symbolen zu", () => {
    expect(weatherKind(0)).toBe("sun");
    expect(weatherKind(2)).toBe("cloud-sun");
    expect(weatherKind(3)).toBe("cloud");
    expect(weatherKind(45)).toBe("fog");
    expect(weatherKind(61)).toBe("rain");
    expect(weatherKind(81)).toBe("rain");
    expect(weatherKind(73)).toBe("snow");
    expect(weatherKind(95)).toBe("storm");
    expect(weatherKind(null)).toBeNull();
  });
});

describe("dayOf / hourAt", () => {
  it("findet den Tag oder null", () => {
    expect(dayOf(WEATHER, "2026-11-26")).toBe(DAY);
    expect(dayOf(WEATHER, "2026-12-26")).toBeNull();
    expect(dayOf(null, "2026-11-26")).toBeNull();
    expect(dayOf({ days: null }, "2026-11-26")).toBeNull();
  });
  it("nimmt die nächste Stunde", () => {
    expect(hourAt(DAY, "07:05").hour).toBe(7);
    expect(hourAt(DAY, "07:40").hour).toBe(8);
    expect(hourAt(DAY, "22:00")).toBeNull();
    expect(hourAt(DAY, null)).toBeNull();
    expect(hourAt({ hours: null }, "07:00")).toBeNull();
  });
});

describe("Texte", () => {
  it("Regen mit und ohne Uhrzeit, trocken, ohne Daten", () => {
    expect(rainText(DAY)).toBe("Regen 60 % ab 13 Uhr");
    expect(rainText({ rainMax: 40, rainFrom: null })).toBe("Regen 40 %");
    expect(rainText({ rainMax: 5 })).toBe("trocken");
    expect(rainText({ rainMax: null })).toBeNull();
  });
  it("Zeile der Karte", () => {
    expect(summaryLine(DAY)).toBe("Regen 60 % ab 13 Uhr · Wind 18 km/h");
    expect(summaryLine({ rainMax: 0, windMax: null })).toBe("Trocken");
    expect(summaryLine({})).toBe("");
    expect(degrees(null)).toBe("–");
    expect(degrees(0)).toBe("0°");
  });
  it("Losgehen-Zeile", () => {
    expect(leaveLine({ temp: 9, rain: 0 })).toEqual({ temp: "9°", rain: "trocken" });
    expect(leaveLine({ temp: null, rain: 40 })).toEqual({ temp: "–", rain: "Regen 40 %" });
    expect(leaveLine(null)).toBeNull();
  });
});

describe("leaveTime", () => {
  const lessons = [
    { start: "07:30", status: "cancelled" },
    { start: "08:20" },
    { start: "07:50", notMine: true },
    { start: null },
  ];
  it("erste eigene Stunde minus Minuten", () => {
    expect(leaveTime(lessons, 45)).toBe("07:35");
    expect(leaveTime([{ start: "07:50" }], 45)).toBe("07:05");
  });
  it("ohne Stunden null", () => {
    expect(leaveTime([], 45)).toBeNull();
    expect(leaveTime(null)).toBeNull();
  });
});

describe("weatherTips", () => {
  it("Regenjacke und Jacke bei Regen und 9°", () => {
    expect(weatherTips(DAY, { temp: 9 }).map((t) => t.key)).toEqual(["regenjacke", "jacke"]);
  });
  it("Mütze, Sonnencreme, abgeschaltete Tipps", () => {
    const cold = { rainMax: 0, tMin: 1, uvMax: 7 };
    expect(weatherTips(cold).map((t) => t.key)).toEqual(["jacke", "muetze", "sonnencreme"]);
    expect(weatherTips(cold, null, { regenjacke: null, jacke: null, muetze: 3, sonnencreme: null }).map((t) => t.key)).toEqual(["muetze"]);
  });
  it("ohne Daten nichts", () => {
    expect(weatherTips(null)).toEqual([]);
    expect(weatherTips({ rainMax: null, tMin: null, uvMax: null })).toEqual([]);
  });
  it("Stunden 7–14", () => {
    expect(schoolHours(DAY).map((h) => h.hour)).toEqual([7, 8, 9, 10, 11, 12, 13, 14]);
    expect(schoolHours(null)).toEqual([]);
  });
});

describe("standLabel", () => {
  const now = new Date("2026-11-26T10:00:00Z");
  it("heute nur Uhrzeit, gestern mit Wort, sonst Datum", () => {
    expect(standLabel("2026-11-26T05:12:00Z", now)).toBe("06:12");
    expect(standLabel("2026-11-25T20:30:00Z", now)).toBe("gestern 21:30");
    expect(standLabel("2026-11-23T20:30:00Z", now)).toBe("Mo, 23.11. 21:30");
    expect(standLabel(null, now)).toBeNull();
  });
});

describe("samePlace", () => {
  it("vergleicht Koordinaten, null mit null ist gleich", () => {
    expect(samePlace({ lat: 1, lon: 2, name: "A" }, { lat: 1, lon: 2, name: "B" })).toBe(true);
    expect(samePlace({ lat: 1, lon: 2 }, { lat: 1, lon: 3 })).toBe(false);
    expect(samePlace(null, null)).toBe(true);
    expect(samePlace(null, { lat: 1, lon: 2 })).toBe(false);
  });
});
