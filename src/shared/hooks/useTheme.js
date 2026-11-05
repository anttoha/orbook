import { create } from "zustand";

const STORAGE_KEY = "theme";

const getStoredTheme = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) || "system";
    } catch {
        return "system";
    }
};

const media = window.matchMedia("(prefers-color-scheme: dark)");

// Тема зараз темна? «system» дивиться на налаштування пристрою
export const isDarkTheme = (theme) => theme === "dark" || (theme === "system" && media.matches);

const applyTheme = (theme) => {
    document.documentElement.classList.toggle("dark", isDarkTheme(theme));

    // Панель браузера на телефоні — кольору сторінки, навіть якщо тема не збігається із системною
    const paper = getComputedStyle(document.documentElement).getPropertyValue("--color-paper").trim();
    if (!paper) return;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", paper));
};

// Store, а не useState: сайдбар і Darstellung мають бачити одну й ту саму тему
export const useTheme = create((set) => ({
    theme: getStoredTheme(), // "light" | "dark" | "system"
    setTheme: (theme) => {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // localStorage заборонено (приватний режим): тема діє до перезавантаження
        }
        applyTheme(theme);
        set({ theme });
    },
}));

applyTheme(useTheme.getState().theme);

// Застосунок живе, поки відкрита вкладка, тому цей слухач не прибираємо
media.addEventListener("change", () => applyTheme(useTheme.getState().theme));
