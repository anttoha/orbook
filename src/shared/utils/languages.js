// Список языков и чистые функции для выбора языка (без React — так их легко тестировать).
// name — всегда на своём языке; words — чем ещё можно найти язык в поиске.
export const LANGUAGES = [
  { code: "de", name: "Deutsch", flag: "de", words: "deutsch german deutschland" },
  { code: "en", name: "English", flag: "en", words: "english englisch" },
  { code: "uk", name: "Українська", flag: "uk", words: "українська ukrainisch ukrainian ukraine" },
];

const CODES = LANGUAGES.map((l) => l.code);

// Язык по умолчанию: первый из списка языков браузера, который у нас есть; иначе немецкий
export function detectLanguage(browserLanguages = []) {
  for (const tag of browserLanguages ?? []) {
    const code = String(tag).toLowerCase().split("-")[0];
    if (CODES.includes(code)) return code;
  }
  return "de";
}

// Сохранённое значение годится, только если такой язык есть
export const isLanguage = (code) => CODES.includes(code);

// Поиск в списке: по названию и по запасным словам, регистр не важен; пустой запрос — все языки
export function filterLanguages(query) {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return LANGUAGES;
  return LANGUAGES.filter((l) => `${l.name} ${l.words}`.toLowerCase().includes(q));
}
