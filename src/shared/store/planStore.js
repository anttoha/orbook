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
import { isTeacherCode, startTarget } from "../utils/classes";
import { useAppointmentStore } from "./appointmentsStore";
import { useClasses } from "./classesStore";
import { useMaterials } from "./materialsStore";
import { usePushStore } from "./pushStore";
import { quietly } from "./syncStore";
import { useUserStore } from "./userStore";

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
// Частина 29: у кожного класу свій план — і своя пам'ять
const seenKey = () => {
  const id = useClasses.getState().activeId;
  return id != null ? `orbook.seenChange.${id}` : "orbook.seenChange";
};
const seenChange = {
  read() {
    try {
      return localStorage.getItem(seenKey());
    } catch {
      return null;
    }
  },
  save(value) {
    try {
      if (value) localStorage.setItem(seenKey(), value);
      else localStorage.removeItem(seenKey());
    } catch {
      // немає сховища — плашка може показатись ще раз, це не страшно
    }
  },
};

// Тижні, які учень бачив останніми: з ними порівнюємо новий план, щоб написати, що змінилось.
// Лежить поза стором: це не показується на екрані
let seenWeeks = {};

// Дані одного класу: при переході в інший клас вони стираються (me теж — HomePage покаже порожній екран, поки вантажимо)
const NO_CLASS_DATA = { live: "off", meta: null, courses: [], coursesStatus: "loading", exams: [], examsState: { status: "loading", savedAt: null, error: null }, pastExams: NO_PAST_EXAMS, homework: [], homeworkState: { status: "loading", savedAt: null, error: null }, status: null, weeks: {}, newPlan: null, lastStandShown: false };

// «Beim Start öffnen» (частина 29): дивимось лише раз — при запуску застосунку
let booted = false;

// Відкрити клас id: його нотатки й курси — нагору userStore, заголовок X-ORBook-Class — його
function activate(id) {
  const { activeId } = useClasses.getState();
  if (activeId === id) return;
  // перший запуск після оновлення: те, що вже лежить на пристрої, належить цьому класу
  if (activeId != null) {
    quietly(() => useUserStore.getState().swapClass(activeId, id));
    usePushStore.getState().swapClass(activeId, id); // Mitteilungen — тоже свои у класса
  }
  useClasses.getState().setActive(id);
}

// Клас, якого вже немає (код вимкнули / клас прибрали): позначити й питати сервер без заголовка
// Відповідь прийшла, а клас уже інший (переключили, поки чекали) — її не показуємо
const stale = (classId) => useClasses.getState().activeId !== classId;

const lostClass = (error) => error?.status === 403 && (error.code === "class_gone" || error.code === "not_member");

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
  startPage: null, // частина 29: «/» при запуску веде на «Meine Klassen» (класів кілька, жоден не «Beim Start öffnen»)

  // ── Старт застосунку: хто я? ──
  start: async () => {
    set({ startError: null });
    if (!booted) {
      booted = true;
      const { classId, page } = startTarget(useClasses.getState().list);
      if (classId != null) activate(classId); // «Beim Start öffnen»
      set({ startPage: page });
    }
    try {
      // /auth/me відповідає 200 і без входу ({ authenticated: false })
      const me = await loadMe();
      if (me.authenticated && me.class?.id != null) {
        activate(me.class.id); // сервер відповів за інший клас (наш пропав) — відкриваємо його
        useClasses.getState().syncFromServer(me.classes, me.class);
      }
      set({ me: me.authenticated ? me : null });
      if (me.authenticated) get().loadBasics(); // увійшли — вантажимо решту
    } catch (error) {
      set({ startError: error }); // ні мережі, ні збереженого
    }
  },

  // ── Частина 29: інший клас. Дані старого класу стираємо з екрана і вантажимо новий ──
  switchClass: async (id) => {
    if (useClasses.getState().activeId === id) return;
    activate(id);
    seenWeeks = {};
    examsRequest = pastExamsRequest = homeworkRequest = statusRequest = null; // запити старого класу нам уже не потрібні
    useMaterials.getState().reset();
    useAppointmentStore.getState().reset();
    // me не стираем: меню и раскладка остаются на месте, пока грузится новый класс (без «белой вспышки»)
    set({ ...NO_CLASS_DATA });
    await get().start();
  },

  // ── Учень вибрав клас (карточка, перемикач): далі «/» відкриває план, а не «Meine Klassen» ──
  openClass: async (id) => {
    set({ startPage: null });
    await get().switchClass(id);
  },

  // ── «Klasse hinzufügen»: код другого класу ДОДАЄ клас (add: true), вхід лишається.
  // Повертає class { id, name, school }. Помилки (already_member, too_many_classes …) — формі ──
  addClass: async (code, label = "") => {
    const res = isTeacherCode(code)
      ? await api("/auth/teacher", { method: "POST", body: { code: code.trim(), add: true } })
      : await api("/auth/login", { method: "POST", body: { password: code.trim(), add: true } });
    if (!res?.class) throw new Error("Der Server kennt noch keine Klassen.");
    useClasses.getState().addClass(res.class, label);
    return res.class;
  },

  // ── «Klasse entfernen» — тільки на цьому пристрої (POST /auth/leave). Останній клас → екран входу ──
  leaveClass: async (id) => {
    let res = null;
    try {
      res = await api("/auth/leave", { method: "POST", body: { class: id } });
    } catch (error) {
      if (error.status !== 404 && !lostClass(error)) throw error; // класу на сервері вже немає — прибираємо лише тут
    }
    const rest = useClasses.getState().list.filter((item) => item.id !== id);
    if (res?.authenticated === false || rest.length === 0) return get().logout();
    if (useClasses.getState().activeId === id) await get().switchClass((rest.find((item) => !item.gone) ?? rest[0]).id);
    useClasses.getState().remove(id);
    usePushStore.getState().dropClass(id); // его подписку сервер уже удалил
    cache.clearClass(id); // копию планів стираємо; нотатки класу лишаються (userStore.byClass) — як у «Klasse verlassen»
  },

  // ── Вхід паролем класу. Помилку (ApiError) кидаємо далі — її показує екран входу ──
  login: async (password) => {
    get().openJoined(await api("/auth/login", { method: "POST", body: { password } }));
    set({ loginNotice: null, weeks: {} });
    await get().start();
  },

  // Відповідь входу: class — до якого класу ми щойно увійшли (частина 29). Відкриваємо саме його
  openJoined: (res) => {
    if (res?.class?.id == null) return; // старий сервер
    useClasses.getState().addClass(res.class);
    activate(res.class.id);
  },

  // ── Вхід за посиланням-запрошенням /i/<token> (частина 16): як вхід кодом. Помилку показує JoinPage ──
  join: async (token) => {
    const res = await joinWithInvite(token);
    if (res?.class?.id != null && res.class.id !== useClasses.getState().activeId) set({ ...NO_CLASS_DATA }); // посилання на ще один клас
    get().openJoined(res);
    set({ loginNotice: null, weeks: {} });
    await get().start();
  },

  // ── Вхід учителя Lehrer-Code (без пароля класу). Помилку показує форма ──
  loginTeacher: async (code) => {
    get().openJoined(await api("/auth/teacher", { method: "POST", body: { code } }));
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
    useClasses.getState().reset(); // вийшли з усіх класів
    set({ ...NO_CLASS_DATA, me: null });
  },

  // ── Після входу: паралельно meta, курси, Klausuren, стан плану ──
  loadBasics: async () => {
    // Кожен запит окремо: якщо один упав, інші все одно покажуться
    const classId = useClasses.getState().activeId;
    const load = async (key, path, apply) => {
      try {
        const result = await loadWithCache(key, () => api(path));
        if (!stale(classId)) apply(result);
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
    const classId = useClasses.getState().activeId;
    try {
      const { data } = await loadWithCache("courses", () => api("/courses"));
      if (!stale(classId)) set({ courses: data?.courses ?? [], coursesStatus: "ready" });
    } catch {
      set({ coursesStatus: "error" });
    }
  },

  // ── Найближчі Klausuren. Старий список лишається на екрані, поки йде запит ──
  loadExams: async () => {
    if (examsRequest) return;
    if (get().examsState.status === "error") set({ examsState: { status: "loading", savedAt: null, error: null } });
    try {
      const classId = useClasses.getState().activeId;
      examsRequest = loadWithCache("exams", () => api("/exams"));
      const { data, fromCache, status, savedAt, error } = await examsRequest;
      if (!stale(classId)) set({ exams: fromCache ? freshenExams(data.exams, daysSince(savedAt)) : data.exams, examsState: { status, savedAt, error: error ?? null } });
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
      const classId = useClasses.getState().activeId;
      homeworkRequest = loadWithCache("homework", () => api("/homework"));
      const { data, fromCache, status, savedAt, error } = await homeworkRequest;
      const items = data?.homework ?? [];
      if (!stale(classId)) set({ homework: fromCache ? freshenExams(items, daysSince(savedAt)) : items, homeworkState: { status, savedAt, error: error ?? null } });
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
    const classId = useClasses.getState().activeId;
    try {
      const result = await loadWithCache(`week:${monday}`, () => api(`/week?date=${monday}`));
      if (stale(classId)) return;
      setWeek({ status: result.status, data: result.data, savedAt: result.savedAt, error: result.error ?? null });
      if (seen && result.status === "ready") seenWeeks[monday] = result.data;
      if (result.status === "ready") set({ lastStandShown: false }); // школа знову відповідає
    } catch (error) {
      if (!stale(classId)) setWeek({ status: "error", data: null, error });
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

// GET /auth/me від імені відкритого класу. Його вже немає (403) — позначаємо і питаємо без заголовка:
// сервер відповість за перший клас пристрою
async function loadMe() {
  try {
    return (await loadWithCache("me", () => api("/auth/me"))).data;
  } catch (error) {
    if (!lostClass(error)) throw error;
    useClasses.getState().markGone(useClasses.getState().activeId);
    return api("/auth/me", { classId: null });
  }
}

// Сесія закінчилась (401 на будь-якому запиті) → екран входу з поясненням
// (Zugangscode вимкнули чи видалили, пароль класу змінили, вхід застарів — частина 14c)
setUnauthorizedHandler((error) => {
  usePlanStore.setState({ me: null, weeks: {}, loginNotice: signedOutNotice(error) });
});
