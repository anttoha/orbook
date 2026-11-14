import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import AddClassTile from "../components/klassen/AddClassTile";
import SchoolGroup from "../components/klassen/SchoolGroup";
import SideBySide from "../components/klassen/SideBySide";
import Segmented from "../components/ui/Segmented";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useSheet } from "../shared/hooks/useSheet";
import { useT } from "../shared/hooks/useT";
import { useClasses } from "../shared/store/classesStore";
import { usePlanStore } from "../shared/store/planStore";
import { schoolGroups } from "../shared/utils/classes";
import { berlinParts } from "../shared/utils/lessonClock";
import { isWeekend, longDate, mondayOf, weekdayLong } from "../shared/utils/format";
import { currentMonday } from "../shared/utils/lessons";
import RoundButton from "../components/ui/RoundButton";
import PillButton from "../components/ui/PillButton";

const VIEWS = [
  { value: "karten", label: "Karten" },
  { value: "nebeneinander", label: "Nebeneinander" },
];

// ─────────────────────────────────────────────────────────────
// «Meine Klassen» (часть 29, макеты handy-01, handy-06, pc-01): все классы устройства карточками.
// Телефон — карточки столбиком и пунктирная «Klasse hinzufügen»; ПК — классы рядом, в карточке весь день.
// Телефон, вкладка «Nebeneinander» (часть 29c, ?ansicht=nebeneinander): один день, классы колонками.
// На ПК вкладки нет: там карточки и так стоят рядом и показывают весь день.
// Часть 29d: сначала школа (строка → страница школы), под ней её классы (макет handy-20).
// ─────────────────────────────────────────────────────────────
const Klassen = () => {
  const t = useT();
  const list = useClasses((s) => s.list);
  const now = usePlanStore((s) => s.now);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { openSheet } = useSheet();
  const today = berlinParts(now).date;
  const [params, setParams] = useSearchParams();
  const side = !isDesktop && params.get("ansicht") === "nebeneinander";
  const [picked, setPicked] = useState(null); // выбранный день во «Nebeneinander»; null — сегодня
  const date = picked ?? (isWeekend(today) ? currentMonday(today) : today); // в выходные — понедельник

  return (
    <section className="flex flex-1 flex-col gap-3.5 pb-6">
      <header className="mb-1 flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-hint font-extrabold text-faint">
            {weekdayLong(side ? date : today)} · {longDate(side ? date : today)}
          </p>
          <h1 className="truncate text-title text-ink">{t("Meine Klassen")}</h1>
        </div>
        {isDesktop ? (
          <PillButton glass="filled" size="lg" onClick={() => openSheet("klasseneu")} className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-accent px-5 text-row font-extrabold text-on-accent">
            <Plus className="size-4.5" /> {t("Klasse hinzufügen")}
          </PillButton>
        ) : (
          <RoundButton onClick={() => openSheet("klasseneu")} aria-label={t("Klasse hinzufügen")}>
            <Plus className="size-4.5" />
          </RoundButton>
        )}
      </header>

      {/* второй класс есть — можно смотреть их рядом */}
      {!isDesktop && list.length > 1 && <Segmented label="Ansicht" options={VIEWS} value={side ? "nebeneinander" : "karten"} onChange={(view) => setParams(view === "nebeneinander" ? { ansicht: view } : {}, { replace: true })} />}

      {side ? (
        <SideBySide date={date} monday={mondayOf(date)} today={today} onPickDate={setPicked} />
      ) : (
        <>
          {schoolGroups(list).map((group, i, groups) => (
            <SchoolGroup key={group.key} group={group} today={today} wide={isDesktop} start={groups.slice(0, i).reduce((n, g) => n + g.items.length, 0)} />
          ))}
          {!isDesktop && <AddClassTile />}
        </>
      )}
    </section>
  );
};

export default Klassen;
