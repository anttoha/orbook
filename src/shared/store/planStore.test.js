import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePlanStore } from "./planStore";
import { useClasses } from "./classesStore";
import { cache } from "../api/offlineCache";

// ─────────────────────────────────────────────────────────────
// Часть 47: переключили класс A → B → C, а ответы для B пришли позже. Они не должны ничего менять.
// Сервер здесь отвечает только по команде теста — так задаётся порядок ответов.
// ─────────────────────────────────────────────────────────────
const CLASSES = [1, 2, 3].map((id) => ({ id, name: `${id}a`, school: "S", role: "student", label: "", color: null }));

let waiting; // [{ path, classId, answer(body, status) }]
const fetch = vi.fn(
  (url, { headers }) =>
    new Promise((resolve) => {
      const answer = (body, status = 200) => resolve({ ok: status < 300, status, headers: new Headers(), json: async () => body });
      waiting.push({ path: url.replace("/api", ""), classId: Number(headers["X-ORBook-Class"]), answer });
    }),
);

const take = async (path, classId) => {
  const match = () => waiting.find((r) => r.path === path && r.classId === classId);
  await vi.waitFor(() => expect(match()).toBeDefined());
  const request = match();
  waiting.splice(waiting.indexOf(request), 1);
  return request;
};
const me = (id) => ({ authenticated: true, class: CLASSES[id - 1], classes: CLASSES });
const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

// В Node нет localStorage — простой подставной
const memory = new Map();
vi.stubGlobal("localStorage", {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: (key) => memory.delete(key),
  key: (i) => [...memory.keys()][i] ?? null,
  get length() {
    return memory.size;
  },
});

describe("planStore: поздние ответы старого класса", () => {
  beforeEach(() => {
    waiting = [];
    vi.stubGlobal("fetch", fetch);
    memory.clear();
    useClasses.setState({ list: CLASSES, activeId: 1, homeId: 1 });
    usePlanStore.setState({ me: me(1), pastExams: { status: "idle", exams: [], savedAt: null, error: null }, startError: null });
  });

  it("ответ /auth/me для B не открывает B снова", async () => {
    const toB = usePlanStore.getState().switchClass(2);
    const meB = await take("/auth/me", 2);
    const toC = usePlanStore.getState().switchClass(3);
    const meC = await take("/auth/me", 3);
    meC.answer(me(3));
    await toC;
    meB.answer(me(2));
    await toB;
    await settle();
    expect(useClasses.getState().activeId).toBe(3);
    expect(usePlanStore.getState().me.class.id).toBe(3);
    expect(waiting.every((r) => r.classId === 3)).toBe(true); // для B больше ничего не спрашиваем
  });

  it("прошлые тесты B не попадают в C, и запрос C не блокируется", async () => {
    useClasses.setState({ activeId: 2 });
    const old = usePlanStore.getState().loadPastExams();
    const examsB = await take("/exams?past=true", 2);
    usePlanStore.getState().switchClass(3);
    const fresh = usePlanStore.getState().loadPastExams();
    const examsC = await take("/exams?past=true", 3);
    examsB.answer({ exams: [{ id: 2 }] });
    await old;
    expect(usePlanStore.getState().pastExams).toMatchObject({ status: "loading", exams: [] });
    examsC.answer({ exams: [{ id: 3 }] });
    await fresh;
    expect(usePlanStore.getState().pastExams.exams).toEqual([{ id: 3 }]);
  });

  it("поздняя ошибка старого класса не показывается", async () => {
    useClasses.setState({ activeId: 2 });
    const old = usePlanStore.getState().loadExams();
    const examsB = await take("/exams", 2);
    usePlanStore.getState().switchClass(3);
    examsB.answer({ error: { code: "internal" } }, 500);
    await old;
    expect(usePlanStore.getState().examsState.status).not.toBe("error");
  });

  it("ответ после выхода не ложится в офлайн-копию", async () => {
    const loading = usePlanStore.getState().loadCourses();
    const courses = await take("/courses", 1);
    cache.clearAll(); // «Klasse verlassen»
    courses.answer({ courses: [] });
    await loading;
    expect(cache.load("courses", 1)).toBeNull();
  });
});
