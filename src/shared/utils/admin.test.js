import { describe, expect, it } from "vitest";
import {
  ago,
  authorText,
  berlinToday,
  classPasswordText,
  codeChip,
  courseState,
  editableRights,
  entriesCount,
  errorHours,
  eventTime,
  hasRight,
  isTeacherCode,
  labelError,
  lastUsedText,
  courseCaption,
  coursesPatch,
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

  it("courseState: Ergebnis vom Server (optional)", () => {
    expect(courseState({ ...courses[0], optional: false })).toBe("pflicht");
    expect(courseState({ ...courses[2], optional: true })).toBe("wahl");
    expect(courseState(courses[1])).toBe("wahl"); // alter Server ohne optional: forced
  });

  it("courseCaption: warum automatisch Wahl, Warnung bei parallel + Pflicht", () => {
    expect(courseCaption(courses[0], "pflicht")).toBeNull();
    expect(courseCaption(courses[2], "wahl")).toBe("Automatisch Wahl · Gruppe SpJu");
    expect(courseCaption(courses[3], "wahl")).toBe("Automatisch Wahl · parallel zu Mu");
    expect(courseCaption(courses[3], "pflicht")).toBe("parallel zu Mu · beide Kurse für alle sichtbar");
    expect(courseCaption(courses[4], "wahl")).toBe("Automatisch Wahl · läuft parallel");
  });

  it("coursesPatch: normale Kurse in optional, automatische in required, Fremdes bleibt", () => {
    const states = { 131: "wahl", 150: "pflicht", 141: "pflicht", 160: "wahl", 167: "pflicht" };
    expect(coursesPatch({ optional: ["Bi", "150", "999"], required: ["Ku", "888"] }, courses, states)).toEqual({
      optional: ["999", "131"],
      required: ["888", "141", "167"],
    });
    expect(coursesPatch({ optional: ["Ma"] }, courses, { 131: "wahl" })).toEqual({ optional: ["Ma"] });
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

describe("Lehrer-Codes (Teil 14)", () => {
  it("Rechte-Text", () => {
    expect(rightsText({ create: true, homework: true }, "teacher")).toBe("Klausuren · Hausaufgaben");
    expect(rightsText({ create: true, homework: false }, "teacher")).toBe("Nur Klausuren");
    expect(rightsText({ create: true, homework: true, materials: true }, "teacher")).toBe("Klausuren · Hausaufgaben · Materialien");
    expect(rightsText({ create: false, homework: false, materials: true }, "teacher")).toBe("Nur Materialien");
    expect(rightsText({ create: true, editOwn: true, materials: true })).toBe("Eintragen · eigene bearbeiten · Materialien");
    expect(rightsText({ materials: true })).toBe("Materialien");
    expect(hasRight({ materials: true })).toBe(true);
    expect(rightsText({ create: true, editOwn: true, homework: true })).toBe("Eintragen · eigene bearbeiten · Hausaufgaben");
    expect(rightsText({ homework: true })).toBe("Hausaufgaben");
  });
  it("Hausaufgaben zählen als Recht", () => expect(hasRight({ homework: true })).toBe(true));
  it("Einträge und änderbare Rechte", () => {
    expect(entriesCount({ examCount: 2, homeworkCount: 4 })).toBe(6);
    expect(entriesCount({ examCount: 2 })).toBe(2);
    expect(isTeacherCode({ kind: "teacher" })).toBe(true);
    expect(editableRights({ kind: "teacher" }, { create: true, editOwn: true, homework: false })).toEqual({ create: true, homework: false, materials: false }); // materials — третє право вчителя (частина 15)
  });
});
