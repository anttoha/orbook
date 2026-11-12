import { describe, expect, it } from "vitest";
import { errorLine, groupLine, minutesOptions, sentLabel, tomorrowHint } from "./channels";

describe("channels", () => {
  it("groupLine: название и число; null — запасной текст", () => {
    expect(groupLine({ title: "9b Klasse", members: 27 })).toBe("„9b Klasse“ · 27 Mitglieder");
    expect(groupLine({ title: "9b Klasse", members: null })).toBe("„9b Klasse“");
    expect(groupLine({ title: null, members: null })).toBe("Telegram-Gruppe");
    expect(groupLine(null)).toBe("Telegram-Gruppe");
  });

  it("tomorrowHint: время или «keine Stunden»", () => {
    expect(tomorrowHint("13:35")).toBe("Heute um 13:35");
    expect(tomorrowHint(null)).toBe("Heute keine Stunden");
  });

  it("sentLabel: heute, gestern, Wochentag mit Datum", () => {
    const now = new Date(2026, 10, 13, 16, 0);
    expect(sentLabel(new Date(2026, 10, 13, 13, 35).toISOString(), now)).toBe("Heute 13:35");
    expect(sentLabel(new Date(2026, 10, 12, 13, 50).toISOString(), now)).toBe("Gestern 13:50");
    expect(sentLabel(new Date(2026, 10, 10, 7, 14).toISOString(), now)).toBe("Di 10.11. 07:14");
    expect(sentLabel(null, now)).toBe("");
    expect(sentLabel("kaputt", now)).toBe("");
  });

  it("errorLine и minutesOptions", () => {
    expect(errorLine("removed")).toMatch(/entfernt/);
    expect(errorLine("failed")).toMatch(/nicht an/);
    expect(minutesOptions[1]).toEqual({ value: 30, label: "30 Min." });
  });
});
