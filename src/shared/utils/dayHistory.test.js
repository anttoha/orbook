import { describe, expect, it } from "vitest";
import { changedSince, versionNote, dayHistory, differenceText, firstVersionText, versionChanges, versionLabel } from "./dayHistory";

const lesson = (over) => ({ period: 1, status: "normal", subject: { code: "Ma", name: "Mathe" }, teacher: "Mü", room: "108", course: { nr: "131", label: "Ma" }, info: null, ...over });
const en = (over) => lesson({ period: 3, subject: { code: "En", name: "Englisch" }, teacher: "Sch", room: "210", course: { nr: "133", label: "En" }, ...over });
const version = (id, lessons, info = []) => ({ id, fetchedAt: "2026-09-17T07:12:00+02:00", lessons, info });

describe("versionChanges", () => {
  it("замена учителя и кабинета — одной строкой", () => {
    const { items } = versionChanges(version(2, [lesson({ status: "substitution", teacher: "Kle", room: "204" })]), version(1, [lesson()]));
    expect(items).toEqual([expect.objectContaining({ title: "1. Std · Mathe", kind: "vertretung", text: "Kle statt Mü · Raum 204 statt 108" })]);
  });

  it("урок выпал — текст школы или «fällt aus»", () => {
    const cancelled = en({ status: "cancelled", teacher: null, room: null, info: "Lehrer krank" });
    expect(versionChanges(version(2, [cancelled]), version(1, [en()])).items[0]).toMatchObject({ kind: "aus", text: "Lehrer krank" });
    expect(differenceText(en({ status: "cancelled" }))).toBe("fällt aus");
  });

  it("новый и пропавший урок", () => {
    const { items } = versionChanges(version(2, [lesson(), en({ status: "added" })]), version(1, [lesson(), lesson({ period: 6, course: { nr: "140", label: "Sp" } })]));
    expect(items.map((i) => [i.period, i.kind])).toEqual([[3, "neu"], [6, "weg"]]);
  });

  it("без изменений — пусто; Info zum Tag — отдельный флаг", () => {
    const result = versionChanges(version(2, [lesson()], ["Neu"]), version(1, [lesson()], []));
    expect(result.items).toEqual([]);
    expect(result.infoChanged).toBe(true);
  });

  it("чужие курсы не показываем, но считаем", () => {
    const visible = (l) => l.course?.nr !== "133";
    const result = versionChanges(version(2, [en({ status: "cancelled" })]), version(1, [en()]), visible);
    expect(result).toMatchObject({ items: [], hidden: 1 });
  });

  it("поля null: нет предмета, учителя, кабинета, курса", () => {
    const bare = { period: 7, status: "substitution", subject: null, teacher: null, room: null, course: null, info: null };
    const { items } = versionChanges(version(2, [bare]), version(1, []));
    expect(items[0]).toMatchObject({ title: "7. Std · Ohne Fach", code: null, kind: "neu" });
    expect(differenceText(bare, { ...bare, room: "305" })).toBe("Raum ? statt 305");
  });
});

describe("firstVersionText", () => {
  it("всё нормально / с отменами", () => {
    expect(firstVersionText(version(1, [lesson(), en()]))).toBe("Veröffentlicht · 2 Stunden, alles normal");
    expect(firstVersionText(version(1, [lesson(), en({ status: "cancelled" })]))).toBe("Veröffentlicht · 2 Stunden · 1 fällt aus");
    expect(firstVersionText(null)).toBe("Veröffentlicht · 0 Stunden, alles normal");
  });
});

describe("versionLabel", () => {
  it("heute, gestern, на этой неделе, раньше", () => {
    expect(versionLabel("2026-09-17T07:12:00+02:00", "2026-09-17")).toBe("Heute 07:12");
    expect(versionLabel("2026-09-16T15:15:00+02:00", "2026-09-17")).toBe("Gestern 15:15");
    expect(versionLabel("2026-09-14T14:02:00+02:00", "2026-09-17")).toBe("Mo 14:02");
    expect(versionLabel("2026-09-03T09:00:00+02:00", "2026-09-17")).toBe("Do 3.9. 09:00");
    expect(versionLabel(null, "2026-09-17")).toBe("—");
  });
});

describe("dayHistory", () => {
  it("новые сверху, у последней — итог публикации", () => {
    const list = dayHistory([version(3, [en({ status: "cancelled" })]), version(2, [en({ room: "301" })]), version(1, [en()])]);
    expect(list.map((v) => [v.id, v.current, v.first])).toEqual([[3, true, false], [2, false, false], [1, false, true]]);
    expect(list[1].changes.items[0].text).toBe("Raum 301 statt 210");
    expect(list[2].summary).toBe("Veröffentlicht · 1 Stunde, alles normal");
    expect(dayHistory(undefined)).toEqual([]);
  });
});

describe("changedSince", () => {
  it("помечает уроки старой Fassung, которые сейчас другие", () => {
    const marks = changedSince(version(1, [lesson(), en()]), version(2, [lesson(), en({ status: "cancelled" })]));
    expect([...marks.entries()]).toEqual([["3|133", "fällt aus"]]);
  });
});

describe("versionNote", () => {
  it("когда был план и когда он поменялся", () => {
    const old = { fetchedAt: "2026-09-16T15:15:00+02:00" };
    const newer = { fetchedAt: "2026-09-17T07:12:00+02:00" };
    expect(versionNote(old, newer, "2026-09-17")).toBe("So stand der Plan gestern um 15:15. Heute um 07:12 hat er sich geändert.");
    expect(versionNote({ fetchedAt: "2026-09-14T14:02:00+02:00" }, old, "2026-09-17")).toBe("So stand der Plan am Mo um 14:02. Gestern um 15:15 hat er sich geändert.");
    expect(versionNote(old, null, "2026-09-17")).toBe("So stand der Plan gestern um 15:15.");
  });
});
