import { en } from "./en";
import { uk } from "./uk";

// Перевод без библиотек: ключ — немецкий текст как он написан в коде.
// Нет перевода (или язык немецкий) — вернём сам немецкий текст, ничего не сломается.
const DICTIONARIES = { en, uk };
let current = "de";

export const getLanguage = () => current;
export const setCurrentLanguage = (code) => {
  current = code;
};

// Вставки: t("Klasse {name}", { name }) — переводим шаблон целиком, потом подставляем значения
const fill = (text, vars) => (vars ? text.replace(/\{(\w+)\}/g, (all, k) => (k in vars ? String(vars[k] ?? "") : all)) : text);

export const translateTo = (code, text, vars) => fill(DICTIONARIES[code]?.[text] ?? text, vars);
export const translate = (text, vars) => translateTo(current, text, vars);
