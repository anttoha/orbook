import { describe, expect, it } from "vitest";
import { bubblePlace, spotRect, stepDone, TOUR_STEPS } from "./tour";

const phone = { width: 390, height: 844 };
const pc = { width: 1440, height: 900 };
const bubble = { w: 354, h: 124 };

describe("TOUR_STEPS", () => {
  it("у каждого шага есть метка, заголовок, текст и вид", () => {
    for (const step of TOUR_STEPS) {
      expect(step.target.length).toBeGreaterThan(0);
      expect(step.title && step.text).toBeTruthy();
      expect(["weiter", "tippen", "probieren"]).toContain(step.mode);
      if (step.mode === "tippen") expect(typeof step.done).toBe("function");
    }
  });
});

describe("spotRect", () => {
  it("добавляет отступ и не вылезает за экран", () => {
    expect(spotRect({ left: 18, top: 86, width: 354, height: 258 }, phone)).toEqual({ x: 12, y: 80, w: 366, h: 270 });
    expect(spotRect({ left: 0, top: 800, width: 390, height: 60 }, phone)).toEqual({ x: 8, y: 794, w: 374, h: 42 });
  });
  it("нет элемента — нет прожектора", () => expect(spotRect(null, phone)).toBeNull());
});

describe("bubblePlace", () => {
  it("элемент сверху — пузырь под ним, хвостик вверх", () => {
    const p = bubblePlace({ x: 12, y: 80, w: 366, h: 270 }, bubble, phone);
    expect(p.side).toBe("top");
    expect(p.y).toBe(80 + 270 + 14);
    expect(p.x).toBe(18);
  });
  it("вкладка внизу — пузырь над ней", () => {
    const p = bubblePlace({ x: 133, y: 767, w: 81, h: 52 }, bubble, phone);
    expect(p.side).toBe("bottom");
    expect(p.y + bubble.h).toBe(767 - 14);
    expect(p.arrow).toBeCloseTo(173.5 - p.x);
  });
  it("ПК, боковое меню — пузырь справа", () => {
    const p = bubblePlace({ x: 26, y: 186, w: 212, h: 50 }, { w: 360, h: 124 }, pc);
    expect(p.side).toBe("left");
    expect(p.x).toBe(26 + 212 + 14);
  });
  it("без прожектора — по центру", () => {
    const p = bubblePlace(null, bubble, phone);
    expect(p.side).toBeNull();
    expect(p.x).toBe(18);
  });
});

describe("stepDone", () => {
  const byId = (id) => TOUR_STEPS.find((s) => s.id === id);
  it("шаг-действие готов на нужной странице", () => {
    expect(stepDone(byId("woche"), "/woche")).toBe(true);
    expect(stepDone(byId("woche"), "/start")).toBe(false);
    expect(stepDone(byId("heute"), "/tag/2026-09-17")).toBe(true);
    expect(stepDone(byId("darstellung"), "/mehr/darstellung")).toBe(true);
  });
  it("обычный шаг адресом не закрывается", () => expect(stepDone(byId("fuer"), "/woche")).toBe(false));
  it("нет шага — false", () => expect(stepDone(undefined, "/woche")).toBe(false));
});
