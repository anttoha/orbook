import { toast } from "sonner";
import { RotateCcw, Table } from "lucide-react";
import AccentPicker from "../components/more/AccentPicker";
import DesignPicker from "../components/more/DesignPicker";
import GlassCard from "../components/more/GlassCard";
import LanguageSelect from "../components/more/LanguageSelect";
import MenuRow from "../components/more/MenuRow";
import SettingRow from "../components/more/SettingRow";
import ThemePicker from "../components/more/ThemePicker";
import ListCard from "../components/ui/ListCard";
import PageHeader from "../components/ui/PageHeader";
import Segmented from "../components/ui/Segmented";
import { useT } from "../shared/hooks/useT";
import { useTheme } from "../shared/hooks/useTheme";
import { useUserStore } from "../shared/store/userStore";
import { effectiveMotion } from "../shared/utils/appearance";
import { planOf, planSummary } from "../shared/utils/planView";
import { useMediaQuery } from "../shared/hooks/useMediaQuery";
import PillButton from "../components/ui/PillButton";

const START_VIEWS = [
  { value: "woche", label: "Woche" },
  { value: "heute", label: "Heute" },
];
const MOTIONS = [
  { value: "voll", label: "Voll" },
  { value: "weniger", label: "Weniger" },
  { value: "aus", label: "Aus" },
];
const FONT_SIZES = [
  { value: 1, label: "A" },
  { value: 2, label: "A+" },
  { value: 3, label: "A++" },
];

// «Darstellung» (макет 24 + часть 30a: Design, Akzentfarbe, Glas, Animationen). Запитів немає: усе живе на пристрої і діє одразу.
const Appearance = () => {
  const t = useT();
  const { theme, setTheme } = useTheme();
  const user = useUserStore();
  // «Animationen» не выбраны — показываем то, что действует сейчас по настройке системы
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Вернуть оформление как было до части 30 (Soft, фиолетовый, движение как в системе) — с «Rückgängig»
  const reset = () => {
    const before = user.resetAppearance();
    toast(t("Darstellung zurückgesetzt"), { duration: 6000, action: { label: t("Rückgängig"), onClick: () => useUserStore.setState(before) } });
  };

  return (
    <section className="flex flex-col gap-4.5 lg:max-w-186">
      <PageHeader backTo="/mehr" eyebrow="Mehr" title="Darstellung" />

      <div>
        <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Thema")}</h2>
        <ThemePicker value={theme} onChange={setTheme} />
      </div>

      <div>
        <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Design")}</h2>
        <DesignPicker value={user.design} glassBg={user.glassBg} onChange={user.setDesign} />
      </div>

      <div>
        <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Akzentfarbe")}</h2>
        <AccentPicker value={user.accent} onChange={user.setAccent} />
      </div>

      {user.design === "glas" && <GlassCard glassBg={user.glassBg} glassMode={user.glassMode} onBg={user.setGlassBg} onMode={user.setGlassMode} />}

      <ListCard title="Ansicht">
        <SettingRow label="Startansicht">
          <Segmented label="Startansicht" size="form" className="w-fit" options={START_VIEWS} value={user.startView} onChange={user.setStartView} />
        </SettingRow>
        <SettingRow label="Animationen">
          <Segmented label="Animationen" size="form" className="w-fit" options={MOTIONS} value={effectiveMotion(user.motion, systemReduced)} onChange={user.setMotion} />
        </SettingRow>
        <SettingRow label="Schriftgröße">
          <Segmented label="Schriftgröße" size="form" className="w-fit" options={FONT_SIZES} value={user.fontScale} onChange={user.setFontScale} />
        </SettingRow>
      </ListCard>

      <ListCard title="Sprache">
        <SettingRow label="Sprache" hint="Gilt für die ganze App.">
          <LanguageSelect />
        </SettingRow>
      </ListCard>

      {/* «Anpassen» (частина 30): окремі сторінки; «Start» з'явиться в 30c. Woche, Tag і «Änderung unter dem Tag» тепер у «Stundenplan» */}
      <ListCard title="Anpassen">
        <MenuRow to="/mehr/darstellung/stundenplan" icon={Table} label="Stundenplan" value={planSummary(planOf(user.plan)).map(t).join(" · ")} />
      </ListCard>

      <PillButton glass="glass" size="lg" onClick={reset} className="flex h-12 items-center justify-center gap-2 rounded-full bg-sand text-row font-bold text-ink transition-opacity active:opacity-80">
        <RotateCcw className="size-4" />
        {t("Darstellung zurücksetzen")}
      </PillButton>
    </section>
  );
};

export default Appearance;
