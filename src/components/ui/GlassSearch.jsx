import { GlassInput } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";
import { layoutOnly } from "../../shared/utils/glassLayout";

// ─────────────────────────────────────────────────────────────
// Поле поиска «таблеткой» (Tests, Materialien, выбор курса, язык, ⌘K, админка).
// «Glas» (часть 30a): поле библиотеки liquid-glass — со своей лупой и крестиком, тянется при нажатии.
// Иначе — children: прежняя разметка поля как есть.
// value / onValue(текст) — то же, что у поля внутри; inputProps — остальные свойства <input> (onKeyDown, autoFocus …);
// className — классы раскладки обёртки (ширина), из них в «Glas» идут только ширина и отступы
// ─────────────────────────────────────────────────────────────
const GlassSearch = ({ value, onValue, placeholder, label, className, inputProps, children }) => {
  const glass = useGlass();
  if (!glass) return children;
  return (
    <GlassInput
      type="search"
      value={value}
      onChange={(event) => onValue(event.target.value)}
      onClear={() => onValue("")}
      placeholder={placeholder}
      aria-label={label ?? placeholder}
      tint="var(--color-accent)"
      className={layoutOnly(className)}
      {...inputProps}
    />
  );
};

export default GlassSearch;
