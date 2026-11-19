import { Bell, Folder, Info, Palette, Smartphone, Sparkles, Sun, Table2, UserPlus, UsersRound } from "lucide-react";
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
import { KeyIcon, ShieldIcon, StatsIcon, SyncIcon } from "../components/ui/icons";
import { changelog } from "../shared/changelog";
import { androidApp } from "../shared/api/android";
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
import { courseCount } from "../shared/utils/courses";
import { isTeacher } from "../shared/utils/examRules";
import { translate } from "../shared/i18n/translate";

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
  const [android] = useState(androidApp); // Android-App (часть 31a); в браузере — null
  const pushOn = usePushStore((s) => s.enabled);
  const pushPrefs = usePushStore((s) => s.prefs);
  const pushAllowed = me?.features?.push !== false;

  const school = [me?.className, me?.schoolName].filter(Boolean).join(" · "); // обидва поля бувають порожні
  const hiddenRequired = useUserStore((s) => s.hiddenRequired);
  const count = courseCount(courses, picked, hiddenRequired);
  const links = useMaterials((s) => (s.status === "idle" ? null : s.items.length));
  const ensureMaterials = useMaterials((s) => s.ensure);
  const { openSheet } = useSheet();
  const statsEnabled = me?.features?.statistics !== false; // школа могла вимкнути статистику
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

      <InstallCard />

      {/* «Seiten» — просто сторінки й вікна; Statistik переїхала сюди з нижнього меню (частина 22) */}
      <ListCard title={seiten.title} hint={seiten.hint}>
        {statsEnabled && <MenuRow to="/statistik" icon={StatsIcon} label={t("Statistik")} value={t("Woche · Monat")} />}
        <MenuRow to="/mehr/neuigkeiten" icon={Sparkles} label={t("Neuigkeiten")} badge={<NewBadge />} value={changelog[0]?.version} />
        <MenuRow to="/materialien" icon={Folder} label={t("Materialien")} value={links ? `${links} ${t(links === 1 ? "Link" : "Links")}` : null} />
        {/* частина 16: посилання і QR для однокласників; вимкнене — шторка так і скаже */}
        <MenuRow onClick={() => openSheet("einladen")} icon={UserPlus} label={t("Klasse einladen")} value="Link + QR" />
        {/* часть 31a: только внутри APK — версия и обновление (в браузере строка появится в 31c) */}
        {android && <MenuRow to="/mehr/android" icon={Smartphone} label={t("Android-App")} value={android.versionName} />}
        {/* часть 25: три подсказки с первого входа — открыть ещё раз */}
        <MenuRow onClick={() => openSheet("tipps")} icon={Info} label={t("Kurz erklärt")} value={t("3 Tipps")} />
        <MenuRow to="/mehr/datenschutz" icon={ShieldIcon} label={t("Datenschutz")} />
      </ListCard>

      {/* «Einstellungen» — те, що налаштовується */}
      <ListCard title={einstellungen.title} hint={einstellungen.hint}>
        <MenuRow to="/mehr/kurse" icon={Table2} label={t("Meine Kurse")} value={count.all > 0 ? `${count.on} ${t("von")} ${count.all}` : null} />
        <MenuRow to="/mehr/darstellung" icon={Sun} label={t("Darstellung")} value={THEME_LABELS[theme]} />
        <MenuRow to="/mehr/fachfarben" icon={Palette} label={t("Fachfarben")} />
        {pushAllowed && <MenuRow to="/mehr/mitteilungen" icon={Bell} label={t("Mitteilungen")} value={prefsSummary(pushOn, pushPrefs)} />}
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
