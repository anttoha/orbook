import { Ellipsis } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { visibleNav } from "../../shared/utils/navLayout";
import { cn } from "../../shared/utils/cn";
import { groupIcon, SECTION_ICONS } from "../navbar/navIcons";

// Превью нижней панели (макет handy-03 сверху): те же иконки, первая вкладка выбрана, нажать нельзя
const LeistePreview = ({ list, features }) => {
  const t = useT();
  const tabs = [
    ...visibleNav(list, features).map((e) => (e.type === "link" ? { key: e.tab.key, Icon: SECTION_ICONS[e.tab.key], label: e.tab.label } : { key: e.id, Icon: groupIcon(e.icon), label: t(e.name) })),
    { key: "mehr", Icon: Ellipsis, label: t("Mehr") },
  ];
  return (
    <div aria-hidden="true" className="rounded-card bg-sand p-3.5">
      <div className="flex h-13 rounded-full border border-hair bg-card p-1.5">
        {tabs.map(({ key, Icon, label }, i) => (
          <span key={key} className={cn("flex min-w-0 basis-0 items-center justify-center gap-1.5 rounded-full", i === 0 ? "grow-[1.4] bg-accent text-on-accent" : "grow text-faint")}>
            <Icon className="size-4.5 shrink-0" />
            {i === 0 && <span className="truncate text-label font-extrabold">{label}</span>}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LeistePreview;
