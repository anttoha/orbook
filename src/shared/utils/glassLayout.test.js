import { describe, expect, it } from "vitest";
import { layoutOnly } from "./glassLayout";

describe("layoutOnly", () => {
  it("оставляет только раскладку, цвет и высоту выбрасывает", () => {
    expect(layoutOnly("ml-0.5 flex h-12 items-center rounded-full bg-accent px-5 text-on-accent w-full lg:hidden")).toBe("ml-0.5 w-full lg:hidden");
  });
  it("пустой className", () => {
    expect(layoutOnly(undefined)).toBe("");
  });
});
