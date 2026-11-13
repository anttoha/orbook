import { beforeEach, describe, expect, it, vi } from "vitest";

// Ответ сервера задаём сами: первый запрос «висит», пока не отпустим
const pending = [];
vi.mock("../api/offlineCache", () => ({
  loadWithCache: () => new Promise((resolve) => pending.push(resolve)),
}));
vi.mock("../api/api", () => ({ api: vi.fn() }));

const { useMaterials } = await import("./materialsStore");

describe("materialsStore: смена класса", () => {
  beforeEach(() => {
    pending.length = 0;
    useMaterials.getState().reset();
  });

  it("ответ прошлого класса не попадает в новый класс", async () => {
    const old = useMaterials.getState().load(); // запрос класса 8a
    useMaterials.getState().reset(); // переключились на 07B
    const fresh = useMaterials.getState().load(); // запрос 07B — новый, а не старый промис
    expect(pending).toHaveLength(2);
    pending[1]({ data: { materials: [{ id: 2, title: "07B" }] }, status: "ready" });
    await fresh;
    pending[0]({ data: { materials: [{ id: 1, title: "8a" }] }, status: "ready" }); // старый ответ пришёл позже
    await old;
    expect(useMaterials.getState().items.map((m) => m.title)).toEqual(["07B"]);
  });
});
