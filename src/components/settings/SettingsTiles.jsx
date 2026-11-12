import { ChevronRight, Info, Keyboard, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { settingsGroups, settingsSections } from "../../shared/constants/constants";
import { useSyncAllowed } from "../../shared/hooks/useNotesSync";
import { useSheet } from "../../shared/hooks/useSheet";
import { useTheme } from "../../shared/hooks/useTheme";
import { usePlanStore } from "../../shared/store/planStore";
import { useSyncStore } from "../../shared/store/syncStore";
import { useUserStore } from "../../shared/store/userStore";
import { changelog } from "../../shared/changelog";
import { courseCount, visibleSubjects } from "../../shared/utils/courses";
import { newsDate } from "../../shared/utils/changelog";
import { isTeacher } from "../../shared/utils/examRules";
import NewBadge from "../changelog/NewBadge";
import { usePushStore } from "../../shared/store/pushStore";
import { prefsSummary } from "../../shared/utils/push";
import { appearanceHint, coursesHint, editorHint, sectionVisible, subjectsHint, syncHint } from "../../shared/utils/settings";

// Вміст плитки: кругла іконка, назва, підпис, стрілка
const TileBody = ({ icon: Icon, label, hint, badge }) => (
  <>
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-accent">
      <Icon className="size-4.5" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-2 text-body font-bold text-ink">
        <span className="truncate">{label}</span>
        {badge}
      </span>
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
  const pushOn = usePushStore((s) => s.enabled);
  const pushPrefs = usePushStore((s) => s.prefs);

  return {
    courses: coursesHint(courseCount(courses, picked, hiddenRequired)),
    appearance: appearanceHint(theme, startView),
    subjects: subjectsHint(visibleSubjects(courses, picked, metaSubjects, hiddenRequired).length), // як на сторінці «Fachfarben»
    sync: syncHint(syncCode, lastSyncAt),
    push: prefsSummary(pushOn, pushPrefs),
    editor: editorHint(me?.editor),
    privacy: "Keine Konten, kein Tracking",
    stats: "Stunden, Ausfälle, Vertretungen",
    news: changelog[0] ? `Neu in ${changelog[0].version} · ${newsDate(changelog[0].date)}` : null,
  };
};

// Заголовок групи з підписом праворуч від нього: «Seiten  weitere Bereiche der App»
const GroupTitle = ({ group }) => (
  <h3 className="mb-2.5 flex items-baseline gap-2 text-hint font-extrabold text-faint">
    {group.title}
    <span className="text-caption font-normal">{group.hint}</span>
  </h3>
);

// ─────────────────────────────────────────────────────────────
// «Mehr · Übersicht» на ПК (макет 22, частина 22): дві групи плиток у дві колонки —
// «Seiten» (Statistik, Datenschutz, вікна «Klasse einladen» і «Tastenkürzel») і «Einstellungen».
// ─────────────────────────────────────────────────────────────
const SettingsTiles = () => {
  const hints = useHints();
  const syncAllowed = useSyncAllowed();
  const me = usePlanStore((s) => s.me);
  const { openSheet } = useSheet();
  const visible = settingsSections.filter((section) => section.hint && sectionVisible(section, { syncAllowed, teacher: isTeacher(me), features: me?.features }));

  return (
    <div className="flex flex-col gap-6">
      {settingsGroups.map((group) => (
        <section key={group.key}>
          <GroupTitle group={group} />
          <ul className="grid grid-cols-2 gap-3">
            {visible
              .filter((section) => section.group === group.key)
              .map((section) => (
                <li key={section.to}>
                  <Link to={section.to} className={tile}>
                    <TileBody icon={section.icon} label={section.label} hint={hints[section.hint]} badge={section.badge === "news" ? <NewBadge /> : null} />
                  </Link>
                </li>
              ))}
            {/* не сторінки, а вікна: QR для однокласників (частина 16) і клавіші */}
            {group.key === "seiten" && (
              <>
                <li>
                  <button type="button" onClick={() => openSheet("einladen")} className={`${tile} w-full`}>
                    <TileBody icon={UserPlus} label="Klasse einladen" hint="Link und QR für Mitschüler" />
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => openSheet("tipps")} className={`${tile} w-full`}>
                    <TileBody icon={Info} label="Kurz erklärt" hint="3 Tipps für den Anfang" />
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => openSheet("tasten")} className={`${tile} w-full`}>
                    <TileBody icon={Keyboard} label="Tastenkürzel" hint="⌘K, T, ←, →, N …" />
                  </button>
                </li>
              </>
            )}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default SettingsTiles;
