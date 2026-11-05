import { useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { pageAnimation, pageKey } from "../utils/pageMotion";

// Повні рядки класів, щоб Tailwind їх знайшов. motion-safe: без анімації, якщо в системі «менше руху»
const CLASSES = {
  "animate-page-forward": "motion-safe:animate-page-forward",
  "animate-page-back": "motion-safe:animate-page-back",
  "animate-page-fade": "motion-safe:animate-page-fade",
};

// { key, className } для обгортки сторінки. Попередню адресу пам'ятаємо в стані:
// оновлення під час рендеру — дозволений React спосіб «запам'ятати попереднє» без useEffect
export function usePageAnimation() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const [seen, setSeen] = useState({ path: pathname, animation: "" });

  let animation = seen.animation;
  if (seen.path !== pathname) {
    animation = pageAnimation(seen.path, pathname, navigationType);
    setSeen({ path: pathname, animation });
  }
  return { key: pageKey(pathname), className: CLASSES[animation] ?? "" };
}
