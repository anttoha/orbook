import Kbd from "../ui/Kbd";
import Sheet from "../ui/Sheet";
import { useT } from "../../shared/hooks/useT";

// Клавіші з макету 52. Кожна клавіша — окрема плашка: «⌘» і «K» поруч.
const NAVIGATION = [
  ["Vorige / nächste Woche", ["←", "→"]],
  ["Heute", ["T"]],
  ["Woche", ["W"]],
  ["Tagesansicht", ["D"]],
  ["Liste", ["L"]],
  ["Zeitleiste", ["Z"]],
  ["Seitenleiste ein/aus", ["⌘", "B"]],
];
const ACTIONS = [
  ["Suchen", ["⌘", "K"]],
  ["Test eintragen", ["K"]],
  ["Notiz", ["N"]],
  ["Teilen", ["S"]],
  ["Plan neu laden", ["R"]],
  ["Drucken", ["⌘", "P"]],
  ["Fenster schließen", ["Esc"]],
];

// Колонка: підпис і рядки «дія — клавіші», між рядками тонка риска
const Column = ({ title, rows }) => (
  <section>
    <h3 className="text-hint font-extrabold text-muted">{title}</h3>
    <ul className="mt-1.5">
      {rows.map(([label, keys]) => (
        <li key={label} className="flex h-10.25 items-center justify-between gap-3 border-b border-hair last:border-0">
          <span className="text-body-sm text-ink">{label}</span>
          <span className="flex gap-1">
            {keys.map((key) => (
              <Kbd key={key}>{key}</Kbd>
            ))}
          </span>
        </li>
      ))}
    </ul>
  </section>
);

// ─────────────────────────────────────────────────────────────
// Вікно «Tastenkürzel» (макет 52): відкривається клавішею «?» або плиткою в «Einstellungen».
// ─────────────────────────────────────────────────────────────
const ShortcutsSheet = ({ open, onClose }) => {
  const t = useT();
  return (
  <Sheet open={open} onClose={onClose} desktop="wide" eyebrow={t("Drück ? für diese Hilfe")} title={t("Tastenkürzel")}>
    <div className="grid gap-x-8 gap-y-5 lg:grid-cols-2">
      <Column title={t("Navigation")} rows={NAVIGATION} />
      <Column title={t("Aktionen")} rows={ACTIONS} />
    </div>
  </Sheet>
);
};

export default ShortcutsSheet;
