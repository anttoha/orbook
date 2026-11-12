import { useState } from "react";
import { cn } from "../../shared/utils/cn";
import { CheckIcon } from "../ui/icons";

// Кружок «erledigt» справа в строке (макет 25 handy-01): пустой — тонкий край, сделано — акцент с галочкой.
// Кнопка 44×44 больше самого кружка — пальцем легко попасть. Нажал — кружок пружинит (check-pop)
const CheckCircle = ({ done, label, onToggle, className }) => {
  const [taps, setTaps] = useState(0); // пружинит только после нажатия, а не при открытии списка
  const toggle = () => {
    setTaps((n) => n + 1);
    onToggle();
  };
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? `${label}: wieder offen` : `${label}: erledigt`}
      title={done ? "Wieder offen" : "Erledigt"}
      onClick={toggle}
      className={cn("group grid size-11 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/50", className)}
    >
      {/* key — после каждого нажатия элемент новый, и анимация играет заново */}
      <span
        key={taps}
        className={cn(
          "grid size-6.5 place-items-center rounded-full transition-[scale,border-color] duration-150 group-active:scale-85",
          taps > 0 && "motion-safe:animate-check-pop",
          done ? "bg-accent text-on-accent" : "border-2 border-faint2 group-hover:border-accent",
        )}
      >
        {done && <CheckIcon className="size-3.75" />}
      </span>
    </button>
  );
};

export default CheckCircle;
