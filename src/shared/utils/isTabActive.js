import { matchPath } from "react-router-dom";

export const isTabActive = (tab, pathname) =>
  [tab.to, ...(tab.activeOn ?? [])].some((path) =>
    matchPath({ path, end: path === "/" }, pathname),
  );

// Сторінки без нижнього меню (макети «Klausur eintragen», «Editor-Code»)
const FULL_SCREEN = ["/testen/neu", "/testen/:id/bearbeiten", "/editor-code"];
export const isFullScreenPage = (pathname) => FULL_SCREEN.some((path) => matchPath(path, pathname));
