import { useSyncExternalStore } from "react";

// true, якщо media query збігається: useMediaQuery("(min-width: 90rem)")
// useSyncExternalStore підписується на зміни ширини вікна
export const useMediaQuery = (query) =>
  useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query); // об'єкт media query
      media.addEventListener("change", onChange); // повідомляємо React про зміни
      return () => media.removeEventListener("change", onChange); // відписка
    },
    () => window.matchMedia(query).matches, // поточне значення
  );

// Комп'ютерний вигляд (сайдбар, панелі праворуч) — з 1024px (брейкпоінт lg)
export const DESKTOP_QUERY = "(min-width: 64rem)";

// Широкий екран — макет 1:1 з правою колонкою (брейкпоінт desktop з index.css, 1440px)
export const WIDE_QUERY = "(min-width: 90rem)";
