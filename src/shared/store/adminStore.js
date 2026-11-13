import { create } from "zustand";
import { setAdminClassHandler, setAdminUnauthorizedHandler } from "../api/api";
import * as admin from "../api/admin";
import { adminClassList, mergeClassCodes } from "../utils/adminClasses";

// ─────────────────────────────────────────────────────────────
// Стан адмінки, спільний для кількох екранів:
//   authed    — undefined: ще питаємо сервер; false: показати «Admin · Login»; true: всередині
//   overview  — GET /admin/overview (сайдбар, Übersicht, лічильники)
//   codes     — GET /admin/codes (Übersicht на ПК, Editor-Codes, лічильник у меню) — коды ВСЕХ классов
//   settings  — GET /admin/settings (Einstellungen, Kurse, «Schuljahresende» коду)
// Кожен ресурс: { status: "loading" | "ready" | "error", data, error }.
//   schools   — GET /admin/schools (часть 29c: чип класса, «Schulen & Klassen», поля «Schule/Klasse»)
//   classId   — какой класс админ сейчас настраивает (заголовок X-ORBook-Class у всех /admin/*);
//               null — первый класс сервера. Хранится на устройстве: после перезагрузки тот же класс
// Списки Klausuren і Protokoll живуть у своїх екранах: їх більше ніде не видно.
// ─────────────────────────────────────────────────────────────
const empty = { status: "loading", data: null, error: null };
// Всё, что относится к одному классу: при смене класса — заново
const CLASS_DATA = { overview: empty, codes: empty, teachers: empty, access: empty, settings: empty };

const CLASS_KEY = "orbook-admin-class";
function savedClass() {
  try {
    const id = Number(localStorage.getItem(CLASS_KEY));
    return id > 0 ? id : null;
  } catch {
    return null;
  }
}
function saveClass(id) {
  try {
    if (id) localStorage.setItem(CLASS_KEY, String(id));
    else localStorage.removeItem(CLASS_KEY);
  } catch {
    // приватный режим: класс просто не запомнится
  }
}

export const useAdminStore = create((set, get) => {
  // Завантажити ресурс key і покласти в store; старі дані лишаються на екрані, поки йде новий запит
  const load = async (key, request) => {
    set((s) => ({ [key]: { ...s[key], status: s[key].data ? "ready" : "loading", error: null } }));
    try {
      const data = await request();
      set({ [key]: { status: "ready", data, error: null } });
      return data;
    } catch (error) {
      if (error.code !== "not_authenticated") set((s) => ({ [key]: { ...s[key], status: s[key].data ? "ready" : "error", error } }));
      return null;
    }
  };

  // Коды всех классов (владелец 13.11): по запросу на класс, вместе одним списком с меткой класса.
  // Один класс (или старый сервер без школ) — один обычный запрос, как раньше
  const allClasses = async (request) => {
    const schools = get().schools.data ?? (await get().reloadSchools());
    const list = adminClassList(schools?.schools);
    if (list.length < 2) return request();
    const parts = await Promise.all(list.map(async (item) => ({ item, data: await request(item.id).catch(() => null) })));
    if (parts.every((part) => !part.data)) return request(); // ни один класс не ответил — покажем ошибку обычного запроса
    return mergeClassCodes(parts);
  };

  return {
    authed: undefined,
    loginNotice: null, // «Bitte erneut anmelden.», коли сесія закінчилась
    overview: empty,
    codes: empty,
    teachers: empty, // GET /admin/teachers: Kürzel і предмети для Lehrer-Codes (частина 14)
    access: empty, // GET /admin/access-codes: Zugangscodes і рядок Klassenpasswort (частина 14c)
    settings: empty,
    schools: empty,
    classId: savedClass(),

    // Відкрили /admin: чи вже увійшли? 401 → форма входу (обробник нижче)
    start: async () => {
      try {
        await admin.adminMe();
        set({ authed: true });
      } catch (error) {
        set({ authed: false, loginNotice: error.code === "not_authenticated" ? null : error.message });
      }
    },

    login: async (password) => {
      await admin.adminLogin(password); // помилку покаже форма
      set({ authed: true, loginNotice: null, ...CLASS_DATA, schools: empty });
    },

    logout: async () => {
      await admin.adminLogout().catch(() => {}); // навіть без мережі на цьому пристрої виходимо
      set({ authed: false, loginNotice: null, ...CLASS_DATA, schools: empty });
    },

    // Чип класса: другой класс → данные прошлого класса убираем, экраны грузят свои заново
    setClass: (id) => {
      if (id === get().classId) return;
      saveClass(id);
      set({ classId: id, ...CLASS_DATA });
    },

    reloadOverview: () => load("overview", admin.loadOverview),
    reloadCodes: () => load("codes", () => allClasses(admin.loadCodes)),
    reloadTeachers: () => load("teachers", admin.loadTeachers),
    reloadAccess: () => load("access", () => allClasses(admin.loadAccessCodes)),
    reloadSettings: () => load("settings", admin.loadSettings),
    reloadSchools: async () => {
      const data = await load("schools", admin.loadSchools);
      // Запомненного класса больше нет (удалили) — назад к первому классу сервера
      const id = get().classId;
      if (data && id && !data.schools.some((school) => school.classes.some((item) => item.id === id))) get().setClass(null);
      return data;
    },

    // Налаштування потрібні кільком екранам: вантажимо, тільки якщо ще немає
    ensureSettings: () => (get().settings.data ? Promise.resolve(get().settings.data) : get().reloadSettings()),
  };
});

// api.js спрашивает здесь, какой класс подставить в /admin/*
setAdminClassHandler(() => useAdminStore.getState().classId);

// Будь-який 401 у /admin/... — сесія адміна закінчилась (12 годин або 60 хвилин без дій)
setAdminUnauthorizedHandler(() => {
  if (useAdminStore.getState().authed) useAdminStore.setState({ authed: false, loginNotice: "Bitte erneut anmelden." });
});
