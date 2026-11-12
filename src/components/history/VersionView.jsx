import { History } from "lucide-react";
import { useUserStore } from "../../shared/store/userStore";
import { changedSince, versionLessonKey, versionNote } from "../../shared/utils/dayHistory";
import LessonRow from "../day/LessonRow";
import Badge from "../ui/Badge";

// ─────────────────────────────────────────────────────────────
// Старая Fassung (часть 26, макет handy-03 / pc-02): день таким, каким он был тогда.
// Под уроками, которые сейчас другие, — сиреневая строка «JETZT ANDERS · fällt aus».
// version — эта Fassung, newer — следующая за ней (для подсказки «… hat er sich geändert»), current — текущий план
// visible(lesson) — фильтр «Meine Kurse» / «Alle Kurse»
// ─────────────────────────────────────────────────────────────
const VersionView = ({ version, newer, current, visible, today }) => {
  const overrides = useUserStore((s) => s.colorOverrides);
  const marks = changedSince(version, current);
  const lessons = (version.lessons ?? []).filter(visible);

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-start gap-2.5 rounded-field bg-sand px-3.25 py-3 text-label text-muted">
        <History className="mt-px size-4 shrink-0" />
        <span>{versionNote(version, newer, today)}</span>
      </p>
      {lessons.length === 0 && <p className="text-label text-faint">In dieser Fassung gab es für dich keine Stunden.</p>}
      <ul className="flex flex-col gap-2">
        {lessons.map((lesson, i) => {
          const key = versionLessonKey(lesson);
          const now = marks.get(key);
          return (
            <li key={key} style={{ animationDelay: `${i * 40}ms` }} className="motion-safe:animate-rise-in">
              <LessonRow lesson={lesson} date={null} overrides={overrides} />
              {now && (
                <p className="mx-3 flex items-center gap-2 rounded-b-field bg-tint px-3 pt-2 pb-1.5 text-caption text-accent-ink">
                  <Badge variant="exam" className="motion-safe:animate-badge-pop">
                    Jetzt anders
                  </Badge>
                  <span className="min-w-0 truncate">{now}</span>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default VersionView;
