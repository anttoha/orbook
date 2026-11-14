import { useUserStore } from "../store/userStore";

// Выбрано оформление «Glas» (часть 30a)? Тогда базовые элементы (нижнее меню, «таблетки», переключатели,
// шторки, карточки) рисует библиотека @zakisheriff/liquid-glass — настоящее стекло с преломлением и пружинами.
// В Soft и Klar — наши обычные компоненты
export const useGlass = () => useUserStore((s) => s.design === "glas");
