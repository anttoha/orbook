import { matchPath } from "react-router-dom";

// exact — пункт світиться тільки на своїй адресі («Übersicht» /admin, а не /admin/codes)
export const isTabActive = (tab, pathname) =>
  [tab.to, ...(tab.activeOn ?? [])].some((path) =>
    matchPath({ path, end: path === "/" || (tab.exact && path === tab.to) }, pathname),
  );

// Пункт меню, який школа може вимкнути (tab.feature = "statistics"), ховаємо за me.features.
// Поки me ще не прийшло (features = undefined), показуємо: так меню не «стрибає» при кожному запуску
export const isTabEnabled = (tab, features) => !tab.feature || features?.[tab.feature] !== false;

// Сторінки без нижнього меню (макети «Klausur eintragen», «Editor-Code», підсторінки «Mehr»)
const FULL_SCREEN = ["/testen/neu", "/testen/:id/bearbeiten", "/editor-code", "/mehr/kurse", "/mehr/darstellung", "/mehr/fachfarben"];
export const isFullScreenPage = (pathname) => FULL_SCREEN.some((path) => matchPath(path, pathname));
