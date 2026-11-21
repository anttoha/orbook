import { toast } from "sonner";
import { androidBridge, appPrintHtml } from "../api/android";
import { appNotenState, fetchOriginal, fetchOriginalApp, hasAppNoten, hasAppOriginal, saveFileApp } from "../api/noten";
import { translate } from "../i18n/translate";
import { errorCode, useNotenStore } from "../store/notenStore";
import { usePlanStore } from "../store/planStore";
import { cleanOriginal } from "../utils/cleanOriginal";
import { waitMinutes } from "../utils/noten";

// ─────────────────────────────────────────────────────────────
// «Als PDF» (часть 37, макеты handy-06…08, pc-02, pc-03): оригинал InfoPoint, печать и файл PDF.
// Наш лист печатает usePrint; здесь — то, что не про React.
// ─────────────────────────────────────────────────────────────

export const inApp = () => Boolean(androidBridge());
// Старое APK не умеет ни печать, ни файлы, ни оригинал — тогда тост «App aktualisieren»
export const appTooOld = () => inApp() && !hasAppOriginal();

// Оригинал InfoPoint (mode "summary" | "detail") → { html } (чистая страница) | { error: код }.
// "login" — пароля нет или он неверный: вход уже открыт в notenStore (экран /noten)
export async function loadOriginal(mode) {
  const notes = useNotenStore.getState();
  const { username, password } = notes;
  if (!username || (!password && !(hasAppNoten() && appNotenState()?.saved))) {
    notes.openLogin();
    return { error: "login" };
  }
  try {
    if (inApp()) {
      const page = await fetchOriginalApp({ url: usePlanStore.getState().meta?.infopointUrl, username, password, mode });
      return { html: page?.css == null ? page?.html : cleanOriginal(page.html, page.css) };
    }
    return { html: (await fetchOriginal(username, password, mode)).html };
  } catch (error) {
    return { error: originalError(error) };
  }
}

// Ошибка оригинала → код для окна. Неверный пароль — снова вход, «слишком часто» — тост
function originalError(error) {
  const code = errorCode(error);
  if (code === "denied" || code === "no_login") {
    useNotenStore.getState().openLogin(code === "denied");
    return "login";
  }
  if (code === "too_often") toast(translate("Gerade geholt – wieder in {n} Min.", { n: waitMinutes(error?.retryAfter ?? error?.details?.retryAfter) }));
  if (code === "rate_limited") toast(translate("Gerade zu viele Anfragen – versuch es gleich nochmal"));
  return code;
}

// Напечатать оригинал: в приложении — системная печать, на сайте — невидимая рамка без скриптов
export function printOriginal(html) {
  if (inApp()) return appPrintHtml(html, "InfoPoint");
  printInFrame(html);
}

// sandbox без allow-scripts: скрипты страницы не запускаются; allow-same-origin — чтобы вызвать её print(),
// allow-modals — чтобы окно печати открылось
function printInFrame(html) {
  const frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-same-origin allow-modals");
  frame.setAttribute("aria-hidden", "true");
  frame.className = "fixed right-0 bottom-0 size-0 border-0";
  let done = false;
  const remove = () => {
    if (!done) frame.remove();
    done = true;
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

// ── Файл PDF ──
// Страницу рисуем картинкой (html2canvas-pro) и раскладываем по листам A4 (jsPDF). Библиотеки грузятся
// только по кнопке «Herunterladen». element — лист ORBook (его родитель уменьшен zoom — в копии убираем)
// или documentElement оригинала в рамке. margin — поля слева/справа в мм (оригинал без своих полей)
export async function makePdf(element, { margin = 0 } = {}) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas-pro")]);
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--color-qr-bg").trim() || null, // бумага — белая (токен qr-bg)
    width: 794,
    windowWidth: 794,
    onclone: (doc, copy) => {
      if (copy.parentElement) copy.parentElement.style.zoom = "1";
      // Оригинал: в файле — как на распечатке (стиль школы прячет меню и подвал только для печати)
      doc.querySelectorAll("style").forEach((style) => {
        style.textContent = style.textContent.replace(/@media\s+print/g, "@media all");
      });
    },
  });
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const top = 14;
  const width = 210 - 2 * margin;
  const perMm = canvas.width / width;
  const slice = Math.floor((297 - 2 * top) * perMm);
  // последний кусок меньше 1 мм — это округление, не страница
  for (let y = 0, page = 0; y < canvas.height - perMm || page === 0; y += slice, page++) {
    const height = Math.min(slice, canvas.height - y);
    const part = document.createElement("canvas");
    part.width = canvas.width;
    part.height = height;
    part.getContext("2d").drawImage(canvas, 0, y, canvas.width, height, 0, 0, canvas.width, height);
    if (page) pdf.addPage();
    pdf.addImage(part.toDataURL("image/jpeg", 0.92), "JPEG", margin, top, width, height / perMm);
  }
  return pdf;
}

// Отдать файл: сайт — обычная загрузка браузера, приложение — в «Downloads» телефона
export async function savePdf(pdf, name) {
  if (inApp()) {
    await saveFileApp({ name, mime: "application/pdf", data: pdf.output("datauristring").split(",")[1] });
  } else {
    const url = URL.createObjectURL(pdf.output("blob"));
    const link = Object.assign(document.createElement("a"), { href: url, download: name });
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  toast(translate("Gespeichert: {name}", { name }));
}
