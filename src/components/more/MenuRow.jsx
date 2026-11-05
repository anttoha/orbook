import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Рядок меню «Mehr»: іконка, назва, значення праворуч і стрілка.
// state — куди повертатись зі сторінки, яка відкривається і звідки ще (Datenschutz, Editor-Code)
const MenuRow = ({ to, state, icon: Icon, label, value }) => (
  <li>
    <Link to={to} state={state} className="-mx-2 flex h-12.5 items-center gap-3.25 rounded-field px-2 hover:bg-paper">
      <Icon className="size-4.5 shrink-0 text-muted" />
      <span className="min-w-0 flex-1 truncate text-row font-medium text-ink">{label}</span>
      {value && <span className="max-w-30 truncate text-label text-faint">{value}</span>}
      <ChevronRight className="size-4 shrink-0 text-faint2" />
    </Link>
  </li>
);

export default MenuRow;
