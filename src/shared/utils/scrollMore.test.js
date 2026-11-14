import { describe, expect, it } from "vitest";
import { moreBelow, scrollStep } from "./scrollMore";

describe("moreBelow", () => {
  it("хвост больше порога → есть ещё", () => {
    expect(moreBelow({ scrollTop: 0, scrollHeight: 1000, clientHeight: 600 })).toBe(true);
    expect(moreBelow({ scrollTop: 360, scrollHeight: 1000, clientHeight: 600 })).toBe(false); // осталось 40px
    expect(moreBelow({ scrollTop: 0, scrollHeight: 600, clientHeight: 600 })).toBe(false); // ничего не прокручивается
  });
  it("onlyAtTop: начали листать — кнопка уже не нужна", () => {
    expect(moreBelow({ scrollTop: 0, scrollHeight: 2000, clientHeight: 600 }, { onlyAtTop: true })).toBe(true);
    expect(moreBelow({ scrollTop: 200, scrollHeight: 2000, clientHeight: 600 }, { onlyAtTop: true })).toBe(false);
  });
  it("scrollStep — 80 % экрана", () => {
    expect(scrollStep(500)).toBe(400);
  });
});
