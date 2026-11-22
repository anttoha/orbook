import { useEffect, useState } from "react";
import { fadeClass, scrollEdges } from "../utils/scrollEdges";

// ─────────────────────────────────────────────────────────────
// Затухание краёв у прокручиваемого блока: видно, что дальше ещё есть.
// Возвращает [ref, className]: ref — повесить на прокручиваемый блок (callback ref: React сам отдаст узел).
// Пересчитываем при прокрутке и когда меняется размер (окно, раскрыли группу меню).
// useEffect нужен: слушаем DOM и обязательно отписываемся.
// ─────────────────────────────────────────────────────────────
export function useScrollFade() {
  const [node, setNode] = useState(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });

  useEffect(() => {
    if (!node) return undefined;
    const update = () =>
      setEdges((prev) => {
        const next = scrollEdges(node);
        return next.top === prev.top && next.bottom === prev.bottom ? prev : next;
      });
    update();
    node.addEventListener("scroll", update, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(node);
    [...node.children].forEach((child) => observer?.observe(child));
    return () => {
      node.removeEventListener("scroll", update);
      observer?.disconnect();
    };
  }, [node]);

  return [setNode, fadeClass(edges)];
}
