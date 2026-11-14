import { subjectName, weekdayLong, longDate } from "../../shared/utils/format";
import SubjectBadge from "../ui/SubjectBadge";
import Liquid from "../ui/Liquid";

// ─────────────────────────────────────────────────────────────
// Карточка «Für die Stunde» / «Aufgegeben in» над формой (макеты 24 handy-04, 06):
// запись открыли из нажатого урока — дату, урок и предмет не выбираем, а только видим.
// «Ändern» раскрывает обычные поля (onChange). time — начало урока или null
// ─────────────────────────────────────────────────────────────
const LessonCard = ({ title, subject, date, lesson, time, note, onChange }) => (
  <Liquid as="div" refract press={false} className="flex items-center gap-3.5 rounded-card bg-card px-3.5 py-3">
    <SubjectBadge subject={subject} size="lg" />
    <div className="min-w-0 flex-1">
      <p className="text-small font-extrabold tracking-badge text-faint uppercase">{title}</p>
      <p className="truncate text-body font-extrabold text-ink">
        {subjectName(subject)}
        {lesson != null && ` · ${lesson}. Stunde`}
      </p>
      <p className="truncate text-caption text-faint">
        {weekdayLong(date)}, {longDate(date)}
        {time ? ` · ${time}` : ""}
        {note ? ` · ${note}` : ""}
      </p>
    </div>
    {onChange && (
      <button type="button" onClick={onChange} className="shrink-0 rounded-field px-1 text-body-sm font-extrabold text-accent-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
        Ändern
      </button>
    )}
  </Liquid>
);

export default LessonCard;
