import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "theme";

const getStoredTheme = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) || "system";
    } catch {
        return "system";
    }
};

const media = window.matchMedia("(prefers-color-scheme: dark)");

const applyTheme = (theme) => {
    const isDark = theme === "dark" || (theme === "system" && media.matches);
    document.documentElement.classList.toggle("dark", isDark);
};

export const useTheme = () => {
    const [theme, setThemeState] = useState(getStoredTheme);

    useEffect(() => {
        applyTheme(theme);

        if (theme !== "system") return;
        const onChange = () => applyTheme("system");
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, [theme]);

    const setTheme = useCallback((next) => {
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // localStorage заборонено (приватний режим): тема діє до перезавантаження
        }
        setThemeState(next);
    }, []);

    return { theme, setTheme };
};
