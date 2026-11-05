import { describe, expect, it } from "vitest";
import { swipeDirection } from "./swipe";

describe("swipeDirection", () => {
  it("влево и вправо", () => {
    expect(swipeDirection(-100, 10)).toBe("left");
    expect(swipeDirection(100, -10)).toBe("right");
  });

  it("короткий рух и прокрутка не считаются", () => {
    expect(swipeDirection(30, 0)).toBeNull();
    expect(swipeDirection(80, 200)).toBeNull();
  });
});
