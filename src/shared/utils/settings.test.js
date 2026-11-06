import { describe, expect, it } from "vitest";
import { appearanceHint, coursesHint, editorHint, subjectsHint, syncHint } from "./settings";

describe("Einstellungen · Übersicht hints", () => {
  it("courses", () => {
    expect(coursesHint({ on: 7, all: 8 })).toBe("7 von 8 Kursen");
    expect(coursesHint({ on: 0, all: 0 })).toBeNull();
  });

  it("appearance", () => {
    expect(appearanceHint("light", "woche")).toBe("Hell · Start mit Woche");
    expect(appearanceHint("dark", "heute")).toBe("Dunkel · Start mit Heute");
    expect(appearanceHint(undefined, undefined)).toBe("System · Start mit Woche");
  });

  it("subjects", () => {
    expect(subjectsHint(8)).toBe("8 Fächer");
    expect(subjectsHint(1)).toBe("1 Fach");
    expect(subjectsHint(0)).toBeNull();
  });

  it("sync: off, never synced, today, earlier, broken date", () => {
    const now = new Date(2026, 10, 6, 12, 0);
    expect(syncHint(null, null, now)).toBe("Aus");
    expect(syncHint("K7QM-4TXP-R2", null, now)).toBe("K7QM-…");
    expect(syncHint("K7QM-4TXP-R2", new Date(2026, 10, 6, 7, 40).toISOString(), now)).toBe("K7QM-… · heute 07:40");
    expect(syncHint("K7QM-4TXP-R2", new Date(2026, 10, 4, 9, 0).toISOString(), now)).toBe("K7QM-… · 4.11.");
    expect(syncHint("K7QM-4TXP-R2", "kaputt", now)).toBe("K7QM-…");
  });

  it("editor: label may be null", () => {
    expect(editorHint(null)).toBe("nicht freigeschaltet");
    expect(editorHint({ label: "Code A" })).toBe("Code A");
    expect(editorHint({ label: null })).toBe("freigeschaltet");
  });
});
