// ORBook Notizen-Sync: Schlüssel, syncId und Verschlüsselung (Web Crypto, ohne Bibliotheken).
// Gleiche Logik wie tests/syncref.py. Der Server sieht nur syncId (Header X-Sync-Id) und den Block.

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford Base32: ohne I, L, O, U
const CODE_CHARS = 20; // 20 × 5 Bit = 100 Bit
const ITERATIONS = 600_000;
const enc = new TextEncoder();
const dec = new TextDecoder();

// Neuer zufälliger Code, Format XXXX-XXXX-XXXX-XXXX-XXXX. Nur die App erzeugt Codes, nie der Nutzer.
export function generateSyncCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_CHARS));
  const chars = Array.from(bytes, (b) => ALPHABET[b & 31]).join(''); // 256 % 32 == 0: gleichverteilt
  return chars.match(/.{4}/g).join('-');
}

// Eingabe von Hand (anderes Gerät): Striche/Leerzeichen weg, Großbuchstaben, O→0, I/L→1.
export function normalizeSyncCode(text) {
  const chars = text.toUpperCase().replace(/[-\s]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  if (chars.length !== CODE_CHARS || [...chars].some((c) => !ALPHABET.includes(c))) {
    throw new Error('Ungültiger Sync-Code');
  }
  return chars;
}

const toHex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
const toB64 = (bytes) => btoa(String.fromCharCode(...bytes));
const fromB64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

// code → PBKDF2 (master) → HKDF → { syncId (hex, 64), key (AES-256-GCM) }. Dauert ca. 0,3–1 s.
export async function deriveSync(code) {
  const pbkdf2 = await crypto.subtle.importKey('raw', enc.encode(normalizeSyncCode(code)), 'PBKDF2', false, ['deriveBits']);
  const master = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode('orbook-sync-v1'), iterations: ITERATIONS },
    pbkdf2,
    256,
  );
  const hkdf = await crypto.subtle.importKey('raw', master, 'HKDF', false, ['deriveBits']);
  const expand = (info) =>
    crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: enc.encode(info) }, hkdf, 256);
  const syncId = toHex(await expand('orbook-sync-id-v1'));
  const key = await crypto.subtle.importKey('raw', await expand('orbook-sync-key-v1'), 'AES-GCM', false, ['encrypt', 'decrypt']);
  return { syncId, key };
}

// Notizen (JSON) → "v1." + base64(IV ‖ Chiffretext ‖ Tag). IV: 12 Zufallsbytes, bei JEDEM Schreiben neu.
export async function encryptNotes({ syncId, key }, notes) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: enc.encode(`orbook-sync-v1|${syncId}`), tagLength: 128 },
    key,
    enc.encode(JSON.stringify(notes)),
  ); // Web Crypto hängt den Tag an den Chiffretext an
  return 'v1.' + toB64(new Uint8Array([...iv, ...new Uint8Array(cipher)]));
}

export async function decryptNotes({ syncId, key }, block) {
  if (!block.startsWith('v1.')) throw new Error('Unbekanntes Blockformat');
  const raw = fromB64(block.slice(3));
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: raw.slice(0, 12), additionalData: enc.encode(`orbook-sync-v1|${syncId}`), tagLength: 128 },
    key,
    raw.slice(12),
  ); // falscher Code, falsche syncId oder verändert → wirft einen Fehler
  return JSON.parse(dec.decode(plain));
}

// Server-Aufrufe: syncId nur im Header, nie in der URL.
export const syncRequest = (syncId, method, body) =>
  fetch('/api/sync', {
    method,
    headers: { 'X-Sync-Id': syncId, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
