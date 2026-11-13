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

export const translateTo = (code, text) => DICTIONARIES[code]?.[text] ?? text;
export const translate = (text) => translateTo(current, text);
