import { describe, expect, it } from "vitest";
import {
  ago,
  authorText,
  berlinToday,
  classPasswordText,
  codeChip,
  courseState,
  errorHours,
  eventTime,
  hasRight,
  labelError,
  lastUsedText,
  optionalPatch,
  planHealth,
  planTimesText,
  rightsText,
  schoolYearEnd,
  serverLine,
  settingsPatch,
  shownName,
  subjectNamesPatch,
  validText,
  validUntilFor,
  withCurrent,
} from "./admin";

const NOW = "2026-11-06T16:40:00+01:00";

describe("Zeiten", () => {
  it("ago: Minuten, Stunden, gestern, Tage, null", () => {
    expect(ago("2026-11-06T16:39:50+01:00", NOW)).toBe("gerade eben");
    expect(ago("2026-11-06T16:20:00+01:00", NOW)).toBe("vor 20 Min");
    expect(ago("2026-11-06T14:40:00+01:00", NOW)).toBe("vor 2 Std");
    expect(ago("2026-11-05T16:40:00+01:00", NOW)).toBe("gestern");
    expect(ago("2026-11-01T16:40:00+01:00", NOW)).toBe("vor 5 Tagen");
    expect(ago(null, NOW)).toBe("noch nie");
  });

  it("eventTime: heute Uhrzeit, gestern, älter Datum", () => {
    expect(eventTime("2026-11-06T16:40:00+01:00", "2026-11-06")).toBe("16:40");
    expect(eventTime("2026-11-05T17:02:00+01:00", "2026-11-06")).toBe("gestern 17:02");
    expect(eventTime("2026-11-05T17:02:00+01:00", "2026-11-06", { withTime: false })).toBe("gestern");
    expect(eventTime("2026-09-10T08:00:00+02:00", "2026-11-06")).toBe("10. Sept");
  });

  it("berlinToday nimmt die Berliner Zeitzone", () => {
    expect(berlinToday(new Date("2026-11-06T23:30:00Z"))).toBe("2026-11-07");
  });
});

describe("Plan", () => {
  it("planHealth: Fehler vor veraltet", () => {
    expect(planHealth({ consecutiveErrors: 0, status: { stale: false } })).toBe("ok");
    expect(planHealth({ consecutiveErrors: 0, status: { stale: true } })).toBe("warn");
    expect(planHealth({ consecutiveErrors: 2, status: { stale: false } })).toBe("error");
  });

  it("planTimesText verträgt null-Zeiten", () => {
    expect(planTimesText({ lastOkAt: "2026-11-06T16:40:00+01:00", nextFetchAt: "2026-11-06T16:45:00+01:00" })).toBe("Zuletzt geladen 16:40 · nächster Abruf 16:45");
    expect(planTimesText({ lastOkAt: null, nextFetchAt: null })).toBe("Noch nie geladen");
  });

  it("serverLine lässt fehlende Teile weg", () => {
    const hours = [{ status: "ok" }, { status: "error" }, { status: null }];
    expect(serverLine("https://www.stundenplan24.de", 32, hours)).toBe("Server www.stundenplan24.de · 32 Klassen · 1 Fehler in 24 Std");
    expect(serverLine(null, null, [])).toBe("");
    expect(errorHours(hours)).toBe(1);
  });

  it("classPasswordText: Datum unbekannt → null", () => {
    expect(classPasswordText(null, "2026-11-06")).toBeNull();
    expect(classPasswordText("2026-10-25", "2026-11-06")).toEqual({ since: "Seit 25. Okt", ago: "vor 12 Tagen" });
  });
});

describe("Editor-Codes", () => {
  it("rightsText wie im Design", () => {
    expect(rightsText({ create: true, editOwn: true, editAll: false })).toBe("Eintragen · eigene bearbeiten");
    expect(rightsText({ create: false, editOwn: false, editAll: true })).toBe("Alle bearbeiten");
    expect(rightsText({ create: true, editOwn: false, editAll: false })).toBe("Eintragen");
    expect(hasRight({ create: false, editOwn: false, editAll: false })).toBe(false);
  });

  it("Chip und Gültig bis", () => {
    expect(codeChip({ status: "locked" })).toBe("GESPERRT");
    expect(validText({ status: "expired", validUntil: "2026-10-01" })).toBe("abgelaufen");
    expect(validText({ status: "ok", validUntil: "2027-07-31" })).toBe("31. Juli");
    expect(validText({ status: "ok", validUntil: null })).toBe("—");
  });

  it("Schuljahresende: dieses oder nächstes Jahr, null ohne Einstellung", () => {
    expect(schoolYearEnd("2026-11-06", "07-31")).toBe("2027-07-31");
    expect(schoolYearEnd("2026-03-01", "07-31")).toBe("2026-07-31");
    expect(schoolYearEnd("2026-03-01", null)).toBeNull();
    expect(validUntilFor("30d", { todayIso: "2026-11-06" })).toBe("2026-12-06");
    expect(validUntilFor("date", { todayIso: "2026-11-06", date: "2027-01-10" })).toBe("2027-01-10");
  });

  it("lastUsedText: heute, gestern, Wochen, nie", () => {
    expect(lastUsedText("2026-11-06T09:12:00+01:00", "2026-11-06")).toBe("zuletzt heute");
    expect(lastUsedText("2026-11-05T09:12:00+01:00", "2026-11-06")).toBe("zuletzt gestern");
    expect(lastUsedText("2026-10-14T09:12:00+02:00", "2026-11-06")).toBe("zuletzt vor 3 Wochen");
    expect(lastUsedText(null, "2026-11-06")).toBe("noch nie benutzt");
  });

  it("labelError: keine Kontaktdaten", () => {
    expect(labelError("Code A")).toBeNull();
    expect(labelError("  ")).not.toBeNull();
    expect(labelError("max@schule.de")).not.toBeNull();
    expect(labelError("0171 2345678")).not.toBeNull();
  });
});

describe("Klausuren", () => {
  it("Autor gelöscht → unbekannt", () => {
    expect(authorText({ createdBy: null })).toBe("unbekannt");
    expect(authorText({ createdBy: { label: "Code A" } })).toBe("Code A");
  });
});

describe("Einstellungen", () => {
  it("settingsPatch schickt nur Geändertes", () => {
    const before = { plan: { pollMinutes: 5, onlySchoolDays: true }, subjects: { names: { TW: "Technik" } } };
    const after = { plan: { pollMinutes: 10, onlySchoolDays: true }, subjects: { names: { TW: "Technik" } } };
    expect(settingsPatch(before, after)).toEqual({ plan: { pollMinutes: 10 } });
  });

  it("withCurrent ergänzt einen unbekannten Wert", () => {
    const options = [{ value: 5, label: "5 min" }];
    expect(withCurrent(options, 5)).toBe(options);
    expect(withCurrent(options, 7)).toHaveLength(2);
  });
});

describe("Kurse und Fächer", () => {
  const course = (nr, label, extra = {}) => ({ nr, label, group: null, parallel: false, parallelWith: null, automatic: false, forced: false, ...extra });
  const courses = [
    course("131", "Ma"),
    course("150", "Bi", { forced: true }),
    course("141", "SpJu", { group: "SpJu", automatic: true }),
    course("160", "Ku", { parallel: true, parallelWith: "Mu", automatic: true }),
    course("167", "Fr", { parallel: true, automatic: true }),
  ];

  it("courseState: Pflicht, Wahl vom Admin, Gruppe, parallel", () => {
    expect(courseState(courses[0])).toBe("pflicht");
    expect(courseState(courses[1])).toBe("wahl");
    expect(courseState(courses[2])).toEqual({ locked: "Gruppe SpJu" });
    expect(courseState(courses[3])).toEqual({ locked: "parallel zu Mu" });
    expect(courseState(courses[4])).toEqual({ locked: "läuft parallel" });
  });

  it("optionalPatch: Pflicht entfernt nr und Label, Wahl fügt nr hinzu, Fremdes bleibt", () => {
    const states = { 131: "wahl", 150: "pflicht" };
    expect(optionalPatch(["Bi", "150", "999"], courses, states)).toEqual(["999", "131"]);
    expect(optionalPatch(["Ma"], courses, { 131: "wahl" })).toEqual(["Ma"]);
  });

  it("subjectNamesPatch: ändern, leeren, Standardname, unverändert", () => {
    const subjects = [
      { code: "Ma", defaultName: "Mathe", name: null },
      { code: "TW", defaultName: null, name: "Technik" },
      { code: "Ku", defaultName: "Kunst", name: "Kunst & Musik" },
      { code: "SF", defaultName: null, name: null },
    ];
    const names = { TW: "Technik", Ku: "Kunst & Musik", Alt: "bleibt" };
    const edited = { Ma: "Mathematik", TW: "", Ku: "Kunst", SF: " Seminarfach " };
    expect(subjectNamesPatch(names, subjects, edited)).toEqual({ Alt: "bleibt", Ma: "Mathematik", SF: "Seminarfach" });
    expect(subjectNamesPatch(names, subjects, {})).toEqual(names);
    expect(shownName(subjects[3])).toBe("");
  });
});
