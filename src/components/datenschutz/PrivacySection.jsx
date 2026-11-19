import { ChevronDown } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import Liquid from "../ui/Liquid";
import { useT } from "../../shared/hooks/useT";

// Один раздел «Genauer» на странице Datenschutz. Свёрнут — только заголовок; раскрытие — как у версий в «Neuigkeiten».
const PrivacySection = ({ section, open, onToggle }) => {
  const t = useT(); // абзацы переводятся целиком: ключ — немецкий абзац из shared/datenschutz.js
  return (
    <Liquid as="li" refract press={false} className="rounded-card bg-card">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 rounded-card px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
        <span className="min-w-0 flex-1 text-body font-extrabold text-ink">{t(section.title)}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-faint2 transition-transform duration-300 ease-soft motion-reduce:transition-none", open && "rotate-180")} />
      </button>
      {/* Плавная высота 0fr → 1fr; закрытый текст не ловит Tab (inert), но остаётся в разметке для поиска по странице */}
      <div className={cn("grid transition-[grid-template-rows] duration-350 ease-soft motion-reduce:transition-none", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")} inert={!open}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 border-t border-hair px-4 py-4 text-nav leading-5.25 text-muted">
            {section.intro.map((text) => (
              <p key={text}>{t(text)}</p>
            ))}
            {section.rows && (
              <dl className="flex flex-col gap-2.5">
                {section.rows.map(([term, text]) => (
                  <div key={term}>
                    <dt className="font-bold text-ink">{t(term)}</dt>
                    <dd>{t(text)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>
    </Liquid>
  );
};

export default PrivacySection;
