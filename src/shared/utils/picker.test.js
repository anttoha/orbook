import { describe, expect, it } from "vitest";
import { courseItems, filterItems, groupItems, mySubjectCodes, normalize, subjectItems, summaryText } from "./picker";

const fr1 = { nr: "145", label: "Fr", group: null, subject: { code: "Fr", name: "Französisch" }, teacher: "T13" };
const fr2 = { ...fr1, nr: "167" };
const ma = { nr: "131", label: "Ma", group: null, subject: { code: "Ma", name: "Mathe" }, teacher: "T03" };
const sp = { nr: "141", label: "SpJu", group: "SpJu", subject: { code: "Sp", name: "Sport" }, teacher: null, optional: true };

describe("normalize / filterItems", () => {
  it("ohne Umlaute und Großbuchstaben", () => {
    expect(normalize("Französisch")).toBe("franzosisch");
    expect(normalize("Straße")).toBe("strasse");
  });
  it("sucht in Titel, Untertitel und Code", () => {
    const items = courseItems([fr1, fr2, ma]);
    expect(filterItems(items, "FRAN").map((i) => i.value)).toEqual(["145", "167"]);
    expect(filterItems(items, "t03").map((i) => i.value)).toEqual(["131"]);
    expect(filterItems(items, "kurs 167").map((i) => i.value)).toEqual(["167"]);
    expect(filterItems(items, "  ")).toHaveLength(3);
  });
});

describe("courseItems", () => {
  it("Vorschlag zuerst, dann alle nach Alphabet; gleiche Kurse unterscheidbar", () => {
    const items = courseItems([fr2, ma, fr1, sp], ["131"]);
    expect(items.map((i) => [i.group, i.title])).toEqual([
      ["Vorschlag · stand hier im Plan", "Mathe"],
      ["Alle Kurse", "Französisch"],
      ["Alle Kurse", "Französisch"],
      ["Alle Kurse", "Sport · SpJu"],
    ]);
    expect(items[1].subtitle).not.toBe(items[2].subtitle);
    expect(items[3].subtitle).toBe("ohne Lehrer · Kurs 141");
  });
});

describe("subjectItems", () => {
  const subjects = [{ code: "Ma", name: "Mathe" }, { code: "TW", name: null }, { code: "De", name: "Deutsch" }];
  it("eigene Fächer zuerst", () => {
    expect(subjectItems(subjects, ["Ma"]).map((i) => [i.group, i.value])).toEqual([
      ["Deine Fächer", "Ma"],
      ["Alle Fächer", "De"],
      ["Alle Fächer", "TW"],
    ]);
  });
  it("ohne eigene oder alle eigene — keine Gruppen; Name fehlt → Code", () => {
    const items = subjectItems(subjects);
    expect(items.every((i) => !i.group)).toBe(true);
    expect(items.find((i) => i.value === "TW")).toMatchObject({ title: "TW", subtitle: null });
  });
  it("zweite Zeile: Lehrer der Kurse dieses Fachs", () => {
    const items = subjectItems([{ code: "Fr", name: "Französisch" }], [], [fr1, { ...fr2, teacher: "T18" }]);
    expect(items[0].subtitle).toBe("T13, T18");
  });
});

describe("groupItems / mySubjectCodes / summaryText", () => {
  it("Gruppen in Reihenfolge", () => {
    expect(groupItems([{ value: 1, group: "A" }, { value: 2, group: "B" }, { value: 3, group: "A" }]).map((g) => [g.group, g.items.length])).toEqual([
      ["A", 2],
      ["B", 1],
    ]);
  });
  it("Wahlkurse nur, wenn gewählt", () => {
    expect(mySubjectCodes([ma, sp], [])).toEqual(["Ma"]);
    expect(mySubjectCodes([ma, sp], ["141"])).toEqual(["Ma", "Sp"]);
  });
  it("summaryText", () => {
    const items = subjectItems([{ code: "Ma", name: "Mathe" }, { code: "De", name: "Deutsch" }, { code: "En", name: "Englisch" }]);
    expect(summaryText(items, ["Ma", "De"])).toBe("Mathe, Deutsch");
    expect(summaryText(items, ["Ma", "De", "En"])).toBe("Mathe, Deutsch +1");
  });
});
