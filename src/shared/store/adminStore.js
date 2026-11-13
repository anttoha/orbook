import { create } from "zustand";
import { setAdminClassHandler, setAdminUnauthorizedHandler } from "../api/api";
import * as admin from "../api/admin";

// ─────────────────────────────────────────────────────────────
// Стан адмінки, спільний для кількох екранів:
//   authed    — undefined: ще питаємо сервер; false: показати «Admin · Login»; true: всередині
//   overview  — GET /admin/overview (сайдбар, Übersicht, лічильники)
//   codes     — GET /admin/codes (Übersicht на ПК, Editor-Codes, лічильник у меню)
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
    reloadCodes: () => load("codes", admin.loadCodes),
    reloadTeachers: () => load("teachers", admin.loadTeachers),
    reloadAccess: () => load("access", admin.loadAccessCodes),
    reloadSettings: () => load("settings", admin.loadSettings),
    // Код создан для другого (или нового) класса: переключить админку на него — иначе код не виден в списке
    // (список показывает коды класса из чипа). Сначала свежие классы: нового класса в чипе ещё нет
    showClass: async (id) => {
      if (!id || id === get().classId) return;
      await get().reloadSchools();
      get().setClass(id);
    },
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
