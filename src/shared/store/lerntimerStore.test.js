import { beforeEach, describe, expect, it } from "vitest";
import { useLerntimerStore } from "./lerntimerStore";
import { DEFAULT_SETTINGS } from "../utils/lerntimer";

const MIN = 60000;
const T0 = new Date(2026, 8, 17, 16, 5).getTime();
const store = () => useLerntimerStore.getState();

describe("lerntimerStore", () => {
  beforeEach(() => useLerntimerStore.setState({ settings: DEFAULT_SETTINGS, sessions: [], run: null, round: 1, done: null, code: "Ma" }));

  it("Runde → «geschafft» → Pause → nächste Runde", () => {
    store().start(T0);
    expect(store().settle(T0 + 10 * MIN)).toBeNull();
    expect(store().settle(T0 + 40 * MIN)).toBe("focus"); // вкладку открыли позже — засчитано ровно 25
    expect(store().done).toEqual({ min: 25, code: "Ma", round: 1 });
    expect(store().sessions).toHaveLength(1);
    store().takeBreak(T0 + 41 * MIN);
    expect(store().run.phase).toBe("pause");
    expect(store().settle(T0 + 46 * MIN)).toBe("pause");
    expect(store().round).toBe(2);
    expect(store().run).toBeNull();
  });

  it("«Pause von selbst starten» — перерыв сразу, с конца раунда", () => {
    useLerntimerStore.setState({ settings: { ...DEFAULT_SETTINGS, autoPause: true } });
    store().start(T0);
    store().settle(T0 + 26 * MIN);
    expect(store().run).toMatchObject({ phase: "pause", startedAt: T0 + 25 * MIN });
  });

  it("«Stopp» засчитывает прошедшие минуты; меньше минуты — нет", () => {
    store().start(T0);
    store().stop(T0 + 7.5 * MIN);
    expect(store().sessions.map((s) => s.min)).toEqual([7]);
    store().start(T0 + 10 * MIN);
    store().stop(T0 + 10 * MIN + 20000);
    expect(store().sessions).toHaveLength(1);
    expect(store().round).toBe(1);
  });

  it("после последнего раунда — длинная пауза, потом снова раунд 1", () => {
    useLerntimerStore.setState({ round: 4 });
    store().start(T0);
    store().settle(T0 + 25 * MIN);
    store().takeBreak(T0 + 25 * MIN);
    expect(store().run.durMs).toBe(15 * MIN);
    store().skipBreak();
    expect(store().round).toBe(1);
  });
});
