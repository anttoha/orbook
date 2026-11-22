// ─────────────────────────────────────────────────────────────
// «Stapel teilen» (часть 43): стопка целиком лежит в ссылке после «#».
// Часть после «#» браузер на сервер не отправляет — поэтому сервер ORBook карточек не видит.
// Формат: "k1." + base64url(deflate-raw(JSON { n, s: [A, B], f, c: [[a, b], …] })) — без Lernstand и теста.
// ─────────────────────────────────────────────────────────────
import { CARDS_MAX, NAME_MAX, TEXT_MAX, cleanSides } from "./karten";

const PREFIX = "k1.";
export const SHARE_PATH = "/karten";
export const QR_MAX = 1200; // длиннее — QR слишком плотный, камера его плохо читает

// Байты ↔ base64url (без «+», «/» и «=» — их не надо экранировать в ссылке)
const toBase64Url = (bytes) => btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join("")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromBase64Url = (text) => Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

// Сжатие встроено в браузер (CompressionStream): «Unit 3» на 42 карточки — около 1 КБ
async function pipe(bytes, stream) {
  const out = await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer();
  return new Uint8Array(out);
}

export async function encodeDeck(deck) {
  const plain = { n: deck.name, s: cleanSides(deck.sides), f: deck.first, c: deck.cards.map((card) => [card.a, card.b]) };
  const packed = await pipe(new TextEncoder().encode(JSON.stringify(plain)), new CompressionStream("deflate-raw"));
  return PREFIX + toBase64Url(packed);
}

export const shareLink = (origin, code) => `${origin}${SHARE_PATH}#${code}`;

// Текст строки или null
const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

// Хэш из ссылки → { name, sides, first, cards: [{ a, b }] } или null (битая или чужая ссылка)
export async function decodeDeck(hash) {
  const code = (hash ?? "").replace(/^#/, "");
  if (!code.startsWith(PREFIX)) return null;
  try {
    const bytes = await pipe(fromBase64Url(code.slice(PREFIX.length)), new DecompressionStream("deflate-raw"));
    const plain = JSON.parse(new TextDecoder().decode(bytes));
    const cards = (Array.isArray(plain?.c) ? plain.c : [])
      .map((pair) => ({ a: text(pair?.[0], TEXT_MAX), b: text(pair?.[1], TEXT_MAX) }))
      .filter((card) => card.a && card.b)
      .slice(0, CARDS_MAX);
    const name = text(plain?.n, NAME_MAX);
    if (!name || cards.length === 0) return null;
    return { name, sides: cleanSides(plain.s), first: ["a", "b", "mix"].includes(plain.f) ? plain.f : "a", cards };
  } catch {
    return null;
  }
}
