import { Plus } from "lucide-react";
import AddClassTile from "../components/klassen/AddClassTile";
import ClassCard from "../components/klassen/ClassCard";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useSheet } from "../shared/hooks/useSheet";
import { useT } from "../shared/hooks/useT";
import { useClasses } from "../shared/store/classesStore";
import { usePlanStore } from "../shared/store/planStore";
import { berlinParts } from "../shared/utils/lessonClock";
import { longDate, weekdayLong } from "../shared/utils/format";

// ─────────────────────────────────────────────────────────────
// «Meine Klassen» (часть 29, макеты handy-01, handy-06, pc-01): все классы устройства карточками.
// Телефон — карточки столбиком и пунктирная «Klasse hinzufügen»; ПК — классы рядом, в карточке весь день.
// Вкладка «Nebeneinander» появится в части 29c.
// ─────────────────────────────────────────────────────────────
const Klassen = () => {
  const t = useT();
  const list = useClasses((s) => s.list);
  const now = usePlanStore((s) => s.now);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { openSheet } = useSheet();
  const today = berlinParts(now).date;

  return (
    <section className="flex flex-1 flex-col gap-3.5 pb-6">
      <header className="mb-1 flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-hint font-extrabold text-faint">
            {weekdayLong(today)} · {longDate(today)}
          </p>
          <h1 className="truncate text-title text-ink">{t("Meine Klassen")}</h1>
        </div>
        {isDesktop ? (
          <button type="button" onClick={() => openSheet("klasseneu")} className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-accent px-5 text-row font-extrabold text-on-accent">
            <Plus className="size-4.5" /> {t("Klasse hinzufügen")}
          </button>
        ) : (
          <button type="button" onClick={() => openSheet("klasseneu")} aria-label={t("Klasse hinzufügen")} className="grid size-9.5 shrink-0 place-items-center rounded-full bg-card text-ink">
            <Plus className="size-4.5" />
          </button>
        )}
      </header>

      <div className="grid gap-3.5 lg:grid-cols-2 xl:grid-cols-3">
        {list.map((item) => (
          <ClassCard key={item.id} item={item} today={today} wide={isDesktop} />
        ))}
      </div>
      {!isDesktop && <AddClassTile />}

      <p className="mt-auto pt-6 text-center text-caption text-faint lg:mt-0 lg:pt-1 lg:text-left">
        {t(isDesktop ? "Karte anklicken öffnet den Plan der Klasse · Regler = Einstellungen der Klasse" : "Karte antippen öffnet den Plan · Regler = Einstellungen der Klasse")}
      </p>
    </section>
  );
};

export default Klassen;
