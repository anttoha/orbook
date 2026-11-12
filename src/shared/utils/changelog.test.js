import { describe, expect, it } from "vitest";
import { changelog } from "../changelog";
import { changeCount, entryHint, groupsOf, hasNews, newsDate, newsDateLong, shouldAutoShow } from "./changelog";

const entries = [{ version: "0.9.0", date: "2026-12-01", neu: ["a", "b"] }, { version: "0.8.0", date: "2026-11-01", behoben: ["c"] }];

describe("Neuigkeiten", () => {
  it("shows only non-empty groups, in a fixed order", () => {
    const entry = { entfernt: ["x"], neu: ["a"], behoben: [] };
    expect(groupsOf(entry).map((g) => g.key)).toEqual(["neu", "entfernt"]);
    expect(groupsOf(undefined)).toEqual([]);
  });

  it("counts changes and writes the hint", () => {
    expect(changeCount(entries[0])).toBe(2);
    expect(entryHint(entries[0])).toBe("1. Dezember 2026 · 2 Änderungen");
    expect(entryHint(entries[1])).toBe("1. November 2026 · 1 Änderung");
  });

  it("formats dates in German", () => {
    expect(newsDate("2026-11-12")).toBe("12. November");
    expect(newsDateLong("2026-11-12")).toBe("12. November 2026");
  });

  it("knows if there is something new", () => {
    expect(hasNews(null, entries)).toBe(true);
    expect(hasNews("0.8.0", entries)).toBe(true);
    expect(hasNews("0.9.0", entries)).toBe(false);
    expect(hasNews(null, [])).toBe(false);
  });

  it("opens the window by itself only for people who already use the app", () => {
    expect(shouldAutoShow({ seen: null, entries, isNewUser: false })).toBe(true);
    expect(shouldAutoShow({ seen: null, entries, isNewUser: true })).toBe(false);
    expect(shouldAutoShow({ seen: "0.9.0", entries, isNewUser: false })).toBe(false);
  });
});

describe("changelog file", () => {
  it("has the newest version first, with a date and at least one change each", () => {
    const dates = changelog.map((e) => e.date);
    expect(dates).toEqual([...dates].sort().reverse());
    for (const entry of changelog) {
      expect(entry.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(changeCount(entry)).toBeGreaterThan(0);
    }
  });

  it("has unique versions", () => {
    expect(new Set(changelog.map((e) => e.version)).size).toBe(changelog.length);
  });
});
