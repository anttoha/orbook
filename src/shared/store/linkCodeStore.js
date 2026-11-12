import { create } from "zustand";
import { parseLinkCode } from "../utils/linkCode";

// Код из ссылки (QR) читаем один раз при запуске и сразу убираем «#…» из адреса:
// так он не остаётся в адресной строке и в истории браузера. Пока его не использовали — лежит здесь
function readOnce() {
  const link = parseLinkCode(window.location);
  if (link) window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  return link;
}

export const useLinkCode = create((set) => ({
  link: readOnce(), // { kind: "sync" | "teacher" | "editor", code } | null
  clear: () => set({ link: null }),
}));

// Код нужного вида или null (для полей «вписать код»)
export const linkCodeOf = (link, kind) => (link?.kind === kind ? link.code : null);
