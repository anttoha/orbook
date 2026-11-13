import { create } from "zustand";
import { setCurrentLanguage } from "../i18n/translate";
import { detectLanguage, isLanguage } from "../utils/languages";

const STORAGE_KEY = "orbook-language";
const browser = typeof window !== "undefined";

// Выбранный язык лежит только на устройстве; нет выбора — язык браузера (de / en / uk), иначе немецкий
const initial = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // localStorage закрыт: берём язык браузера
  }
  return browser ? detectLanguage(navigator.languages ?? [navigator.language]) : "de";
};

const apply = (code) => {
  setCurrentLanguage(code);
  if (browser) document.documentElement.lang = code;
};

// Store, а не useState: меню, страницы и даты должны видеть один и тот же язык
export const useLanguage = create((set) => ({
  lang: initial(),
  setLang: (lang) => {
    if (!isLanguage(lang)) return;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // язык действует до перезагрузки
    }
    apply(lang);
    set({ lang });
  },
}));

apply(useLanguage.getState().lang);
