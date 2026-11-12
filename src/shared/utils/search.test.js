import { describe, expect, it } from "vitest";
import { queryWords, searchActions, searchGroups } from "./search";

const lesson = (period, code, name, over = {}) => ({ period, status: "normal", subject: { code, name }, teacher: "Mü", room: "108", course: { nr: `1${period}`, label: code }, ...over });
const days = [
  { date: "2025-09-15", lessons: [lesson(2, "Ma", "Mathe")] },
  { date: "2025-09-17", lessons: [lesson(2, "Ma", "Mathe", { status: "substitution", teacher: "Kle", room: "204" }), lesson(3, "En", "Englisch"), lesson(4, null, null, { subject: null })] },
];
const exams = [{ id: 7, type: "Test", subject: { code: "Ma", name: "Mathe" }, lesson: 1, topic: "Quadratische Funktionen", date: "2025-09-19", daysLeft: 2 }];
const notes = [{ id: "a", text: "Mathe-Heft mitbringen\nund Lineal", date: "2025-09-18", period: null }, { id: "b", text: "weg", date: "2025-09-18", deleted: true }];
const sections = [{ to: "/mehr/fachfarben", label: "Fachfarben" }];

describe("searchGroups", () => {
  it("порожній запит — нічого", () => {
    expect(searchGroups("  ", { days, exams })).toEqual([]);
    expect(queryWords(" Mathe  mi ")).toEqual(["mathe", "mi"]);
  });

  it("групи як на макеті 51", () => {
    const groups = searchGroups("Mathe", { days, exams, notes, sections });
    expect(groups.map((g) => g.title)).toEqual(["Stunden", "Tests", "Notizen"]);
    expect(groups[0].items[1]).toMatchObject({ title: "Mathe · Mi, 2. Stunde", subtitle: "Vertretung · Kle · Raum 204" });
    expect(groups[1].items[0]).toMatchObject({ title: "Test Mathe · Fr 19.09.", subtitle: "Quadratische Funktionen · in 2 Tagen", target: { sheet: "klausur", params: { id: 7 } } });
    expect(groups[2].items[0].title).toBe("Mathe-Heft mitbringen");
  });

  it("кілька слів звужують; день тижня теж шукається", () => {
    expect(searchGroups("mathe mittwoch", { days })[0].items).toHaveLength(1);
  });

  it("урок без предмета і видалені нотатки не ламають пошук", () => {
    expect(searchGroups("ohne fach", { days })[0].items[0].title).toBe("Ohne Fach · Mi, 4. Stunde");
    expect(searchGroups("weg", { notes })).toEqual([]);
  });

  it("розділи налаштувань ведуть на сторінку", () => {
    expect(searchGroups("farben", { sections })[0]).toMatchObject({ title: "Einstellungen", items: [{ target: { path: "/mehr/fachfarben" } }] });
  });
});

describe("searchActions", () => {
  it("підписи залежать від прав і теми", () => {
    const light = searchActions({ canCreate: false, today: "2025-09-17", dark: false }).items;
    expect(light.map((a) => a.title)).toEqual(["Test eintragen", "Zu heute springen", "Dunkles Design"]);
    expect(light[0].subtitle).toBe("braucht Editor-Code");
    expect(light[1].subtitle).toBe("Mittwoch, 17. September");
    expect(searchActions({ canCreate: true, today: "2025-09-17", dark: true }).items[2].title).toBe("Helles Design");
  });
});
