import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNotenZiel } from "../../shared/hooks/useNotenZiel";
import { useNotenStore } from "../../shared/store/notenStore";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { fachClasses } from "../../shared/utils/lessons";
import { badgeOf, dayDate, gradeKey, nextExamOf, weightOf } from "../../shared/utils/noten";
import { translate } from "../../shared/i18n/translate";
import { FlagIcon } from "../ui/icons";
import { zielInfo, zielSeries } from "../../shared/utils/notenZiel";
import DateTile from "./DateTile";
import GradePill from "./GradePill";
import NewBadge from "./NewBadge";
import SchnittCard from "./SchnittCard";
import ZielCard from "./ZielCard";
import ZielSheet from "./ZielSheet";

// «×2» в подписи, если оценка весит больше одной; «×0,5» — как есть
const weightText = (g) => (weightOf(g) === 1 ? null : translate("zählt ×{n}", { n: String(weightOf(g)).replace(".", ",") }));

// Подпись справа в карточке Schnitt: «4 Noten», на ПК ещё «Klassenarbeit zählt ×2»
function schnittCaption(subject, wide) {
  const count = subject.list.length === 1 ? translate("1 Note") : translate("{n} Noten", { n: subject.list.length });
  const heavy = subject.list.find((g) => weightOf(g) > 1);
  return wide && heavy?.weightLabel ? `${count} · ${heavy.weightLabel} ${weightText(heavy)}` : count;
}

// Строка оценки: [16 SEP] Klassenarbeit · «Di 16.09. · zählt ×2»   (neu) [3+]
const GradeRow = ({ grade, isNew }) => {
  const t = useT();
  return (
    <li className="flex items-center gap-3 py-3">
      <DateTile iso={grade.date} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-row font-extrabold text-ink">{grade.note || grade.kind || t("Note")}</span>
        <span className="block truncate text-caption text-faint">{[dayDate(grade.date), weightText(grade)].filter(Boolean).join(" · ")}</span>
      </span>
      {isNew && <NewBadge />}
      <GradePill text={grade.grade ?? "–"} value={grade.value} />
    </li>
  );
};

// «Nächster Test · Fr 19.09.» — ближайшая Klausur этого предмета (нет — строки нет)
const NextTest = ({ subject }) => {
  const t = useT();
  const exam = nextExamOf(usePlanStore((s) => s.exams), subject);
  if (!exam) return null;
  return (
    <Link to={`/testen?sheet=klausur&id=${exam.id}`} className="flex items-center gap-3 rounded-card bg-card px-3.5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:bg-sand">
      <FlagIcon className="size-5 shrink-0 text-muted" />
      <span className="min-w-0 flex-1 text-row text-ink">{t("Nächster Test")}</span>
      <span className="shrink-0 text-body-sm text-faint">{dayDate(exam.date)}</span>
      <ChevronRight className="size-4 shrink-0 text-faint2" />
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────
// Предмет (макет 42 handy-02; на ПК — правая колонка pc-01): Schnitt с графиком, цель, оценки.
// Цель — своя в каждом полугодии (half); шторка «Mein Ziel» живёт здесь же. wide — колонка ПК
// ─────────────────────────────────────────────────────────────
const FachView = ({ subject, fresh, half, wide = false }) => {
  const t = useT();
  const [zielOpen, setZielOpen] = useState(false);
  const { goal } = useNotenZiel(half, subject.code);
  const markSeen = useNotenStore((s) => s.markSeen);
  const overrides = useUserStore((s) => s.colorOverrides);
  // «neu» видно, пока смотришь предмет; ушёл с него (назад или другой предмет на ПК) — уже не новые
  useEffect(() => () => markSeen(subject.code), [subject.code, markSeen]);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3.5">
        <SchnittCard
          average={subject.average}
          ziel={goal?.ziel}
          caption={schnittCaption(subject, wide)}
          points={zielSeries(subject.list)}
          colorClass={fachClasses(badgeOf(subject.code), overrides)}
          wide={wide}
        />
        {subject.list.length > 0 && <ZielCard info={zielInfo(subject.list, goal)} onOpen={() => setZielOpen(true)} />}
      </div>
      <section>
        <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Noten")}</h2>
        <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
          {subject.list.map((g, i) => (
            <GradeRow key={`${g.date}-${i}`} grade={g} isNew={fresh.includes(gradeKey(subject.code, g))} />
          ))}
        </ul>
      </section>
      <NextTest subject={subject} />
      <ZielSheet open={zielOpen} onClose={() => setZielOpen(false)} half={half} subject={subject} average={subject.average} />
    </div>
  );
};

export default FachView;
