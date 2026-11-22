import { describe, expect, it } from "vitest";
import { allSeries, scaleBottom, zielInfo, zielSeries, zielStatus } from "./notenZiel";

// Mathe из макета: 2- (27.08.), 1 (03.09.), 2 (10.09.), 3+ ×2 (16.09.) → Schnitt 2,14
const MA = [
  { date: "2025-09-16", value: 2.7, weight: 2 },
  { date: "2025-09-10", value: 2 },
  { date: "2025-09-03", value: 1 },
  { date: "2025-08-27", value: 2.3, weight: null },
];

describe("zielStatus", () => {
  it("knapp, erreichbar, schwer", () => {
    expect(zielStatus({ status: "need", need: 1.6 }, 2.14)).toBe("knapp");
    expect(zielStatus({ status: "need", need: 2.3 }, 1.9)).toBe("erreichbar");
    expect(zielStatus({ status: "need", need: 1.7 }, 3.65)).toBe("schwer");
    expect(zielStatus({ status: "sure" }, 1.5)).toBe("erreichbar");
    expect(zielStatus({ status: "impossible" }, 2.6)).toBe("schwer");
  });
  it("ohne Schnitt kein Status", () => expect(zielStatus({ status: "sure" }, null)).toBeNull());
});

describe("zielInfo", () => {
  it("Mathe mit Ziel 2,0 und ×2: 1,6 oder besser, knapp", () => {
    const info = zielInfo(MA, { ziel: 2, k: 2 });
    expect(info.result.need).toBe(1.6);
    expect(info.status).toBe("knapp");
  });
  it("kein Ziel → null; Noten ohne Zahl → ohne Ergebnis", () => {
    expect(zielInfo(MA, undefined)).toBeNull();
    expect(zielInfo([{ date: "2025-09-01", value: null }], { ziel: 2 })).toEqual({ ziel: 2, result: null, status: null });
  });
});

describe("zielSeries", () => {
  it("Punkt je Tag, Schnitt bis zu diesem Tag; ohne Datum oder Zahl nicht dabei", () => {
    const points = zielSeries([...MA, { date: null, value: 1 }, { date: "2025-09-05", value: null }]);
    expect(points.map((p) => p.date)).toEqual(["2025-08-27", "2025-09-03", "2025-09-10", "2025-09-16"]);
    expect(points.map((p) => Math.round(p.value * 100) / 100)).toEqual([2.3, 1.65, 1.77, 2.14]);
  });
  it("zwei Noten am selben Tag → ein Punkt", () => {
    expect(zielSeries([{ date: "2025-09-01", value: 1 }, { date: "2025-09-01", value: 3 }])).toEqual([{ date: "2025-09-01", value: 2 }]);
  });
});

describe("allSeries", () => {
  it("Mittel der Fächer, die an dem Tag schon Noten haben", () => {
    const subjects = [{ list: [{ date: "2025-09-01", value: 1 }, { date: "2025-09-03", value: 3 }] }, { list: [{ date: "2025-09-02", value: 3 }] }, { list: null }];
    expect(allSeries(subjects)).toEqual([
      { date: "2025-09-01", value: 1 },
      { date: "2025-09-02", value: 2 },
      { date: "2025-09-03", value: 2.5 },
    ]);
  });
});

describe("scaleBottom", () => {
  it("mindestens 3, passt schlechtesten Punkt und Ziel, höchstens 6", () => {
    expect(scaleBottom([{ value: 2.1 }], 2)).toBe(3);
    expect(scaleBottom([{ value: 3.65 }], 3)).toBe(4);
    expect(scaleBottom([{ value: 2 }], 4.5)).toBe(5);
    expect(scaleBottom([{ value: 6 }], null)).toBe(6);
  });
});
