import { classColor } from "../../shared/constants/classColors";
import { cn } from "../../shared/utils/cn";

// Значок класса «9b» в его цвете (часть 29): карточка, переключатель, «Gefunden».
// size: "lg" — карточка (44px), "md" — меню и найденный класс (36px), "sm" — шапка колонки «Nebeneinander» (28px)
const SIZES = { lg: "size-11 rounded-field text-subhead", md: "size-9 rounded-tile text-row", sm: "size-7 rounded-tile text-label" };

const ClassBadge = ({ name, color, size = "lg", className }) => (
  <span className={cn("grid shrink-0 place-items-center font-black", SIZES[size], classColor(color).tint, className)} aria-hidden="true">
    {name}
  </span>
);

export default ClassBadge;
