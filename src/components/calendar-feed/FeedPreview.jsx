import { cn } from "../../shared/utils/cn";
import { useT } from "../../shared/hooks/useT";

// Пример дня в чужом календаре (макет handy-01): так придут тест, урок, замена и отменённый урок.
// Это картинка-объяснение, не данные класса — поэтому текст постоянный
const LESSONS = [
  { time: "07:30", title: "Deutsch", place: "Raum 102", color: "deutsch" },
  { time: "08:20", title: "Mathe → Raum B12", place: "Vertretung · Kle statt Mü", color: "mathe" },
  { time: "09:25", title: "Englisch fällt aus" },
];

// Классы цветов предметов — целиком, чтобы Tailwind их нашёл
const COLORS = {
  deutsch: { box: "bg-deutsch-tint text-deutsch-text", bar: "bg-deutsch-solid" },
  mathe: { box: "bg-mathe-tint text-mathe-text", bar: "bg-mathe-solid" },
};

const FeedPreview = () => {
  const t = useT();
  return (
    <figure className="flex flex-col gap-2.5 rounded-card bg-sand p-4" aria-label={t("So sieht es im Kalender aus")}>
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-body-sm font-extrabold text-ink">{t("Do, 18. September")}</span>
        <span className="text-caption font-bold text-faint">ORBook · 9b</span>
      </figcaption>
      <p className="rounded-tile bg-mathe-solid px-3 py-1.5 text-body-sm font-extrabold text-on-accent">{t("Test Mathe · 2. Stunde")}</p>
      <ul className="flex flex-col gap-2">
        {LESSONS.map((lesson) => (
          <PreviewLesson key={lesson.time} {...lesson} />
        ))}
      </ul>
    </figure>
  );
};

const PreviewLesson = ({ time, title, place, color }) => {
  const t = useT();
  const look = COLORS[color];
  return (
    <li className="flex items-stretch gap-3">
      <span className="w-11 shrink-0 pt-2 text-label font-bold text-faint tabular-nums">{time}</span>
      <span className={cn("flex min-w-0 flex-1 overflow-hidden rounded-thumb", look ? look.box : "bg-card")}>
        <span className={cn("w-1 shrink-0", look ? look.bar : "bg-faint2")} aria-hidden="true" />
        <span className="flex min-w-0 flex-col justify-center px-3 py-1.5">
          <span className={cn("truncate text-body-sm font-extrabold", !look && "font-bold text-faint line-through")}>{t(title)}</span>
          {place && <span className="truncate text-caption font-semibold">{t(place)}</span>}
        </span>
      </span>
    </li>
  );
};

export default FeedPreview;
