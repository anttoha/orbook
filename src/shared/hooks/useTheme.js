import { create } from "zustand";

const STORAGE_KEY = "theme";

const getStoredTheme = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) || "system";
    } catch {
        return "system";
    }
};

// Вне браузера (тесты Vitest в Node) окна нет — тогда тема просто не применяется
const browser = typeof window !== "undefined";
const media = browser ? window.matchMedia("(prefers-color-scheme: dark)") : null;

// Тема зараз темна? «system» дивиться на налаштування пристрою
export const isDarkTheme = (theme) => theme === "dark" || (theme === "system" && Boolean(media?.matches));

// Панель браузера на телефоні — кольору сторінки, навіть якщо тема не збігається із системною.
// Окремо: її ж перефарбовує зміна оформлення (частина 30a). У Glas сторінка напівпрозора — беремо основу фону
export const paintThemeColor = () => {
    if (!browser) return;
    const style = getComputedStyle(document.documentElement);
    const paper = (style.getPropertyValue("--color-page").trim() || style.getPropertyValue("--color-paper").trim());
    if (!paper) return;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", paper));
};

const applyTheme = (theme) => {
    if (!browser) return;
    document.documentElement.classList.toggle("dark", isDarkTheme(theme));
    // библиотека стекла (часть 30a) смотрит на data-theme, а не на наш класс dark
    document.documentElement.dataset.theme = isDarkTheme(theme) ? "dark" : "light";
    paintThemeColor();
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
media?.addEventListener("change", () => applyTheme(useTheme.getState().theme));
