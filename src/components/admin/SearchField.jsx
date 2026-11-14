import { Search } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import GlassSearch from "../ui/GlassSearch";

// Поле пошуку в шапці (ПК): «Code suchen», «Suchen»
const SearchField = ({ value, onChange, placeholder = "Suchen", className }) => (
  <GlassSearch value={value} onValue={onChange} placeholder={placeholder} className={className}>
    <label className={cn("flex h-10.5 items-center gap-2 rounded-full border border-rule bg-card px-3.5 text-faint focus-within:ring-2 focus-within:ring-accent/30", className)}>
      <Search className="size-3.75 shrink-0" />
      <input type="search" value={value} placeholder={placeholder} aria-label={placeholder} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-body-sm text-ink outline-none placeholder:text-faint2" />
    </label>
  </GlassSearch>
);

export default SearchField;
