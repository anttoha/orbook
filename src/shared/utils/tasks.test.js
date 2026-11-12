import { describe, expect, it } from "vitest";
import { aufgabenList, aufgabenOfDay, dueChoices, editTask, newTask, removeTask, setMark, validateTaskText } from "./tasks";

const now = new Date("2026-09-17T10:00:00Z");
const today = "2026-09-17";
const hw = (id, due, code = "Ma") => ({ id, due, text: `Aufgabe ${id}\nZeile 2`, subject: { code, name: code } });

describe("eigene Aufgaben", () => {
  it("neu, ändern, löschen (Grabstein)", () => {
    const task = newTask({ text: "  Sportsachen  ", due: "2026-09-18" }, now);
    expect(task).toMatchObject({ text: "Sportsachen", due: "2026-09-18", subject: null, done: false });
    expect(task.id.startsWith("t-")).toBe(true);
    expect(editTask(task, { done: true }, new Date("2026-09-18T08:00:00Z"))).toMatchObject({ done: true, updatedAt: "2026-09-18T08:00:00.000Z" });
    expect(removeTask(task, now)).toMatchObject({ deleted: true, text: "" });
  });

  it("Text prüfen", () => {
    expect(validateTaskText("  ")).toBe("Was ist zu tun?");
    expect(validateTaskText("x".repeat(121))).toMatch(/120/);
    expect(validateTaskText("Referat")).toBeNull();
  });

  it("Bis wann: Morgen und der nächste Schultag (Fr nach Do, Mo nach Fr)", () => {
    expect(dueChoices("2026-09-16")).toEqual([{ label: "Morgen", value: "2026-09-17" }, { label: "Fr 18.9.", value: "2026-09-18" }]);
    expect(dueChoices("2026-09-17")[1]).toEqual({ label: "Mo 21.9.", value: "2026-09-21" });
  });
});

describe("Liste", () => {
  it("Hausaufgaben und eigene zusammen, abgehakte unten, ohne Datum am Ende", () => {
    const tasks = [newTask({ text: "Referat-Thema" }, now), { ...newTask({ text: "Sportsachen", due: "2026-09-18" }, now), id: "t-b" }];
    const marks = setMark([], 2, true, now);
    const { groups, done, open } = aufgabenList({ homework: [hw(1, "2026-09-18"), hw(2, "2026-09-19")], tasks, marks, today });
    expect(groups.map((g) => g.title)).toEqual(["Bis morgen", "Ohne Datum"]);
    expect(groups[0].items.map((r) => r.key)).toEqual(["hw-1", "t-b"]);
    expect(groups[0].items[0].text).toBe("Aufgabe 1");
    expect(done.map((r) => r.key)).toEqual(["hw-2"]);
    expect(open).toHaveLength(3);
  });

  it("alte erledigte eigene Aufgaben verschwinden nach 14 Tagen, gelöschte sofort", () => {
    const old = { ...newTask({ text: "alt" }, new Date("2026-08-01T00:00:00Z")), done: true };
    const gone = removeTask(newTask({ text: "weg" }, now), now);
    expect(aufgabenList({ tasks: [old, gone], today }).done).toEqual([]);
  });

  it("Galochka: neuer Stand ersetzt den alten", () => {
    const marks = setMark(setMark([], 5, true, now), 5, false, now);
    expect(marks).toEqual([{ id: "5", done: false, updatedAt: now.toISOString() }]);
  });

  it("ein Tag: Hausaufgaben des Tages und eigene Aufgaben dazu", () => {
    const tasks = [newTask({ text: "Sport", due: "2026-09-18" }, now), newTask({ text: "anders", due: "2026-09-20" }, now)];
    const rows = aufgabenOfDay({ homework: [hw(1, "2026-09-18"), hw(2, "2026-09-19")], tasks, marks: setMark([], 1, true, now), date: "2026-09-18" });
    expect(rows.map((r) => [r.kind, r.done])).toEqual([["homework", true], ["own", false]]);
  });
});
