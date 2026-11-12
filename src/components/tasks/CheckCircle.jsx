import { cn } from "../../shared/utils/cn";
import { CheckIcon } from "../ui/icons";

// Кружок «erledigt» справа в строке (макет 25 handy-01): пустой — тонкий край, сделано — акцент с галочкой.
// Кнопка больше самого кружка — пальцем легко попасть
const CheckCircle = ({ done, label, onToggle, className }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={done}
    aria-label={done ? `${label}: wieder offen` : `${label}: erledigt`}
    onClick={onToggle}
    className={cn("grid size-11 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/50", className)}
  >
    <span className={cn("grid size-6.5 place-items-center rounded-full transition-colors", done ? "bg-accent text-on-accent" : "border-2 border-faint2")}>
      {done && <CheckIcon className="size-3.75" />}
    </span>
  </button>
);

export default CheckCircle;
