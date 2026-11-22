import { describe, expect, it } from "vitest";
import { addGroup, addToNav, cleanNav, defaultNav, dissolveGroup, fromContainers, menuStyleOf, moveItem, navChanges, navOf, navTabActive, removeFromNav, restOf, restPaths, toContainers, visibleNav } from "./navLayout";

const leistung = { id: "leistung", name: "Leistung", icon: "award", items: ["tests", "noten"] };

describe("cleanNav", () => {
  it("null и мусор → по умолчанию", () => {
    expect(cleanNav(null)).toEqual(defaultNav("phone"));
    expect(navOf(undefined, "pc")).toEqual(defaultNav("pc"));
    expect(navOf({ phone: "x" }, "phone")).toEqual(defaultNav("phone"));
  });
  it("убирает незнакомые ключи, повторы и лишнее сверх лимита", () => {
    expect(cleanNav(["start", "zauber", "start", "woche", "heute", "tests", "statistik"])).toEqual(["start", "woche", "heute", "tests"]);
  });
  it("группа: без id — пропуск, пустое имя → «Gruppe», чужой значок → первый, повтор раздела убирается", () => {
    expect(cleanNav([{ name: "x", items: [] }])).toEqual([]);
    expect(cleanNav(["tests", { id: "a", name: " ", icon: "rakete", items: ["tests", "heute", 5] }])).toEqual(["tests", { id: "a", name: "Gruppe", icon: "award", items: ["heute"] }]);
  });
  it("menu: Kompakt по умолчанию", () => {
    expect(menuStyleOf(null)).toBe("kompakt");
    expect(menuStyleOf({ menu: "gross" })).toBe("gross");
  });
});

describe("visibleNav", () => {
  it("школа без InfoPoint (features.noten false): в «Leistung» Tests и Aufgaben", () => {
    const nav = visibleNav(defaultNav("phone"), { noten: false });
    expect(nav.map((n) => n.type)).toEqual(["link", "link", "group"]);
    expect(nav[2].tabs.map((t) => t.key)).toEqual(["tests", "aufgaben"]);
  });
  it("с InfoPoint (часть 36b): в «Leistung» Tests, Noten, Aufgaben", () => {
    const nav = visibleNav(defaultNav("phone"), { noten: true });
    expect(nav[2].tabs.map((t) => t.key)).toEqual(["tests", "noten", "aufgaben"]);
  });
  it("группа из одного доступного раздела — обычная вкладка", () => {
    const nav = visibleNav(["start", { ...leistung, items: ["tests", "noten"] }], { noten: false });
    expect(nav[1]).toMatchObject({ type: "link" });
    expect(nav[1].tab.to).toBe("/testen");
  });
  it("группа из двух доступных разделов остаётся группой", () => {
    const nav = visibleNav(["start", { ...leistung, items: ["tests", "statistik"] }], {});
    expect(nav[1]).toMatchObject({ type: "group", name: "Leistung" });
    expect(nav[1].tabs.map((t) => t.key)).toEqual(["tests", "statistik"]);
  });
  it("школа выключила статистику — её нет ни в группе, ни в Mehr", () => {
    const list = ["start", { ...leistung, items: ["tests", "statistik"] }];
    expect(visibleNav(list, { statistics: false })[1].type).toBe("link");
    expect(restOf(["start"], { statistics: false })).not.toContain("statistik");
  });
  it("Woche светится на /heute, только пока Heute нет в панели", () => {
    expect(visibleNav(["woche"], {})[0].tab.activeOn).toContain("/heute");
    expect(visibleNav(["woche", "heute"], {})[0].tab.activeOn).not.toContain("/heute");
  });
});

describe("restOf", () => {
  it("всё доступное, чего нет в панели", () => {
    expect(restOf(defaultNav("phone"), { noten: false })).toEqual(["heute", "termine", "materialien", "statistik", "karteikarten", "lerntimer"]);
    expect(restOf(defaultNav("phone"), { noten: true })).toEqual(["heute", "termine", "fehlzeiten", "materialien", "statistik", "karteikarten", "lerntimer"]);
  });
  it("Fehlzeiten in «Mehr» светит Noten, а не «Mehr»", () => {
    expect(restPaths(defaultNav("phone"), { noten: true })).not.toContain("/fehlzeiten");
  });
});

describe("moveItem", () => {
  const list = ["start", "woche", leistung];
  const c = () => toContainers(list, {});

  it("порядок наверху", () => {
    const { c: next } = moveItem(c(), "g:leistung", "start");
    expect(fromContainers(next, list)).toEqual([leistung, "start", "woche"]);
  });
  it("из «Mehr» в группу", () => {
    const { c: next } = moveItem(c(), "statistik", "noten");
    expect(fromContainers(next, list)[2].items).toEqual(["tests", "statistik", "noten"]);
    expect(next.rest).not.toContain("statistik");
  });
  it("в пустую группу и в конец списка", () => {
    const empty = ["start", { id: "a", name: "A", icon: "star", items: [] }];
    const { c: next } = moveItem(toContainers(empty, {}), "heute", "in:g:a");
    expect(fromContainers(next, empty)[1].items).toEqual(["heute"]);
    expect(moveItem(toContainers(empty, {}), "start", "rest").c.rest.at(-1)).toBe("start");
  });
  it("наверху нет места — «voll»; группу в группу — нельзя; в группе 6 — «gruppe-voll»", () => {
    const full = ["start", "woche", "heute", leistung];
    expect(moveItem(toContainers(full, {}), "statistik", "start").error).toBe("voll");
    expect(moveItem(toContainers(full, {}), "g:leistung", "tests").error).toBe("nein");
    const six = [{ ...leistung, items: ["tests", "heute", "woche", "start", "aufgaben", "termine"] }];
    expect(moveItem(toContainers(six, {}), "statistik", "tests").error).toBe("gruppe-voll");
  });
});

describe("правка", () => {
  it("плюс, минус, новая группа, распустить", () => {
    expect(addToNav(["start"], "heute").list).toEqual(["start", "heute"]);
    expect(addToNav(["a", "b", "c", "d"], "heute").error).toBe("voll");
    expect(removeFromNav(["start", leistung], "tests")).toEqual(["start", { ...leistung, items: ["noten"] }]);
    const { list, id } = addGroup(["start"]);
    expect(list[1]).toMatchObject({ id, items: [] });
    expect(dissolveGroup(["start", leistung], "leistung")).toEqual(["start"]);
  });
});

describe("navTabActive", () => {
  it("Tests светится на всех списках /testen, пока Aufgaben нет в панели", () => {
    const [tests] = visibleNav(["tests"], {}).map((n) => n.tab);
    expect(navTabActive(tests, "/testen", "?liste=hausaufgaben")).toBe(true);
    const [t2, auf] = visibleNav(["tests", "aufgaben"], {}).map((n) => n.tab);
    expect(navTabActive(t2, "/testen", "?liste=hausaufgaben")).toBe(false);
    expect(navTabActive(auf, "/testen", "?liste=hausaufgaben")).toBe(true);
    expect(navTabActive(auf, "/testen/neu", "")).toBe(false);
  });
  it("Mehr светится на разделах из «Mehr»", () => {
    expect(restPaths(defaultNav("phone"), {})).toEqual(["/heute", "/materialien", "/statistik", "/karteikarten", "/lerntimer"]);
  });
});

describe("navChanges (часть 38: что подсветить)", () => {
  const leistung = { id: "leistung", name: "Leistung", icon: "award", items: ["tests", "aufgaben"] };
  const base = ["start", "woche", leistung];

  it("ничего не поменялось — ничего не светится", () => {
    expect(navChanges(base, base)).toEqual([]);
  });
  it("новый раздел внизу", () => {
    expect(navChanges(base, [...base, "statistik"])).toEqual(["statistik"]);
  });
  it("убрали раздел — светится «Mehr», соседи не светятся", () => {
    expect(navChanges(base, ["start", leistung])).toEqual(["mehr"]);
  });
  it("сдвинули один раздел — светится только он", () => {
    expect(navChanges(["start", "woche", "heute", "materialien"], ["start", "heute", "materialien", "woche"])).toEqual(["woche"]);
  });
  it("в группе другое содержимое — светится группа", () => {
    const more = { ...leistung, items: ["tests", "aufgaben", "termine"] };
    expect(navChanges(base, ["start", "woche", more])).toEqual(["leistung"]);
  });
  it("из группы ушёл раздел в «Mehr» — группа и «Mehr»", () => {
    const less = { ...leistung, items: ["tests", "aufgaben", "termine"] };
    expect(navChanges(["start", less], ["start", leistung])).toEqual(["leistung", "mehr"]);
  });
  it("новое имя группы — светится группа", () => {
    expect(navChanges(base, ["start", "woche", { ...leistung, name: "Schule" }])).toEqual(["leistung"]);
  });
  it("невидимый раздел (школа выключила) не светится", () => {
    expect(navChanges(base, [...base, "statistik"], { statistics: false })).toEqual([]);
  });
});
