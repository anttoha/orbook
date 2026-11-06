// ─────────────────────────────────────────────────────────────
// Перехід між сторінками (макет «Nutzbarkeit»):
//   вглиб (Mehr → Meine Kurse, Klausuren → neu) — сторінка заїжджає справа
//   «назад» браузера або кнопкою — зліва
//   між вкладками меню — просто плавно з'являється
// ─────────────────────────────────────────────────────────────

// Скільки рівнів у адресі: "/mehr" → 1, "/mehr/kurse" → 2
const depth = (pathname) => pathname.split("/").filter(Boolean).length;

// Ключ сторінки: коли він змінюється, сторінка грає анімацію появи.
// Дні (/tag/…) гортаються свайпом зі своєю анімацією, тому для них ключ один.
// На ПК «Einstellungen» (/mehr/…) — одна сторінка з вкладками: меню зліва стоїть,
// а розділ праворуч міняє сам SettingsLayout. Тому вся сторінка не їде
export function pageKey(pathname, { desktop = false } = {}) {
  if (pathname.startsWith("/tag/")) return "/tag";
  if (desktop && (pathname === "/mehr" || pathname.startsWith("/mehr/"))) return "/mehr";
  return pathname;
}

// Клас анімації. navigationType з React Router: "POP" — назад/вперед браузера, "PUSH"/"REPLACE" — перехід за посиланням.
// back — сторінка відкрита кнопкою «назад» (стрілка в шапці веде на рівень вище)
export function pageAnimation(from, to, navigationType, options = {}) {
  if (!from || pageKey(from, options) === pageKey(to, options)) return "";
  if (navigationType === "POP" || depth(to) < depth(from)) return "animate-page-back";
  if (depth(to) > depth(from)) return "animate-page-forward";
  return "animate-page-fade";
}
