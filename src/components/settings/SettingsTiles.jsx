import { ChevronRight, Keyboard } from "lucide-react";
import { Link } from "react-router-dom";
import { settingsSections } from "../../shared/constants/constants";
import { useSyncAllowed } from "../../shared/hooks/useNotesSync";
import { useSheet } from "../../shared/hooks/useSheet";
import { useTheme } from "../../shared/hooks/useTheme";
import { usePlanStore } from "../../shared/store/planStore";
import { useSyncStore } from "../../shared/store/syncStore";
import { useUserStore } from "../../shared/store/userStore";
import { courseCount, visibleSubjects } from "../../shared/utils/courses";
import { isTeacher } from "../../shared/utils/examRules";
import { appearanceHint, coursesHint, editorHint, sectionVisible, subjectsHint, syncHint } from "../../shared/utils/settings";

// Вміст плитки: кругла іконка, назва, підпис, стрілка
const TileBody = ({ icon: Icon, label, hint }) => (
  <>
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-accent">
      <Icon className="size-4.5" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-body font-bold text-ink">{label}</span>
      <span className="block min-h-4 truncate text-hint text-faint">{hint}</span>
    </span>
    <ChevronRight className="size-4 shrink-0 text-faint2" />
  </>
);

const tile = "flex h-17 items-center gap-3.5 rounded-card bg-card px-4 text-left transition-colors hover:bg-card/70";

// Підписи під плитками: збираємо зі сховищ, рахують чисті функції з shared/utils/settings.js
const useHints = () => {
  const me = usePlanStore((s) => s.me);
  const courses = usePlanStore((s) => s.courses);
  const metaSubjects = usePlanStore((s) => s.meta?.subjects);
  const picked = useUserStore((s) => s.picked);
  const hiddenRequired = useUserStore((s) => s.hiddenRequired);
  const startView = useUserStore((s) => s.startView);
  const theme = useTheme((s) => s.theme);
  const syncCode = useSyncStore((s) => s.code);
  const lastSyncAt = useSyncStore((s) => s.lastSyncAt);

  return {
    courses: coursesHint(courseCount(courses, picked, hiddenRequired)),
    appearance: appearanceHint(theme, startView),
    subjects: subjectsHint(visibleSubjects(courses, picked, metaSubjects, hiddenRequired).length), // як на сторінці «Fachfarben»
    sync: syncHint(syncCode, lastSyncAt),
    editor: editorHint(me?.editor),
    privacy: "Keine Konten, kein Tracking",
  };
};

// ─────────────────────────────────────────────────────────────
// «Einstellungen · Übersicht» на ПК (макет 22): плитки у дві колонки.
// Остання плитка — «Tastenkürzel», вона відкриває вікно, а не сторінку.
// ─────────────────────────────────────────────────────────────
const SettingsTiles = () => {
  const hints = useHints();
  const syncAllowed = useSyncAllowed();
  const teacher = usePlanStore((s) => isTeacher(s.me));
  const { openSheet } = useSheet();

  return (
    <ul className="grid grid-cols-2 gap-3">
      {settingsSections
        .filter((section) => section.hint && sectionVisible(section, { syncAllowed, teacher }))
        .map((section) => (
          <li key={section.to}>
            <Link to={section.to} className={tile}>
              <TileBody icon={section.icon} label={section.label} hint={hints[section.hint]} />
            </Link>
          </li>
        ))}
      <li>
        <button type="button" onClick={() => openSheet("tasten")} className={`${tile} w-full`}>
          <TileBody icon={Keyboard} label="Tastenkürzel" hint="⌘K, T, ←, →, N …" />
        </button>
      </li>
    </ul>
  );
};

export default SettingsTiles;
