import { usePress, useRefraction } from "@zakisheriff/liquid-glass";
import { useGlass } from "./useGlass";

// ─────────────────────────────────────────────────────────────
// «Glas» (часть 30a) для НАШИХ элементов, у которых нет готового компонента в библиотеке
// (пункты бокового меню, сама боковая панель, карточки): хуки библиотеки liquid-glass.
//   refract — стекло с преломлением того, что под элементом (элементу нужен класс lg-glass);
//   press   — элемент раздувается и тянется за пальцем, пружинит обратно.
// В Soft и Klar хуки выключены (флаги enabled / disabled) — элемент ведёт себя как раньше.
// Возвращает true, если сейчас «Glas»: по нему компонент добавляет класс lg-glass.
// ─────────────────────────────────────────────────────────────
export function useLiquid(ref, { refract = false, press = true, lean, stretch, grow } = {}) {
  const glass = useGlass();
  useRefraction(ref, { kind: "surface", strength: 1 }, glass && refract);
  usePress(ref, { lean, stretch, grow, disabled: !glass || !press });
  return glass;
}
