import { CalendarX, Star } from "lucide-react";
import { blockInfo } from "../../shared/utils/startBlocks";
import { BLOCK_ICONS } from "../start/blockIcons";

// Подпись и значок вида виджета: обычно — как у блока Start; у видов, которых на Start нет (часть 39), — свои
const EXTRA = { neueNoten: { label: "Neue Noten", Icon: Star }, fehlzeiten: { label: "Fehlzeiten", Icon: CalendarX } };

export const widgetKindInfo = (kind) => EXTRA[kind] ?? { label: blockInfo(kind)?.label, Icon: BLOCK_ICONS[kind] };
