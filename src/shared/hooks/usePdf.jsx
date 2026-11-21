import { useState } from "react";
import { toast } from "sonner";
import { androidBridge, hasAppPrint } from "../api/android";
import { appNotenState, fetchOriginal, hasAppNoten, hasAppOriginal, printOriginalApp } from "../api/noten";
import { translate } from "../i18n/translate";
import { errorCode, useNotenStore } from "../store/notenStore";
import { usePlanStore } from "../store/planStore";
import { waitMinutes } from "../utils/noten";
import { usePrint } from "./usePrint";

// ─────────────────────────────────────────────────────────────
// usePdf — «Als PDF» на Noten и Fehlzeiten (часть 37).
//   sheet(лист)    — наш лист A4: PrintArea + печать браузера (в Android-App — мост printPage, usePrint)
//   original(mode) — страница InfoPoint как есть: сайт берёт её у сервера и печатает в изолированной
//                    рамке; приложение забирает и печатает само. Нигде не сохраняется.
// Возвращает { area, busy, sheet, original }: area — вставить в разметку (лист для печати)
// ─────────────────────────────────────────────────────────────
export function usePdf() {
  const { print, area } = usePrint();
  const [busy, setBusy] = useState(false);
  const inApp = Boolean(androidBridge());

  const sheet = (element) => {
    if (inApp && !hasAppPrint()) toast(translate("Für PDF bitte die App aktualisieren"));
    else print(element);
  };

  // Результат: "done" — окно печати открыто, "login" — нужен вход (открыт на /noten), null — ошибка (тост)
  const original = async (mode) => {
    if (busy) return null;
    if (inApp && !hasAppOriginal()) {
      toast(translate("Für PDF bitte die App aktualisieren"));
      return null;
    }
    const notes = useNotenStore.getState();
    const { username, password } = notes;
    if (!username || (!password && !(hasAppNoten() && appNotenState()?.saved))) {
      notes.openLogin();
      return "login";
    }
    setBusy(true);
    try {
      if (inApp) await printOriginalApp({ url: usePlanStore.getState().meta?.infopointUrl, username, password, mode });
      else printInFrame((await fetchOriginal(username, password, mode)).html);
      return "done";
    } catch (error) {
      return showError(error);
    } finally {
      setBusy(false);
    }
  };

  return { area, busy, sheet, original };
}

// Ошибка оригинала: неверный пароль — снова вход ("login"), остальное — тост (null)
function showError(error) {
  const code = errorCode(error);
  if (code === "denied" || code === "no_login") {
    useNotenStore.getState().openLogin(code === "denied");
    return "login";
  }
  if (code === "too_often") toast(translate("Gerade geholt – wieder in {n} Min.", { n: waitMinutes(error?.retryAfter ?? error?.details?.retryAfter) }));
  else if (code === "rate_limited") toast(translate("Gerade zu viele Anfragen – versuch es gleich nochmal"));
  else if (code === "disabled") toast(translate("Noten sind für deine Klasse ausgeschaltet"));
  else toast(translate("InfoPoint nicht erreichbar"));
  return null;
}

// Чужую страницу печатаем в невидимой рамке без права запускать скрипты (sandbox без allow-scripts);
// allow-same-origin — чтобы вызвать её print(), allow-modals — чтобы окно печати открылось
function printInFrame(html) {
  const frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-same-origin allow-modals");
  frame.setAttribute("aria-hidden", "true");
  frame.className = "fixed right-0 bottom-0 size-0 border-0";
  let done = false;
  const remove = () => {
    if (done) return;
    done = true;
    frame.remove();
  };
  frame.addEventListener("load", () => {
    const win = frame.contentWindow;
    win.addEventListener("afterprint", () => setTimeout(remove, 0));
    win.focus();
    win.print();
    setTimeout(remove, 60000); // Safari не ждёт окно печати и не всегда шлёт afterprint
  });
  frame.srcdoc = html;
  document.body.append(frame);
}
