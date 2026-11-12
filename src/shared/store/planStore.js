import { create } from "zustand";
import { toast } from "sonner";
import { api, retryText, setUnauthorizedHandler } from "../api/api";
import { joinWithInvite } from "../api/invite";
import { signedOutNotice } from "../utils/authErrors";
import { cache, loadWithCache } from "../api/offlineCache";
import { freshenExams, withDaysLeft } from "../utils/exams";
import { daysBetween } from "../utils/format";
import { berlinParts, createSchoolClock } from "../utils/lessonClock";
import { currentMonday } from "../utils/lessons";
import { planChanges } from "../utils/planDiff";
import { useAppointmentStore } from "./appointmentsStore";
import { useMaterials } from "./materialsStore";

// ─────────────────────────────────────────────────────────────
// planStore — УСІ дані з сервера живуть тут (одне місце, щоб не шукати).
//
//   me       — хто я (GET /api/auth/me): undefined — ще перевіряємо,
//              null — не увійшли (показуємо «Zugang»), об'єкт — увійшли
//   meta     — час уроків, свята, назви предметів, serverTime, demo (GET /api/meta)
//              me.editor — Editor-Code цієї сесії або null (права: canCreate, canEditOwn, canEditAll)
//   courses  — курси класу для «Meine Kurse» (GET /api/courses)
//   exams    — найближчі Klausuren (GET /api/exams)
//   examsState — стан цього списку: { status, savedAt, error }, status як у weeks
//   pastExams  — минулі Klausuren: { status, exams, savedAt, error }, вантажаться лише на вимогу
//   homework   — Hausaufgaben з сьогоднішнього терміну (GET /api/homework), homeworkState — як examsState
//   status   — стан плану: «Stand 07:12», stale (GET /api/plan/status или событие «status» потока)
//   live     — часть 26: поток /api/plan/stream: "live" | "connecting" | "off"
//   planStamp — растёт при каждом событии «plan»: «Verlauf des Tages» перечитывает Fassungen
//   weeks    — завантажені тижні: { "2026-10-05": { status, data, savedAt, error } }
//              status: "loading" | "ready" | "offline" | "unavailable" | "error"
//   clock    — годинник школи (поправка з meta.serverTime)
//   now      — поточний час школи (Date), оновлюється раз на хвилину
//   newPlan  — план змінився, учень ще не дивився: { lastChangeAt, changes } або null
//   lastStandShown — школа не відповідає, а учень попросив показати збережений план
//
// Компоненти читають так:  const exams = usePlanStore((s) => s.exams);
// Тиждень/день зручніше брати хуками useWeek / useDay (shared/hooks/usePlan.js).
// ─────────────────────────────────────────────────────────────

let statusRequest = null; // запит /plan/status, що зараз виконується
// Запити Klausuren, що зараз виконуються: екран і старт просять їх одночасно, запит потрібен один
let examsRequest = null;
let pastExamsRequest = null;
let homeworkRequest = null;
// Скільки днів тому збережено відповідь. Обидва моменти — за годинником пристрою
const daysSince = (savedAt) => daysBetween(berlinParts(new Date(savedAt)).date, berlinParts(new Date()).date);
const NO_PAST_EXAMS = { status: "idle", exams: [], savedAt: null, error: null };

// Який lastChangeAt учень уже бачив (між запусками). Сховище може бути заборонене: тоді просто без пам'яті
const SEEN_KEY = "orbook.seenChange";
const seenChange = {
  read() {
    try {
      return localStorage.getItem(SEEN_KEY);
    } catch {
      return null;
    }
  },
  save(value) {
    try {
      if (value) localStorage.setItem(SEEN_KEY, value);
      else localStorage.removeItem(SEEN_KEY);
    } catch {
      // немає сховища — плашка може показатись ще раз, це не страшно
    }
  },
};

// Тижні, які учень бачив останніми: з ними порівнюємо новий план, щоб написати, що змінилось.
// Лежить поза стором: це не показується на екрані
let seenWeeks = {};

export const usePlanStore = create((set, get) => ({
  me: undefined,
  startError: null, // помилка при старті (немає мережі й нічого не збережено)
  loginNotice: null, // { title, text } — плашка «Du wurdest abgemeldet», коли сесію закінчив сервер
  meta: null,
  courses: [],
  coursesStatus: "loading", // "loading" | "ready" | "error": екрану курсів треба відрізняти «ще вантажимо» від «порожньо»
  exams: [],
  examsState: { status: "loading", savedAt: null, error: null },
  pastExams: NO_PAST_EXAMS,
  homework: [],
  homeworkState: { status: "loading", savedAt: null, error: null },
  status: null,
  weeks: {},
  clock: createSchoolClock(null), // поки meta немає — звичайний час пристрою
  now: new Date(), // поточний час школи; оновлює tick() раз на хвилину (HomePage)
  refreshing: false, // іде «Plan neu laden»
  live: "off",
  planStamp: 0,
  newPlan: null,
  lastStandShown: false,

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

  // ── Вхід за посиланням-запрошенням /i/<token> (частина 16): як вхід кодом. Помилку показує JoinPage ──
  join: async (token) => {
    await joinWithInvite(token);
    set({ loginNotice: null, weeks: {} });
    await get().start();
  },

  // ── Вхід учителя Lehrer-Code (без пароля класу). Помилку показує форма ──
  loginTeacher: async (code) => {
    await api("/auth/teacher", { method: "POST", body: { code } });
    set({ loginNotice: null, weeks: {} });
    await get().start();
  },

  // ── «Klasse verlassen»: вихід на цьому пристрої ──
  logout: async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => {}); // без мережі — виходимо локально
    cache.clearAll(); // кеш відповідей особистий — стираємо
    useMaterials.getState().reset();
    useAppointmentStore.getState().reset();
    seenChange.save(null);
    seenWeeks = {};
    set({ live: "off", me: null, meta: null, courses: [], coursesStatus: "loading", exams: [], examsState: { status: "loading", savedAt: null, error: null }, pastExams: NO_PAST_EXAMS, homework: [], homeworkState: { status: "loading", savedAt: null, error: null }, status: null, weeks: {}, newPlan: null, lastStandShown: false });
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
      get().loadCourses(),
      get().loadExams(),
      get().loadHomework(),
      load("status", "/plan/status", ({ data }) => set({ status: data })),
    ]);
    // Після meta: «сьогодні» вже за годинником школи
    get().noticePlanChange(get().status?.lastChangeAt);
  },

  // ── Курси класу. Окремо від loadBasics, щоб кнопка «Erneut versuchen» могла вантажити лише їх ──
  loadCourses: async () => {
    set({ coursesStatus: "loading" });
    try {
      const { data } = await loadWithCache("courses", () => api("/courses"));
      set({ courses: data?.courses ?? [], coursesStatus: "ready" });
    } catch {
      set({ coursesStatus: "error" });
    }
  },

  // ── Найближчі Klausuren. Старий список лишається на екрані, поки йде запит ──
  loadExams: async () => {
    if (examsRequest) return;
    if (get().examsState.status === "error") set({ examsState: { status: "loading", savedAt: null, error: null } });
    try {
      examsRequest = loadWithCache("exams", () => api("/exams"));
      const { data, fromCache, status, savedAt, error } = await examsRequest;
      set({ exams: fromCache ? freshenExams(data.exams, daysSince(savedAt)) : data.exams, examsState: { status, savedAt, error: error ?? null } });
    } catch (error) {
      set({ examsState: { status: "error", savedAt: null, error } });
    } finally {
      examsRequest = null;
    }
  },

  // ── Hausaufgaben: так само, як Klausuren. Прострочені за збереженим списком прибираємо (freshenExams теж рахує daysLeft) ──
  loadHomework: async () => {
    if (homeworkRequest) return;
    if (get().homeworkState.status === "error") set({ homeworkState: { status: "loading", savedAt: null, error: null } });
    try {
      homeworkRequest = loadWithCache("homework", () => api("/homework"));
      const { data, fromCache, status, savedAt, error } = await homeworkRequest;
      const items = data?.homework ?? [];
      set({ homework: fromCache ? freshenExams(items, daysSince(savedAt)) : items, homeworkState: { status, savedAt, error: error ?? null } });
    } catch (error) {
      set({ homeworkState: { status: "error", savedAt: null, error } });
    } finally {
      homeworkRequest = null;
    }
  },

  // ── Hausaufgaben змінились (запис, видалення, «Rückgängig»). homeworkStamp — сигнал дню перечитати свої ──
  homeworkStamp: 0,
  homeworkChanged: () => {
    get().loadHomework();
    set((s) => ({ homeworkStamp: s.homeworkStamp + 1 }));
  },

  // ── Минулі Klausuren: лише коли учень увімкнув «Vergangene anzeigen» ──
  loadPastExams: async () => {
    if (pastExamsRequest) return;
    if (get().pastExams.exams.length === 0) set({ pastExams: { ...NO_PAST_EXAMS, status: "loading" } });
    try {
      pastExamsRequest = loadWithCache("exams:past", () => api("/exams?past=true"));
      const { data, fromCache, status, savedAt, error } = await pastExamsRequest;
      set({ pastExams: { status, exams: fromCache ? withDaysLeft(data.exams, daysSince(savedAt)) : data.exams, savedAt, error: error ?? null } });
    } catch (error) {
      set({ pastExams: { ...NO_PAST_EXAMS, status: "error", error } });
    } finally {
      pastExamsRequest = null;
    }
  },

  // ── Klausuren змінились (запис, видалення, «Rückgängig», інший код): вони є і в списках, і в плані ──
  examsChanged: () => {
    get().loadExams();
    if (get().pastExams.status !== "idle") get().loadPastExams();
    get().reloadWeeks();
  },

  // ── Editor-Code. Сам код ніде не лежить: сервер пам'ятає його за сесією. Помилку показує форма ──
  unlockEditor: async (code) => {
    const { editor } = await api("/editor/unlock", { method: "POST", body: { code } });
    set((s) => ({ me: { ...s.me, editor } }));
    get().examsChanged(); // canEdit у записах залежить від коду
    get().loadHomework();
  },
  lockEditor: async () => {
    await api("/editor/lock", { method: "POST" });
    get().dropEditor();
    get().examsChanged();
    get().loadHomework();
  },
  // Сервер сказав, що коду більше немає (адмін заблокував, строк минув)
  dropEditor: () => set((s) => ({ me: { ...s.me, editor: null } })),

  // ── Тиждень (Mo–Fr), monday — "2026-10-05". silent: не показувати скелет, якщо дані вже є.
  // seen: учень уже подивився новий план, далі порівнюємо вже з цією відповіддю ──
  loadWeek: async (monday, { silent = false, seen = false } = {}) => {
    const prev = get().weeks[monday];
    const setWeek = (value) => set((s) => ({ weeks: { ...s.weeks, [monday]: value } }));
    // запам'ятати до запиту: відповідь перезапише і екран, і збережене
    if (!seen) seenWeeks[monday] ??= prev?.data ?? cache.load(`week:${monday}`)?.data ?? null;
    if (!silent || !prev?.data) setWeek({ status: "loading", data: prev?.data ?? null });
    try {
      const result = await loadWithCache(`week:${monday}`, () => api(`/week?date=${monday}`));
      setWeek({ status: result.status, data: result.data, savedAt: result.savedAt, error: result.error ?? null });
      if (seen && result.status === "ready") seenWeeks[monday] = result.data;
      if (result.status === "ready") set({ lastStandShown: false }); // школа знову відповідає
    } catch (error) {
      setWeek({ status: "error", data: null, error });
    }
  },

  // Перезавантажити всі тижні, які вже відкривали (після нового плану)
  reloadWeeks: (options) => Object.keys(get().weeks).forEach((monday) => get().loadWeek(monday, { silent: true, ...options })),

  // ── «Letzten Stand zeigen» ──
  showLastStand: () => set({ lastStandShown: true }),

  // ── Чи є план, якого учень ще не бачив? Сервер новіший за збережений lastChangeAt → плашка «Neuer Plan».
  // Свіжий тиждень беремо окремо: екран не міняється, поки учень не натисне «Ansehen» ──
  noticePlanChange: async (lastChangeAt) => {
    if (!lastChangeAt) return;
    const seen = seenChange.read();
    if (!seen) {
      seenChange.save(lastChangeAt); // перший запуск: нового для учня ще нічого немає
      return;
    }
    if (Date.parse(lastChangeAt) <= Date.parse(seen) || get().newPlan?.lastChangeAt === lastChangeAt) return;
    const today = berlinParts(get().now).date;
    const monday = currentMonday(today);
    const before = seenWeeks[monday] ?? get().weeks[monday]?.data ?? null;
    const fresh = await api(`/week?date=${monday}`).catch(() => null); // не вийшло — плашка без подробиць
    set({ newPlan: { lastChangeAt, changes: fresh ? planChanges(before, fresh, today) : [] } });
  },

  // ── «Ansehen»: показати новий план і більше про нього не нагадувати ──
  seeNewPlan: () => {
    seenChange.save(get().newPlan?.lastChangeAt);
    set({ newPlan: null });
    get().reloadWeeks({ seen: true });
  },

  // ── «Plan neu laden»: сервер одразу питає школу (кілька секунд).
  // monday — неделя на экране: её дни сервер проверит тоже (часть 26, «Diese Woche jetzt prüfen») ──
  refreshPlan: async (monday) => {
    if (get().refreshing) return; // уже йде
    set({ refreshing: true });
    try {
      const result = await api("/plan/refresh", { method: "POST", body: typeof monday === "string" ? { week: monday } : undefined });
      set({ status: result.status });
      if (!result.refreshed) {
        toast.error("Plan konnte nicht geladen werden", { duration: 6000, action: { label: "Nochmal", onClick: () => get().refreshPlan() } });
      } else {
        toast.success(result.changed ? "Plan aktualisiert" : "Plan ist aktuell", { duration: 3000 });
        // учень сам оновив план і зараз його побачить: плашка «Neuer Plan» уже зайва
        seenChange.save(result.status?.lastChangeAt);
        set({ newPlan: null });
        get().reloadWeeks({ seen: true }); // нові дані тижнів
        get().loadBasics(); // і Klausuren / стан
      }
      set((s) => ({ planStamp: s.planStamp + 1 })); // «Plan-Status» и «Verlauf» перечитывают дни
    } catch (error) {
      // 429 → «Bitte in 2 Minuten erneut versuchen.»; інше — текст сервера
      toast.error(error.code === "rate_limited" ? retryText(error) : error.message);
    } finally {
      set({ refreshing: false });
    }
  },

  // ── Раз на хвилину: оновити «зараз» (лінія часу, «noch 27 min») ──
  tick: () => set({ now: get().clock.now() }),

  // ── Live (часть 26) ──
  setLive: (live) => get().live !== live && set({ live }),

  // Событие «status» потока (после каждой проверки школы): то же, что ответ /plan/status
  applyStatus: async (status) => {
    if (!status) return;
    set({ status });
    await get().noticePlanChange(status.lastChangeAt);
  },

  // Событие «plan»: план этих дней изменился → плашка «Neuer Plan», лента «Verlauf» перечитывается
  applyPlanEvent: async ({ lastChangeAt } = {}) => {
    set((s) => ({ planStamp: s.planStamp + 1 }));
    await get().noticePlanChange(lastChangeAt);
  },

  // ── Без Live: раз на хвилину — чи змінився план? (GET /api/plan/status) ──
  checkStatus: async () => {
    if (statusRequest) return; // попередній опит ще йде (повільна мережа): не накладаємо
    try {
      statusRequest = api("/plan/status", { conditional: true });
      const status = await statusRequest;
      if (!status) return; // 304 — нічого не змінилось, нічого не перемальовуємо
      set({ status });
      await get().noticePlanChange(status.lastChangeAt);
    } catch {
      // немає мережі — спробуємо наступного разу
    } finally {
      statusRequest = null;
    }
  },
}));

// Сесія закінчилась (401 на будь-якому запиті) → екран входу з поясненням
// (Zugangscode вимкнули чи видалили, пароль класу змінили, вхід застарів — частина 14c)
setUnauthorizedHandler((error) => {
  usePlanStore.setState({ me: null, weeks: {}, loginNotice: signedOutNotice(error) });
});
