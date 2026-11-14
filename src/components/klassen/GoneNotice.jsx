import { useState } from "react";
import { toast } from "sonner";
import { useSheet } from "../../shared/hooks/useSheet";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { LockIcon } from "../ui/icons";
import PillButton from "../ui/PillButton";

// «Zugang beendet» (макет 29 handy-10): код класса выключили, остальные классы работают.
// «Neuen Code eingeben» — та же шторка «Klasse hinzufügen»; «Entfernen» — убрать класс с устройства
const GoneNotice = ({ item }) => {
  const t = useT();
  const { openSheet } = useSheet();
  const leaveClass = usePlanStore((s) => s.leaveClass);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await leaveClass(item.id);
    } catch (error) {
      toast.error(error.message);
      setBusy(false);
    }
  };

  return (
    <div className="relative mt-3.5 space-y-2.5">
      <div className="flex gap-2.5 rounded-field bg-danger-tint px-3.5 py-2.5 text-danger">
        <LockIcon className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="text-label font-extrabold">{t("Zugang beendet")}</p>
          <p className="text-caption">{t("Der Code dieser Klasse gilt nicht mehr.")}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <PillButton glass="glass" size="md" onClick={() => openSheet("klasseneu", { id: item.id })} className="h-10.5 flex-3 rounded-full bg-sand text-label font-extrabold text-ink">
          {t("Neuen Code eingeben")}
        </PillButton>
        <button type="button" onClick={remove} disabled={busy} className="h-10.5 flex-2 rounded-full bg-danger-tint text-label font-extrabold text-danger disabled:opacity-40">
          {t("Entfernen")}
        </button>
      </div>
    </div>
  );
};

export default GoneNotice;
