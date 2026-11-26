import { useT } from "../../shared/hooks/useT";
import { useFuerDich } from "../../shared/hooks/useFuerDich";
import FocusAhead from "../fuerdich/FocusAhead";
import FocusFerien from "../fuerdich/FocusFerien";
import FocusMorgen from "../fuerdich/FocusMorgen";
import FocusStunde from "../fuerdich/FocusStunde";
import BlockCard from "./BlockCard";
import BlockSkeleton from "./BlockSkeleton";

// Отрезок дня → как его нарисовать
const VIEWS = { morgen: FocusMorgen, stunde: FocusStunde, pause: FocusStunde, nachmittag: FocusAhead, abend: FocusAhead, ferien: FocusFerien };

// ─────────────────────────────────────────────────────────────
// Блок «Für dich jetzt» (часть 50b): меняется по времени дня — что решает nowFocus.js.
// Klein / Breit / Groß; настройки — общие со виджетом (страница /fuer-dich)
// ─────────────────────────────────────────────────────────────
const FuerDichBlock = ({ block, editing }) => {
  const t = useT();
  const { focus, settings } = useFuerDich();
  const View = VIEWS[focus.kind];
  if (!View) {
    return (
      <BlockCard kind="fuerDich" accent title={t("Für dich jetzt")} editing={editing}>
        <BlockSkeleton />
      </BlockCard>
    );
  }
  return <View focus={focus} size={block.size} editing={editing} settings={settings} changes={settings.show.aenderungen} />;
};

export default FuerDichBlock;
