import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { useT } from "../../shared/hooks/useT";
import { useLanguage } from "../../shared/store/languageStore";
import { cn } from "../../shared/utils/cn";
import { filterLanguages, LANGUAGES } from "../../shared/utils/languages";
import Flag from "../ui/Flag";
import { menuContentClass } from "../ui/menuStyles";
import GlassSearch from "../ui/GlassSearch";
import PillButton from "../ui/PillButton";

// Выбор языка (макет 28): поле «флаг · язык ⌄», под ним список с поиском.
// Popover, а не DropdownMenu: в меню Radix буквы уходят в «быстрый переход» и поле поиска не работает
const LanguageSelect = () => {
  const t = useT();
  const lang = useLanguage((s) => s.lang);
  const setLang = useLanguage((s) => s.setLang);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const hits = filterLanguages(query);

  const choose = (code) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setQuery(""); // список всегда открывается с пустым поиском
      }}
    >
      <Popover.Trigger asChild>
        <PillButton glass="glass" size="sm" aria-label={t("Sprache")} className="group inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-hair bg-sand pr-2.5 pl-2.5 text-label font-extrabold text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/40 data-[state=open]:border-accent">
          <Flag code={current.flag} className="size-5" />
          <span className="min-w-24 truncate text-left">{current.name}</span>
          <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </PillButton>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content align="end" sideOffset={6} collisionPadding={12} className={cn(menuContentClass, "w-57.5 p-2")}>
          <GlassSearch value={query} onValue={setQuery} placeholder={t("Sprache suchen")} inputProps={{ autoFocus: true, onKeyDown: (event) => event.key === "Enter" && hits.length === 1 && choose(hits[0].code) }}>
            <label className="flex h-9.5 items-center gap-2 rounded-full bg-sand px-3">
              <Search aria-hidden="true" className="size-4 shrink-0 text-faint" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && hits.length === 1 && choose(hits[0].code)}
                placeholder={t("Sprache suchen")}
                aria-label={t("Sprache suchen")}
                className="min-w-0 flex-1 bg-transparent text-body-sm text-ink outline-none placeholder:text-faint"
              />
            </label>
          </GlassSearch>
          <ul className="mt-1.5">
            {hits.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  onClick={() => choose(l.code)}
                  aria-current={l.code === lang ? "true" : undefined}
                  className={cn(
                    "flex h-11.5 w-full cursor-pointer items-center gap-3 rounded-tile px-3 text-left text-body-sm text-ink outline-none hover:bg-sand focus-visible:bg-sand",
                    l.code === lang && "bg-sand font-extrabold",
                  )}
                >
                  <Flag code={l.flag} />
                  <span className="flex-1">{l.name}</span>
                  {l.code === lang && <Check aria-hidden="true" className="size-4 text-accent-ink" />}
                </button>
              </li>
            ))}
            {hits.length === 0 && <li className="px-3 py-3.5 text-center text-body-sm text-faint">{t("Nichts gefunden")}</li>}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default LanguageSelect;
