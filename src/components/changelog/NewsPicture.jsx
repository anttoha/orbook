import { useEffect, useState } from "react";
import { cn } from "../../shared/utils/cn";
import Switch from "../ui/Switch";

// Картинка к записи — маленькая «сценка» из настоящих элементов приложения, а не скриншот:
// она сама меняет цвета в тёмной теме. Ключ — поле picture у записи в shared/changelog.js.
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// История в трёх кадрах: сначала только мои курсы, потом переключатель включается — и «чужой» Physik проявляется
const AlleKurse = () => {
  const [on, setOn] = useState(reduceMotion); // без анимаций сразу показываем итог
  useEffect(() => {
    if (on) return undefined;
    const id = setTimeout(() => setOn(true), 900);
    return () => clearTimeout(id);
  }, [on]);

  return (
    <div aria-hidden="true" className="rounded-card bg-tint p-3.5 motion-safe:animate-pop-in">
      <div className="flex items-center justify-between">
        <span className="text-label font-bold text-accent-ink">Alle Kurse zeigen</span>
        <Switch checked={on} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <span className="h-10 rounded-field bg-mathe-tint px-2 pt-1.5 text-hint font-extrabold text-mathe-text">Mathe</span>
        {/* gestrichelt = Kurs, den du nicht hast */}
        <span
          className={cn(
            "h-10 rounded-field border border-dashed border-faint2 px-2 pt-1.5 text-hint font-extrabold text-faint transition-[opacity,scale] duration-500 ease-soft motion-reduce:transition-none",
            on ? "scale-100 opacity-100" : "scale-90 opacity-0",
          )}
        >
          Physik
        </span>
        <span className="h-10 rounded-field bg-englisch-tint px-2 pt-1.5 text-hint font-extrabold text-englisch-text">Englisch</span>
      </div>
    </div>
  );
};

// «Start» (часть 30c, макет handy-14): большой блок «Jetzt» и два маленьких справа
const Start = () => (
  <div aria-hidden="true" className="grid grid-cols-3 gap-1.5 rounded-card bg-tint p-2.5 motion-safe:animate-pop-in">
    <div className="col-span-2 row-span-2 flex flex-col gap-1.5 rounded-field bg-card p-3">
      <span className="text-micro font-extrabold tracking-wide text-accent-ink uppercase">Jetzt · 2. Stunde</span>
      <span className="text-body font-black text-ink">Mathe</span>
      <span className="mt-auto h-1 overflow-hidden rounded-full bg-sand">
        <span className="block h-full w-3/5 rounded-full bg-mathe-solid" />
      </span>
    </div>
    <span className="rounded-field bg-card p-2.5 text-caption font-extrabold text-ink">Tests · Fr</span>
    <span className="rounded-field bg-card p-2.5 text-caption font-extrabold text-ink">3 Aufgaben</span>
  </div>
);

const PICTURES = { alleKurse: AlleKurse, start: Start };

const NewsPicture = ({ name }) => {
  const Picture = PICTURES[name];
  return Picture ? <Picture /> : null; // неизвестный ключ или нет картинки — блок просто не показываем
};

export default NewsPicture;
