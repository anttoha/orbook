// ─────────────────────────────────────────────────────────────
// Ссылки с кодом для QR (часть 25). Код всегда после «#»: эту часть адреса браузер
// не отправляет на сервер, поэтому код не попадает ни в журналы, ни в историю запросов.
//   Sync-Code   → /mehr/sync#K7QM-4TXP-…
//   Lehrer-Code → /?zugang=lehrkraft#ORB-L-…
//   Editor-Code → /mehr/editor-code#…
// ─────────────────────────────────────────────────────────────

const PATHS = { sync: "/mehr/sync", teacher: "/?zugang=lehrkraft", editor: "/mehr/editor-code" };

// Полная ссылка для QR. origin — адрес сайта (на демо и проде свой)
export const codeLink = (kind, code, origin) => `${origin}${PATHS[kind]}#${code}`;

// Что пришло по ссылке: { kind, code } или null. Чужое и мусор после # игнорируем
export function parseLinkCode({ pathname = "", search = "", hash = "" }) {
  let code;
  try {
    code = decodeURIComponent(hash.replace(/^#/, "")).trim();
  } catch {
    return null; // битая кодировка — не код
  }
  if (!/^[A-Za-z0-9-]{4,60}$/.test(code)) return null;
  if (pathname === PATHS.sync) return { kind: "sync", code };
  if (pathname.endsWith("/editor-code")) return { kind: "editor", code };
  if (new URLSearchParams(search).get("zugang") === "lehrkraft") return { kind: "teacher", code };
  return null;
}
