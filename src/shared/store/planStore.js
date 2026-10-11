import { create } from "zustand";
import { toast } from "sonner";
import { api, retryText, setUnauthorizedHandler } from "../api/api";
import { cache, loadWithCache } from "../api/offlineCache";
import { createSchoolClock } from "../utils/lessonClock";

// ─────────────────────────────────────────────────────────────
// planStore — УСІ дані з сервера живуть тут (одне місце, щоб не шукати).
//
//   me       — хто я (GET /api/auth/me): undefined — ще перевіряємо,
//              null — не увійшли (показуємо «Zugang»), об'єкт — увійшли
//   meta     — час уроків, свята, назви предметів, serverTime, demo (GET /api/meta)
//   courses  — курси класу для «Meine Kurse» (GET /api/courses)
//   exams    — найближчі Klausuren (GET /api/exams)
//   status   — стан плану: «Stand 07:12», stale (GET /api/plan/status)
//   weeks    — завантажені тижні: { "2026-10-05": { status, data, savedAt, error } }
//              status: "loading" | "ready" | "offline" | "unavailable" | "error"
//   clock    — годинник школи (поправка з meta.serverTime)
//   now      — поточний час школи (Date), оновлюється раз на хвилину
//
// Компоненти читають так:  const exams = usePlanStore((s) => s.exams);
// Тиждень/день зручніше брати хуками useWeek / useDay (shared/hooks/usePlan.js).
// ─────────────────────────────────────────────────────────────

export const usePlanStore = create((set, get) => ({
  me: undefined,
  startError: null, // помилка при старті (немає мережі й нічого не збережено)
  loginNotice: null, // «Bitte erneut anmelden.» — коли сесія закінчилась
  meta: null,
  courses: [],
  exams: [],
  status: null,
  weeks: {},
  clock: createSchoolClock(null), // поки meta немає — звичайний час пристрою
  now: new Date(), // поточний час школи; оновлює tick() раз на хвилину (HomePage)
  refreshing: false, // іде «Plan neu laden»

  // ── Старт застосунку: хто я? ──
  start: async () => {
    set({ startError: null });
    try {
      // /auth/me відповідає 200 і без входу ({ authenticated: false })
      const { data: me } = await loadWithCache("me", () => api("/auth/me"));
      set({ me: me.authenticated ? me : null });
      if (me.authenticated) get().loadBasics(); // увійшли — вантажимо решту
    } catch (error) {
      set({ startError: error }); // ні мережі, ні збереженого
    }
  },

  // ── Вхід паролем класу. Помилку (ApiError) кидаємо далі — її показує екран входу ──
  login: async (password) => {
    await api("/auth/login", { method: "POST", body: { password } });
    set({ loginNotice: null, weeks: {} });
    await get().start();
  },

  // ── «Klasse verlassen»: вихід на цьому пристрої ──
  logout: async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => {}); // без мережі — виходимо локально
    cache.clearAll(); // кеш відповідей особистий — стираємо
    set({ me: null, meta: null, courses: [], exams: [], status: null, weeks: {} });
  },

  // ── Після входу: паралельно meta, курси, Klausuren, стан плану ──
  loadBasics: async () => {
    // Кожен запит окремо: якщо один упав, інші все одно покажуться
    const load = async (key, path, apply) => {
      try {
        const result = await loadWithCache(key, () => api(path));
        apply(result);
      } catch {
        // помилку окремого запиту не показуємо: екрани мають свої стани
      }
    };
    await Promise.all([
      load("meta", "/meta", ({ data, fromCache }) => {
        // годинник школи — тільки зі свіжої відповіді (у збереженій serverTime застарілий)
        const clock = createSchoolClock(fromCache ? null : data.serverTime);
        set({ meta: data, clock, now: clock.now() });
      }),
      load("courses", "/courses", ({ data }) => set({ courses: data.courses })),
      load("exams", "/exams", ({ data }) => set({ exams: data.exams })),
      load("status", "/plan/status", ({ data }) => set({ status: data })),
    ]);
  },

  // ── Тиждень (Mo–Fr), monday — "2026-10-05". silent: не показувати скелет, якщо дані вже є ──
  loadWeek: async (monday, { silent = false } = {}) => {
    const prev = get().weeks[monday];
    const setWeek = (value) => set((s) => ({ weeks: { ...s.weeks, [monday]: value } }));
    if (!silent || !prev?.data) setWeek({ status: "loading", data: prev?.data ?? null });
    try {
      const result = await loadWithCache(`week:${monday}`, () => api(`/week?date=${monday}`));
      setWeek({ status: result.status, data: result.data, savedAt: result.savedAt, error: result.error ?? null });
    } catch (error) {
      setWeek({ status: "error", data: null, error });
    }
  },

  // Перезавантажити всі тижні, які вже відкривали (після нового плану)
  reloadWeeks: () => Object.keys(get().weeks).forEach((monday) => get().loadWeek(monday, { silent: true })),

  // ── «Plan neu laden»: сервер одразу питає школу (кілька секунд) ──
  refreshPlan: async () => {
    if (get().refreshing) return; // уже йде
    set({ refreshing: true });
    try {
      const result = await api("/plan/refresh", { method: "POST" });
      set({ status: result.status });
      if (!result.refreshed) {
        toast.error("Plan konnte nicht geladen werden", { action: { label: "Nochmal", onClick: () => get().refreshPlan() } });
      } else {
        toast.success(result.changed ? "Plan aktualisiert" : "Plan ist aktuell");
        get().reloadWeeks(); // нові дані тижнів
        get().loadBasics(); // і Klausuren / стан
      }
    } catch (error) {
      // 429 → «Bitte in 2 Minuten erneut versuchen.»; інше — текст сервера
      toast.error(error.code === "rate_limited" ? retryText(error) : error.message);
    } finally {
      set({ refreshing: false });
    }
  },

  // ── Раз на хвилину: оновити «зараз» (лінія часу, «noch 27 min») ──
  tick: () => set({ now: get().clock.now() }),

  // ── Раз на хвилину: чи змінився план? (GET /api/plan/status) ──
  checkStatus: async () => {
    const before = get().status?.lastChangeAt;
    try {
      const status = await api("/plan/status");
      if (!status) return; // 304 — нічого не змінилось
      set({ status });
      if (before && status.lastChangeAt && status.lastChangeAt !== before) {
        // план змінився — пропонуємо подивитись
        toast("Neuer Plan da", { action: { label: "Ansehen", onClick: () => get().reloadWeeks() }, duration: 10000 });
      }
    } catch {
      // немає мережі — спробуємо через хвилину
    }
  },
}));

// Сесія закінчилась (401 на будь-якому запиті) → екран входу з поясненням
setUnauthorizedHandler(() => {
  usePlanStore.setState({ me: null, weeks: {}, loginNotice: "Bitte erneut anmelden." });
});
