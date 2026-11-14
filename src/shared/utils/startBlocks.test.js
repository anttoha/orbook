import { describe, expect, it } from "vitest";
import { addBlock, blocksOf, defaultBlocks, isBlockEnabled, moveBlock, nextSize, removeBlock, resizeBlock, setBlockOpt, blockInfo } from "./startBlocks";

describe("startBlocks", () => {
  it("раскладка по умолчанию — шесть блоков из spec", () => {
    expect(defaultBlocks().map((b) => b.kind)).toEqual(["jetzt", "tests", "aufgaben", "woche", "aenderungen", "notizen"]);
    expect(defaultBlocks().find((b) => b.kind === "tests").opts).toEqual({ count: 2, mine: true });
  });

  it("ничего не сохранено → по умолчанию; пустой список остаётся пустым", () => {
    expect(blocksOf(null)).toEqual(defaultBlocks());
    expect(blocksOf(undefined)).toEqual(defaultBlocks());
    expect(blocksOf([])).toEqual([]);
  });

  it("отбрасывает незнакомые виды, повторы и недопустимый размер", () => {
    const saved = [{ kind: "wetter", size: "klein" }, { kind: "woche", size: "klein" }, { kind: "woche", size: "gross" }, null, { kind: "tests", size: "breit", opts: { count: 5 } }];
    expect(blocksOf(saved)).toEqual([
      { id: "woche", kind: "woche", size: "gross", opts: {} },
      { id: "tests", kind: "tests", size: "breit", opts: { count: 5, mine: true } },
    ]);
  });

  it("добавить / убрать", () => {
    const blocks = addBlock([], "termine");
    expect(blocks).toEqual([{ id: "termine", kind: "termine", size: "klein", opts: { count: 2 } }]);
    expect(addBlock(blocks, "termine")).toBe(blocks); // второй раз не добавляется
    expect(addBlock(blocks, "wetter")).toBe(blocks);
    expect(removeBlock(blocks, "termine")).toEqual([]);
  });

  it("переставить на место другого блока", () => {
    const kinds = (list) => list.map((b) => b.kind);
    const blocks = defaultBlocks();
    expect(kinds(moveBlock(blocks, "notizen", "jetzt"))).toEqual(["notizen", "jetzt", "tests", "aufgaben", "woche", "aenderungen"]);
    expect(kinds(moveBlock(blocks, "jetzt", "aufgaben"))).toEqual(["tests", "aufgaben", "jetzt", "woche", "aenderungen", "notizen"]);
    expect(moveBlock(blocks, "jetzt", "nichts")).toBe(blocks);
  });

  it("размер: только допустимый, стрелки — по кругу", () => {
    const blocks = defaultBlocks();
    expect(resizeBlock(blocks, "tests", "gross").find((b) => b.id === "tests").size).toBe("gross");
    expect(resizeBlock(blocks, "woche", "klein").find((b) => b.id === "woche").size).toBe("gross");
    expect(nextSize({ kind: "tests", size: "klein" })).toBe("breit");
    expect(nextSize({ kind: "tests", size: "gross" })).toBe("klein");
    expect(nextSize({ kind: "jetzt", size: "breit" })).toBe("breit");
  });

  it("настройка блока", () => {
    const blocks = setBlockOpt(defaultBlocks(), "tests", "count", 3);
    expect(blocks.find((b) => b.id === "tests").opts).toEqual({ count: 3, mine: true });
  });

  it("Statistik скрыт, если школа выключила статистику", () => {
    const stats = blockInfo("statistik");
    expect(isBlockEnabled(stats, { statistics: false })).toBe(false);
    expect(isBlockEnabled(stats, undefined)).toBe(true);
    expect(isBlockEnabled(blockInfo("woche"), { statistics: false })).toBe(true);
  });
});
