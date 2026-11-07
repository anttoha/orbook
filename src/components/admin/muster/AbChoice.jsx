import { ArrowLeftRight, Info, Layers } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { kwStrip, weekForMode } from "../../../shared/utils/musterEditor";
import { abLetter } from "../../../shared/utils/muster";
import { CheckIcon } from "../../ui/icons";

// Варіанти muster.abMode (сервер: school | swap | none)
const MODES = [
  { value: "school", icon: Info, title: "Laut Plan der Schule", hint: (letter) => (letter ? `Diese Woche ist ${letter}` : "Der Plan sagt nichts über A/B") },
  { value: "swap", icon: ArrowLeftRight, title: "A und B tauschen", hint: (letter) => `Falls der Plan falsch zählt: diese Woche ist ${letter ?? "B"}` },
  { value: "none", icon: Layers, title: "Keine Wochen A und B", hint: () => "Jede Woche gleich · ein Muster für alle" },
];

// ─────────────────────────────────────────────────────────────
// «Woche A oder B?» (макет 19b handy-05, pc-02): три варіанти + смужка «So zählt ORBook».
//   mode — вибраний зараз, schoolWeek — як рахує школа (1/2/null), today — для номерів KW
//   onCard — усередині білої картки (випадне вікно на ПК): плитки пісочні, а не білі
// ─────────────────────────────────────────────────────────────
const AbChoice = ({ mode, schoolWeek, today, busy, onCard = false, onChange }) => (
  <div className="flex flex-col gap-4">
    <div role="radiogroup" aria-label="Wochen A und B" className={cn("flex flex-col rounded-card p-1", !onCard && "bg-card")}>
      {MODES.map(({ value, icon: Icon, title, hint }) => {
        const on = value === mode;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={busy}
            onClick={() => !on && onChange(value)}
            className={cn("flex items-center gap-3 rounded-block px-3 py-3 text-left transition-colors", on ? "bg-tint" : "hover:bg-paper")}
          >
            <Icon className={cn("size-4.5 shrink-0", on ? "text-accent-ink" : "text-muted")} />
            <span className="min-w-0 flex-1">
              <span className={cn("block text-row", on ? "font-bold text-accent-ink" : "text-ink")}>{title}</span>
              <span className={cn("block text-caption", on ? "text-muted" : "text-faint")}>{hint(abLetter(weekForMode(value, schoolWeek)))}</span>
            </span>
            {on && <CheckIcon className="size-4.5 shrink-0 text-accent-ink" />}
          </button>
        );
      })}
    </div>
    {mode !== "none" && (
      <div>
        <p className="mb-2 text-hint font-extrabold text-faint">So zählt ORBook</p>
        <ol className="grid grid-cols-5 gap-2">
          {kwStrip(today, weekForMode(mode, schoolWeek)).map(({ kw, letter }, i) => (
            <li key={kw} className={cn("flex flex-col items-center rounded-tile py-1.5", i === 0 ? "bg-accent text-on-accent" : cn("text-accent-ink", onCard ? "bg-sand" : "bg-card"))}>
              <span className={cn("text-micro font-bold", i === 0 ? "opacity-80" : "text-faint")}>KW {kw}</span>
              <span className="text-subhead font-black">{letter ?? "–"}</span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-caption text-faint">Gilt überall: Buchstabe in Woche und Tag, Muster.</p>
      </div>
    )}
  </div>
);

export default AbChoice;
