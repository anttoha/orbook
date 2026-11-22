import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { parseList } from "../../shared/utils/karten";
import { CheckIcon } from "../ui/icons";

// ─────────────────────────────────────────────────────────────
// «Liste» (макет 43 handy-06): вставить строки «Wort – Übersetzung». Под полем сразу видно,
// сколько карточек получилось и в какой строке нет разделителя (такие не сохраняются).
// value — { text, cards, errors } (разбор делает shared/utils/karten.parseList)
// ─────────────────────────────────────────────────────────────
const ListInput = ({ value, onChange }) => {
  const t = useT();
  const n = value.cards.length;
  const bad = value.errors[0];
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="stapel-liste" className="sr-only">
        {t("Karten als Liste")}
      </label>
      <textarea
        id="stapel-liste"
        value={value.text}
        onChange={(e) => onChange({ text: e.target.value, ...parseList(e.target.value) })}
        rows={7}
        placeholder={t("the journey – die Reise")}
        aria-invalid={Boolean(bad)}
        className={cn(
          "w-full resize-y rounded-field bg-card px-4 py-3.5 text-input leading-6.5 text-ink outline-none placeholder:text-faint2 focus:ring-2 focus:ring-accent",
          bad && "ring-1 ring-danger/50",
        )}
      />
      {(n > 0 || bad) && (
        <p className="flex items-center justify-between gap-3 text-label font-extrabold">
          <span key={n} className="flex items-center gap-1.5 text-ok motion-safe:animate-count-pop">
            {n > 0 && <CheckIcon className="size-4" />}
            {n > 0 && (n === 1 ? t("1 Karte") : t("{n} Karten", { n }))}
          </span>
          {bad && (
            <span role="alert" className="text-danger motion-safe:animate-deck-shake">
              {value.errors.length === 1 ? t("Zeile {bad}: «–» fehlt", { bad }) : t("{count} Zeilen ohne «–»", { count: value.errors.length })}
            </span>
          )}
        </p>
      )}
    </div>
  );
};

export default ListInput;
