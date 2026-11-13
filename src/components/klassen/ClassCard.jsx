import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { useClassToday } from "../../shared/hooks/useClassToday";
import { useSheet } from "../../shared/hooks/useSheet";
import { useT } from "../../shared/hooks/useT";
import { useClasses } from "../../shared/store/classesStore";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { classPrefs, classSubtitle, classTitle, daySummary, myLessons, mySubjectCodes, nextClassExam } from "../../shared/utils/classes";
import { cn } from "../../shared/utils/cn";
import ClassBadge from "../ui/ClassBadge";
import { FlagIcon } from "../ui/icons";
import ClassDayList from "./ClassDayList";
import GoneNotice from "./GoneNotice";
import TodayStrip from "./TodayStrip";

// ─────────────────────────────────────────────────────────────
// Карточка класса на «Meine Klassen» (макет 29 handy-01, pc-01).
// Нажатие на карточку открывает план класса, ползунки — «Klasse einstellen».
// Кнопка на всю карточку лежит под содержимым, а ползунки — над ней: вложенных кнопок нет
// ─────────────────────────────────────────────────────────────
// inSchool — карточка стоит под строкой школы (часть 29d): в подписи только «Klasse 9b»
const ClassCard = ({ item, today, wide, inSchool = false }) => {
  const t = useT();
  const navigate = useNavigate();
  const { openSheet } = useSheet();
  const openClass = usePlanStore((s) => s.openClass);
  const [reload, setReload] = useState(0);
  const data = useClassToday(item.gone ? null : item.id, today, reload);

  const open = () => {
    navigate("/");
    openClass(item.id);
  };

  return (
    <article className="relative h-full rounded-card bg-card p-3.5">
      {!item.gone && <button type="button" onClick={open} aria-label={`${classTitle(item, t)} ${t("öffnen")}`} className="absolute inset-0 rounded-card outline-none focus-visible:ring-2 focus-visible:ring-accent/50" />}

      <header className="pointer-events-none relative flex items-center gap-3">
        <ClassBadge name={item.name} color={item.color} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-subhead text-ink">{classTitle(item, t)}</h2>
          <p className="truncate text-label text-faint">{inSchool ? `${t("Klasse")} ${item.name}` : classSubtitle(item)}</p>
        </div>
        <button type="button" onClick={() => openSheet("klasse", { id: item.id })} aria-label={t("Klasse einstellen")} className="pointer-events-auto grid size-8.5 shrink-0 place-items-center rounded-full bg-sand text-ink">
          <SlidersHorizontal className="size-4" />
        </button>
      </header>

      {item.gone ? <GoneNotice item={item} /> : <CardBody data={data} item={item} today={today} wide={wide} onRetry={() => setReload((n) => n + 1)} />}
    </article>
  );
};

// Сегодня: строка уроков, главное одной фразой, ближайший тест; ошибка — «Nochmal»
const CardBody = ({ data, item, today, wide, onRetry }) => {
  const t = useT();
  const activeId = useClasses((s) => s.activeId);
  const prefs = useUserStore(useShallow((s) => classPrefs(s, item.id, activeId))); // «Meine Kurse» этого класса
  const lessonTimes = usePlanStore((s) => s.meta?.lessonTimes);

  if (data.status === "loading") return <BodySkeleton />;
  if (data.status === "error") {
    return (
      <div className="relative mt-3.5 flex items-center justify-between gap-3 rounded-field bg-paper px-3.5 py-3">
        <p className="text-label text-muted">{t("Plan kommt gerade nicht an")}</p>
        <button type="button" onClick={onRetry} className="shrink-0 rounded-full bg-sand px-3.5 py-1.5 text-label font-extrabold text-ink">
          {t("Nochmal")}
        </button>
      </div>
    );
  }

  const lessons = myLessons(data.day, data.courses, prefs);
  const summary = daySummary(data.day, lessons, t);
  const exam = nextClassExam(data.exams, mySubjectCodes(data.courses, prefs), today);
  const offline = data.status === "offline" || data.status === "unavailable";

  return (
    <div className="pointer-events-none relative mt-3.5">
      <div className="mb-2 flex h-5 items-center justify-between gap-2 text-micro font-extrabold tracking-wide text-faint uppercase">
        <span className="truncate">
          {t("Heute")}
          {lessons.length > 0 && ` · ${lessons.length} ${t(lessons.length === 1 ? "Stunde" : "Stunden")}`}
          {offline && ` · ${t("Offline")}`}
        </span>
        {exam && (
          <span className="flex shrink-0 items-center gap-1.5 text-label font-extrabold tracking-normal text-accent-ink normal-case">
            <FlagIcon className="size-3.5" /> {exam.text}
          </span>
        )}
      </div>
      {lessons.length > 0 && <TodayStrip lessons={lessons} />}
      {summary && (
        <p className={cn("flex items-center gap-1 text-label", lessons.length > 0 && "mt-2.5", wide && "lg:mt-3")}>
          <span className="min-w-0 flex-1 truncate">
            <span className={cn("font-bold", { danger: "text-danger", ok: "text-ok", muted: "text-muted" }[summary.tone])}>{summary.lead}</span>
            {summary.rest && <span className="text-muted"> · {summary.rest}</span>}
          </span>
          <ChevronRight className="size-4 shrink-0 text-faint2 lg:hidden" />
        </p>
      )}
      {wide && <ClassDayList lessons={lessons} lessonTimes={lessonTimes} />}
    </div>
  );
};

// Загрузка (макет handy-11): серые клетки и строка
const BodySkeleton = () => (
  <div className="mt-3.5 animate-pulse space-y-2.5" aria-hidden="true">
    <div className="h-3 w-28 rounded-tag bg-skeleton" />
    <div className="flex gap-1.5">
      {Array.from({ length: 7 }, (_, i) => (
        <span key={i} className="h-9 flex-1 rounded-tile bg-skeleton" />
      ))}
    </div>
    <div className="h-3 w-48 rounded-tag bg-skeleton" />
  </div>
);

export default ClassCard;
