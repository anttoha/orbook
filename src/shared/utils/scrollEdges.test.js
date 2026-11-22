import { describe, expect, it } from "vitest";
import { fadeClass, scrollEdges } from "./scrollEdges";

describe("scrollEdges", () => {
  it("помещается — краёв нет", () => expect(scrollEdges({ scrollTop: 0, clientHeight: 500, scrollHeight: 500 })).toEqual({ top: false, bottom: false }));
  it("в начале длинного списка — только снизу", () => expect(scrollEdges({ scrollTop: 0, clientHeight: 400, scrollHeight: 600 })).toEqual({ top: false, bottom: true }));
  it("в середине — с обеих сторон, в конце — только сверху", () => {
    expect(scrollEdges({ scrollTop: 100, clientHeight: 400, scrollHeight: 600 })).toEqual({ top: true, bottom: true });
    expect(scrollEdges({ scrollTop: 199.6, clientHeight: 400, scrollHeight: 600 })).toEqual({ top: true, bottom: false });
  });
});

describe("fadeClass", () => {
  it("класс по краям", () => {
    expect(fadeClass({ top: false, bottom: true })).toBe("fade-bottom");
    expect(fadeClass({ top: true, bottom: true })).toBe("fade-y");
    expect(fadeClass({ top: true, bottom: false })).toBe("fade-top");
    expect(fadeClass({ top: false, bottom: false })).toBe("");
  });
});
