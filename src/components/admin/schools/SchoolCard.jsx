import { ChevronRight, Plus } from "lucide-react";
import { classStats } from "../../../shared/utils/adminClasses";
import ClassBadge from "../../ui/ClassBadge";
import SchoolHead from "./SchoolHead";
import Liquid from "../../ui/Liquid";
import { useT } from "../../../shared/hooks/useT";

// Строка класса: значок, «Klasse 9b», «27 Geräte · 4 Codes · 5 Tests», стрелка — открыть класс в админке
const ClassRow = ({ item, color, onOpen }) => {
  const t = useT();
  return (
  <button type="button" onClick={() => onOpen(item)} className="flex w-full items-center gap-3.5 border-t border-hair py-3 text-left outline-none focus-visible:bg-sand">
    <ClassBadge name={item.name} color={color} size="md" />
    <span className="min-w-0 flex-1">
      <span className="block truncate text-row font-extrabold text-ink">{t("Klasse")} {item.name}</span>
      <span className="block truncate text-label text-faint">{classStats(item)}</span>
    </span>
    <ChevronRight className="size-4.5 shrink-0 text-faint2" />
  </button>
);
};

// ─────────────────────────────────────────────────────────────
// Школа на телефоне (макет 29 handy-12): шапка (нажатие — «Zugang ändern»), классы, «Code für neue Klasse».
// colorOf(id) — цвет значка класса, как в чипе
// ─────────────────────────────────────────────────────────────
const SchoolCard = ({ school, colorOf, onOpen, onEdit, onNewCode }) => {
  const t = useT();
  return (
  <Liquid as="article" refract press={false} className="rounded-card bg-card px-4 pt-3.5 pb-1">
    <button type="button" onClick={() => onEdit(school)} aria-label={t("{name}: Zugang ändern", { name: school.name })} className="flex w-full pb-3.5 text-left outline-none">
      <SchoolHead school={school} />
    </button>
    {(school.classes ?? []).map((item) => (
      <ClassRow key={item.id} item={item} color={colorOf(item.id)} onOpen={onOpen} />
    ))}
    <button type="button" onClick={() => onNewCode(school)} className="flex h-14 w-full items-center gap-3.5 border-t border-hair text-row font-extrabold text-accent-ink">
      <span className="grid size-9 place-items-center">
        <Plus className="size-5" />
      </span>
      {t("Code für neue Klasse")}
    </button>
  </Liquid>
);
};

export default SchoolCard;
