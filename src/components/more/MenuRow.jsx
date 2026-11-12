import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Рядок меню «Mehr»: іконка, назва, значення праворуч і стрілка.
// state — куди повертатись зі сторінки, яка відкривається і звідки ще (Datenschutz, Editor-Code)
// onClick замість to — рядок відкриває шторку, а не сторінку («Klasse einladen»)
const MenuRow = ({ to, state, onClick, icon: Icon, label, value, badge }) => {
  const inner = (
    <>
      <Icon className="size-4.5 shrink-0 text-muted" />
      <span className="flex min-w-0 flex-1 items-center gap-2 text-row font-medium text-ink">
        <span className="truncate">{label}</span>
        {badge}
      </span>
      {value && <span className="max-w-30 truncate text-label text-faint">{value}</span>}
      <ChevronRight className="size-4 shrink-0 text-faint2" />
    </>
  );
  // li — flex: тоді і посилання, і кнопка з -mx-2 тягнуться на всю ширину, а фон при наведенні виходить трохи за текст
  const row = "-mx-2 flex h-12.5 min-w-0 flex-1 items-center gap-3.25 rounded-field px-2 text-left hover:bg-paper";
  return (
    <li className="flex">
      {onClick ? (
        <button type="button" onClick={onClick} className={row}>
          {inner}
        </button>
      ) : (
        <Link to={to} state={state} className={row}>
          {inner}
        </Link>
      )}
    </li>
  );
};

export default MenuRow;
