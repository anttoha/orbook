import { Plus } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import PillButton from "../ui/PillButton";
import StateScreen from "../ui/StateScreen";

// Четыре квадрата: один настоящий, три пунктиром (макет handy-05)
const EmptyBlocksIcon = ({ className }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="8" rx="2" strokeDasharray="2 1.6" />
    <rect x="3" y="13" width="8" height="8" rx="2" strokeDasharray="2 1.6" />
    <rect x="13" y="13" width="8" height="8" rx="2" strokeDasharray="2 1.6" />
  </svg>
);

// «Noch keine Blöcke» — все блоки убрали
const StartEmpty = ({ onAdd }) => {
  const t = useT();
  return (
    <StateScreen icon={EmptyBlocksIcon} title={t("Noch keine Blöcke")} text={t("Stell dir zusammen, was du auf einen Blick sehen willst.")}>
      <PillButton glass="filled" size="lg" onClick={onAdd} className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent text-row font-bold text-on-accent transition-opacity active:opacity-80">
        <Plus className="size-4.5" />
        {t("Block hinzufügen")}
      </PillButton>
    </StateScreen>
  );
};

export default StartEmpty;
