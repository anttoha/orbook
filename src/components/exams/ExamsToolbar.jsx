import { Plus, Search } from "lucide-react";
import ExamFilterPopover from "./ExamFilterPopover";
import PillButton from "../ui/PillButton";
import GlassSearch from "../ui/GlassSearch";

// ─────────────────────────────────────────────────────────────
// Праворуч від заголовка на ПК (макет 14): пошук · фільтр · «+ Klausur eintragen».
// query / onQuery — текст пошуку; filter — { open, onOpenChange, active } для вікна фільтра;
// addTarget — куди веде «eintragen» (null — кнопки немає, див. addExamTarget).
// Hausaufgaben (pc-03): інший підпис пошуку і кнопки, фільтра немає (filter = null).
// children — своя кнопка замість посилання (Aufgaben, частина 25: меню «Eigene Aufgabe / für die Klasse»)
// ─────────────────────────────────────────────────────────────
const ExamsToolbar = ({ query, onQuery, filter, addTarget, placeholder = "Thema oder Fach suchen", addLabel = "Test eintragen", children }) => (
  <div className="flex items-center gap-2">
    <GlassSearch value={query} onValue={onQuery} placeholder={placeholder} className="w-57.5" inputProps={{ onKeyDown: (event) => event.key === "Escape" && onQuery("") }}>
      <label className="flex h-9.5 w-57.5 items-center gap-2 rounded-full border border-hair bg-card px-3.5 focus-within:border-accent">
        <Search className="size-3.75 shrink-0 text-faint" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          onKeyDown={(event) => event.key === "Escape" && onQuery("")}
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-w-0 flex-1 bg-transparent text-body-sm text-ink outline-none placeholder:text-faint2"
        />
      </label>
    </GlassSearch>
    {filter && <ExamFilterPopover open={filter.open} onOpenChange={filter.onOpenChange} active={filter.active} />}
    {children}
    {!children && addTarget && (
      <PillButton glass="filled" size="md" to={addTarget} className="ml-0.5 flex h-12 items-center gap-2 rounded-full bg-accent px-5 text-row font-bold text-on-accent outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
        <Plus className="size-4" /> {addLabel}
      </PillButton>
    )}
  </div>
);

export default ExamsToolbar;
