import { useState } from "react";
import { Search } from "lucide-react";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { badgeCode } from "../../shared/utils/format";
import { fachClasses } from "../../shared/utils/lessons";
import { filterItems, groupItems } from "../../shared/utils/picker";
import { CheckIcon } from "./icons";
import Kbd from "./Kbd";

// Кружечок предмета з кодом (як SubjectBadge, але з кодом пункту списку)
export const PickerBadge = ({ code, className }) => {
  const overrides = useUserStore((s) => s.colorOverrides);
  return <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-note font-black", fachClasses(code, overrides), className)}>{badgeCode(code ?? "?")}</span>;
};

// Рядок списку: кружечок, назва, підпис, галочка у вибраного
const Row = ({ item, selected, active, onHover, onChoose }) => (
  <li role="option" aria-selected={selected}>
    <button type="button" onMouseMove={onHover} onClick={onChoose} className={cn("flex w-full items-center gap-3 rounded-field px-2.5 py-2 text-left", (active || selected) && "bg-tint")}>
      <PickerBadge code={item.code} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-row font-extrabold text-ink">{item.title}</span>
        {item.subtitle && <span className="block truncate text-hint text-faint">{item.subtitle}</span>}
      </span>
      {selected && <CheckIcon className="size-4.5 shrink-0 text-accent-ink" />}
    </button>
  </li>
);

// ─────────────────────────────────────────────────────────────
// Пошук + список з групами (усередині шторки, випадного вікна або розгорнутого поля).
//   items      — пункти (shared/utils/picker.js), selected — масив вибраних value
//   onChoose   — клік / Enter по пункту
//   autoFocus  — одразу в поле пошуку (на ПК; на телефоні вискочила б клавіатура)
//   keys       — підказка «↑↓ wählen» внизу (ПК)
// Клавіші в полі пошуку: ↑ ↓ — вибір рядка, Enter — взяти
// ─────────────────────────────────────────────────────────────
const PickerList = ({ items, selected, onChoose, autoFocus = false, keys = false, searchPlaceholder = "Fach, Kürzel oder Lehrer", className }) => {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1); // рядок під стрілками (-1 — жоден)
  const found = filterItems(items, query);
  const groups = groupItems(found);

  const handleKey = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => Math.min(found.length - 1, Math.max(0, i + step)));
    } else if (event.key === "Enter") {
      event.preventDefault(); // не відправляти форму
      const item = found[active] ?? (found.length === 1 ? found[0] : null);
      if (item) onChoose(item.value);
    }
  };

  // наскрізний номер рядка для стрілок (у групах по порядку, як у found)
  const position = new Map(found.map((item, i) => [item.value, i]));
  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <label className="flex h-11.5 shrink-0 items-center gap-2.5 rounded-full bg-card px-3.5 focus-within:ring-2 focus-within:ring-accent/30 lg:bg-paper">
        <Search className="size-4.5 shrink-0 text-faint" />
        <input
          type="text"
          inputMode="search" // без системного «×» браузера; клавіатура телефона — з кнопкою пошуку
          enterKeyHint="search"
          value={query}
          autoFocus={autoFocus}
          placeholder={searchPlaceholder}
          aria-label="Suchen"
          onKeyDown={handleKey}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          className="min-w-0 flex-1 bg-transparent text-input text-ink outline-none placeholder:text-faint2"
        />
      </label>

      <div className="mt-2 min-h-0 overflow-y-auto">
        {found.length === 0 && <p className="px-2.5 py-4 text-body-sm text-muted">Nichts gefunden für „{query.trim()}“.</p>}
        {groups.map(({ group, items: list }) => (
          <section key={group ?? "-"} className="mt-1">
            {(group || query) && <p className="px-2.5 pt-2 pb-1 text-caption font-extrabold text-faint">{query ? `${found.length} Treffer` : group}</p>}
            <ul role="listbox" aria-label={group ?? "Auswahl"}>
              {list.map((item) => {
                const i = position.get(item.value);
                return <Row key={item.value} item={item} selected={selected.includes(item.value)} active={active === i} onHover={() => setActive(i)} onChoose={() => onChoose(item.value)} />;
              })}
            </ul>
          </section>
        ))}
      </div>

      {keys && (
        <p className="mt-2 flex shrink-0 items-center gap-4 border-t border-hair px-1 pt-2.5 text-caption text-faint">
          <span className="flex items-center gap-1.5">
            <Kbd>↑↓</Kbd> wählen
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> übernehmen
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>Esc</Kbd> schließen
          </span>
        </p>
      )}
    </div>
  );
};

export default PickerList;
