import { describe, expect, it } from "vitest";
import { countText, moveRow, toPayload, toRows, validateType } from "./examTypes";

const rows = toRows([
  { name: "Klassenarbeit", short: "KA", count: 3 },
  { name: "Test", short: "T", count: null },
]);

describe("Arten von Tests", () => {
  it("Zeilen und PUT-Körper: neue Art ohne was", () => {
    expect(rows[1]).toEqual({ name: "Test", short: "T", count: 0, was: "Test" });
    expect(toPayload([...rows, { name: " Referat ", short: "RF", count: 0, was: null }])).toEqual([
      { name: "Klassenarbeit", short: "KA", was: "Klassenarbeit" },
      { name: "Test", short: "T", was: "Test" },
      { name: "Referat", short: "RF" },
    ]);
    expect(toRows(null)).toEqual([]);
  });

  it("Reihenfolge ändern", () => {
    expect(moveRow(rows, 1, 0).map((r) => r.name)).toEqual(["Test", "Klassenarbeit"]);
    expect(moveRow(rows, 0, 5)).toBe(rows);
  });

  it("prüft Name und Kürzel, die eigene Zeile zählt nicht", () => {
    expect(validateType({ name: "Klassenarbeit", short: "KA" }, rows, 0)).toEqual({});
    expect(validateType({ name: "test", short: "X" }, rows, 0).name).toMatch(/gibt es schon/);
    expect(validateType({ name: "Quiz", short: "t" }, rows, 0).short).toMatch(/gibt es schon/);
    expect(validateType({ name: " ", short: "TOOLONG" }, rows, null)).toEqual({ name: "Bitte einen Namen eintragen.", short: "1 bis 4 Buchstaben oder Ziffern." });
  });

  it("Anzahl", () => {
    expect([countText(0), countText(1), countText(5)]).toEqual(["keine Einträge", "1 Eintrag", "5 Einträge"]);
  });
});
