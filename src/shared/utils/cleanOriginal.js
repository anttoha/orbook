// ─────────────────────────────────────────────────────────────
// cleanOriginal.js — страница InfoPoint, которую Android-App забрала сама (часть 37, без сервера),
// для превью и печати. Те же правила, что у сервера (orbook/noten/original.py): только таблицы,
// заголовки и текст; без скриптов, картинок, ссылок, on…; стиль школы внутрь без url() и @import.
// Показываем её ещё и в iframe без права запускать скрипты — двойная защита.
// ─────────────────────────────────────────────────────────────

const KEEP = new Set(["div", "span", "p", "br", "hr", "h1", "h2", "h3", "h4", "b", "i", "u", "strong", "em", "small", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "ul", "ol", "li", "center", "font"]);
const RENAME = { a: "span" };
const VOID = new Set(["br", "hr"]);
const DROP = new Set(["script", "style", "noscript", "iframe", "object", "embed", "template", "svg", "math", "select", "textarea", "button", "title", "head"]);
const ATTRS = new Set(["class", "id", "style", "colspan", "rowspan", "width", "align", "valign", "size", "noshade"]);
const BAD_STYLE = /url\s*\(|expression|@import|\\|javascript:|behavior|binding/i;
const TOKEN = /<!--[\s\S]*?-->|<![^>]*>|<\/?\s*([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|[^<]+|</g;
const ATTR = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

const escapeAttr = (value) => value.replace(/&(?![a-zA-Z#0-9]+;)/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function attrsOf(raw) {
  const out = [];
  for (const m of raw.replace(/\/\s*$/, "").matchAll(ATTR)) {
    const key = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4] ?? null;
    if (!ATTRS.has(key) || (key === "style" && value && BAD_STYLE.test(value))) continue;
    out.push(value == null ? key : `${key}="${escapeAttr(value)}"`);
  }
  return out;
}

// Только содержимое страницы (без <html>/<head>), безопасные теги
export function cleanBody(html) {
  const out = [];
  let skip = 0;
  for (const m of (html ?? "").matchAll(TOKEN)) {
    const [token, rawName, rawAttrs = ""] = m;
    if (token.startsWith("<!")) continue; // комментарий, doctype
    if (!rawName) {
      if (!skip) out.push(token === "<" ? "&lt;" : token.replace(/>/g, "&gt;"));
      continue;
    }
    const name = rawName.toLowerCase();
    const closing = /^<\s*\//.test(token);
    const selfClosing = /\/\s*>$/.test(token);
    if (DROP.has(name)) {
      if (!selfClosing) skip = closing ? Math.max(0, skip - 1) : skip + 1;
      continue;
    }
    if (skip) continue;
    const tag = RENAME[name] ?? name;
    if (!KEEP.has(tag)) continue;
    if (closing) {
      if (!VOID.has(tag)) out.push(`</${tag}>`);
    } else out.push(`<${[tag, ...attrsOf(rawAttrs)].join(" ")}>`);
  }
  return out.join("");
}

// Стиль школы без внешних адресов; «<» убираем, чтобы стиль не закрыл <style>
export const cleanCss = (css) =>
  (css ?? "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@import[^;]*;?/gi, "")
    .replace(/url\s*\([^)]*\)/gi, "none")
    .replace(/expression\s*\(|behavior\s*:|-moz-binding/gi, "")
    .replace(/</g, "");

// Готовая страница для превью и печати
export const cleanOriginal = (html, css) =>
  `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><title>cevex Home.InfoPoint</title><style>${cleanCss(css)}</style></head><body>${cleanBody(html)}</body></html>`;
