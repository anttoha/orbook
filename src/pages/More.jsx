import { Bell, CalendarSync, Info, Palette, Smartphone, Sparkles, Sun, Table2, UserPlus, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { version } from "../../package.json";
import NewBadge from "../components/changelog/NewBadge";
import LeaveClass from "../components/more/LeaveClass";
import SettingsTiles from "../components/settings/SettingsTiles";
import MenuRow from "../components/more/MenuRow";
import InstallCard from "../components/push/InstallCard";
import { usePushStore } from "../shared/store/pushStore";
import { prefsSummary } from "../shared/utils/push";
import { KeyIcon, ShieldIcon, SyncIcon } from "../components/ui/icons";
import { changelog } from "../shared/changelog";
import { androidApp } from "../shared/api/android";
import AndroidCard from "../components/android/AndroidCard";
import { useAndroidCard } from "../shared/hooks/useAndroidCard";
import Badge from "../components/ui/Badge";
import { useAndroidOffer } from "../shared/hooks/useAndroidOffer";
import { useAndroidStore } from "../shared/store/androidStore";
import { settingsGroups } from "../shared/constants/constants";
import ListCard from "../components/ui/ListCard";
import { useSyncAllowed } from "../shared/hooks/useNotesSync";
import { useInSettingsPanel } from "../shared/hooks/useSettingsPanel";
import { useSheet } from "../shared/hooks/useSheet";
import { useT } from "../shared/hooks/useT";
import { useTheme } from "../shared/hooks/useTheme";
import { useMaterials } from "../shared/store/materialsStore";
import { useSyncStore } from "../shared/store/syncStore";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { useCalendarFeedOfClass } from "../shared/store/calendarFeedStore";
import { courseCount } from "../shared/utils/courses";
import { isTeacher } from "../shared/utils/examRules";
import { hasAppNotify } from "../shared/api/android";
import { translate } from "../shared/i18n/translate";
import { navOf, restOf, SECTIONS } from "../shared/utils/navLayout";
import { useDecks } from "../shared/hooks/useKarten";
import { totalDue } from "../shared/utils/karten";
import { useNow } from "../shared/hooks/useNow";
import { SECTION_ICONS } from "../components/navbar/navIcons";
import { useLerntimerStore } from "../shared/store/lerntimerStore";
import { durationText, localDay, minutesOn } from "../shared/utils/lerntimer";

const THEME_LABELS = { get light() { return translate("Hell"); }, get dark() { return translate("Dunkel"); }, get system() { return translate("System"); } };

// Рядок унизу: версія і вхід в адмінку
const Footer = () => {
  const t = useT();
  return (
  <footer className="flex items-center justify-between text-caption text-faint">
    <p>ORBook {version.split(".").slice(0, 2).join(".")} {t("· Teil von ORBitium")}</p>
    <Link to="/admin">Admin</Link>
  </footer>
);
};

// На ПК «Übersicht» праворуч від меню розділів: плитки замість списку (макет 22)
const DesktopOverview = () => {
  const t = useT();
  return (
  <section className="flex flex-col gap-5">
    <h2 className="text-heading text-ink">{t("Übersicht")}</h2>
    <InstallCard />
    <SettingsTiles />
    <Footer />
  </section>
);
};

// ─────────────────────────────────────────────────────────────
// Сторінка «Mehr» (макет 22). Своїх запитів немає: me і courses уже завантажені.
// «Mitteilungen» і «Synchronisieren» ховаємо, якщо школа їх вимкнула. Зверху — «ORBook als App» (частина 17).
// ─────────────────────────────────────────────────────────────
const More = () => {
  const inPanel = useInSettingsPanel(); // ПК: сторінка всередині «Einstellungen»
  if (inPanel) return <DesktopOverview />;
  return <PhoneMenu />;
};

// Телефон: список «Mehr» (макет 22 Handy)
const PhoneMenu = () => {
  const t = useT();
  const me = usePlanStore((s) => s.me);
  const courses = usePlanStore((s) => s.courses);
  const picked = useUserStore((s) => s.picked);
  const theme = useTheme((s) => s.theme);
  const syncCode = useSyncStore((s) => s.code);
  const syncAllowed = useSyncAllowed();
  const [android] = useState(androidApp); // внутри APK — версия; в браузере — null
  const { offer } = useAndroidOffer(); // в браузере: APK на сервере есть (часть 31c)
  const androidCard = useAndroidCard();
  const androidSeen = useAndroidStore((s) => s.seen);
  const pushOn = usePushStore((s) => s.enabled);
  const pushPrefs = usePushStore((s) => s.prefs);
  const feed = useCalendarFeedOfClass(); // часть 40: «an» без запроса — что устройство помнит
  const pushAllowed = me?.features?.push !== false;

  const school = [me?.className, me?.schoolName].filter(Boolean).join(" · "); // обидва поля бувають порожні
  const hiddenRequired = useUserStore((s) => s.hiddenRequired);
  const count = courseCount(courses, picked, hiddenRequired);
  const links = useMaterials((s) => (s.status === "idle" ? null : s.items.length));
  const ensureMaterials = useMaterials((s) => s.ensure);
  const { openSheet } = useSheet();
  const nav = useUserStore((s) => s.nav);
  const rest = restOf(navOf(nav, "phone"), me?.features); // школа могла вимкнути статистику — її тоді немає
  const { today } = useNow();
  const kartenDue = totalDue(useDecks(), today); // часть 43: «12 fällig» справа
  const lernHeute = useLerntimerStore((s) => minutesOn(s.sessions, localDay(new Date()))); // часть 44: «1 h 15 min» справа
  const restValues = { lerntimer: lernHeute > 0 ? durationText(lernHeute) : null, statistik: t("Woche · Monat"), materialien: links ? `${links} ${t(links === 1 ? "Link" : "Links")}` : null, karteikarten: kartenDue > 0 ? t("{due} fällig", { due: kartenDue }) : null };
  const [seiten, einstellungen] = settingsGroups;
  // «6 Links» праворуч: список питаємо один раз за сесію (далі його оновлює сторінка Materialien)
  useEffect(() => {
    ensureMaterials();
  }, [ensureMaterials]);

  return (
    <section className="flex flex-col gap-4.5">
      <header className="space-y-1">
        <p className="min-h-4 text-hint font-extrabold text-faint">{school}</p>
        <h1 className="text-title text-ink">{t("Mehr")}</h1>
      </header>

      {androidCard ? <AndroidCard /> : <InstallCard />}

      {/* «Seiten» — просто сторінки й вікна; Statistik переїхала сюди з нижнього меню (частина 22) */}
      <ListCard title={seiten.title} hint={seiten.hint}>
        {/* часть 35: разделы, которых нет в нижней панели (Statistik, Materialien … — что выбрал пользователь) */}
        {rest.map((key) => (
          <MenuRow key={key} to={SECTIONS[key].to} icon={SECTION_ICONS[key]} label={SECTIONS[key].label} value={restValues[key]} />
        ))}
        <MenuRow to="/mehr/neuigkeiten" icon={Sparkles} label={t("Neuigkeiten")} badge={<NewBadge />} value={changelog[0]?.version} />
        {/* частина 16: посилання і QR для однокласників; вимкнене — шторка так і скаже */}
        <MenuRow onClick={() => openSheet("einladen")} icon={UserPlus} label={t("Klasse einladen")} value="Link + QR" />
        {/* часть 31a/31c: в APK — версия и обновление, в браузере — скачать (пока на сервере есть APK) */}
        {android && <MenuRow to="/mehr/android" icon={Smartphone} label={t("Android-App")} value={android.versionName} />}
        {offer && <MenuRow to="/mehr/android" icon={Smartphone} label={t("Android-App")} value={t("APK · Widget")} badge={androidSeen ? null : <Badge variant="live">{t("Neu")}</Badge>} />}
        {/* часть 25: три подсказки с первого входа — открыть ещё раз */}
        <MenuRow onClick={() => openSheet("tipps")} icon={Info} label={t("Kurz erklärt")} value={t(hasAppNotify() ? "4 Tipps" : "3 Tipps")} />
        <MenuRow to="/mehr/datenschutz" icon={ShieldIcon} label={t("Datenschutz")} />
      </ListCard>

      {/* «Einstellungen» — те, що налаштовується */}
      <ListCard title={einstellungen.title} hint={einstellungen.hint}>
        <MenuRow to="/mehr/kurse" icon={Table2} label={t("Meine Kurse")} value={count.all > 0 ? `${count.on} ${t("von")} ${count.all}` : null} />
        <MenuRow to="/mehr/darstellung" icon={Sun} label={t("Darstellung")} value={THEME_LABELS[theme]} />
        <MenuRow to="/mehr/fachfarben" icon={Palette} label={t("Fachfarben")} />
        {pushAllowed && <MenuRow to="/mehr/mitteilungen" icon={Bell} label={t("Mitteilungen")} value={prefsSummary(pushOn, pushPrefs)} />}
        <MenuRow to="/mehr/kalender" icon={CalendarSync} label={t("Kalender-Abo")} value={feed?.on ? "an" : "Aus"} />
        {/* праворуч — перша група коду, як у макеті: «K7QM-…» */}
        {syncAllowed && <MenuRow to="/mehr/sync" icon={SyncIcon} label={t("Synchronisieren")} value={syncCode ? `${syncCode.slice(0, 4)}-…` : t("Aus")} />}
        {!isTeacher(me) && <MenuRow to="/mehr/editor-code" icon={KeyIcon} label={t("Tests eintragen")} value={me?.editor?.label ?? "Editor-Code"} />}
        {/* часть 29c: учитель или староста с правом «Klasse verwalten» — Zugangscodes своего класса */}
        {me?.canManageClass && <MenuRow to="/mehr/klasse-verwalten" icon={UsersRound} label={t("Klasse verwalten")} value={t("Zugangscodes")} />}
      </ListCard>

      <ListCard>
        <LeaveClass />
      </ListCard>

      <Footer />
    </section>
  );
};

export default More;
