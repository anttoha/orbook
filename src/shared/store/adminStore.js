import { create } from "zustand";
import { setAdminUnauthorizedHandler } from "../api/api";
import * as admin from "../api/admin";

// ─────────────────────────────────────────────────────────────
// Стан адмінки, спільний для кількох екранів:
//   authed    — undefined: ще питаємо сервер; false: показати «Admin · Login»; true: всередині
//   overview  — GET /admin/overview (сайдбар, Übersicht, лічильники)
//   codes     — GET /admin/codes (Übersicht на ПК, Editor-Codes, лічильник у меню)
//   settings  — GET /admin/settings (Einstellungen, Kurse, «Schuljahresende» коду)
// Кожен ресурс: { status: "loading" | "ready" | "error", data, error }.
// Списки Klausuren і Protokoll живуть у своїх екранах: їх більше ніде не видно.
// ─────────────────────────────────────────────────────────────
const empty = { status: "loading", data: null, error: null };

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
      set({ authed: true, loginNotice: null, overview: empty, codes: empty, teachers: empty, access: empty, settings: empty });
    },

    logout: async () => {
      await admin.adminLogout().catch(() => {}); // навіть без мережі на цьому пристрої виходимо
      set({ authed: false, loginNotice: null, overview: empty, codes: empty, teachers: empty, access: empty, settings: empty });
    },

    reloadOverview: () => load("overview", admin.loadOverview),
    reloadCodes: () => load("codes", admin.loadCodes),
    reloadTeachers: () => load("teachers", admin.loadTeachers),
    reloadAccess: () => load("access", admin.loadAccessCodes),
    reloadSettings: () => load("settings", admin.loadSettings),

    // Налаштування потрібні кільком екранам: вантажимо, тільки якщо ще немає
    ensureSettings: () => (get().settings.data ? Promise.resolve(get().settings.data) : get().reloadSettings()),
  };
});

// Будь-який 401 у /admin/... — сесія адміна закінчилась (12 годин або 60 хвилин без дій)
setAdminUnauthorizedHandler(() => {
  if (useAdminStore.getState().authed) useAdminStore.setState({ authed: false, loginNotice: "Bitte erneut anmelden." });
});
