import { ChevronRight } from "lucide-react";
import { RenewIcon, TrashIcon } from "../ui/icons";
import { useT } from "../../shared/hooks/useT";

// «Link erneuern» и «Abo löschen» — обе с вопросом перед действием (макеты handy-05, handy-06)
const FeedManage = ({ onRenew, onDelete }) => {
  const t = useT();
  const row = "-mx-2 flex h-12.5 min-w-0 flex-1 items-center gap-3.25 rounded-field px-2 text-left hover:bg-paper";
  return (
    <ul className="divide-y divide-hair rounded-card bg-card px-3.5 py-0.5">
      <li className="flex">
        <button type="button" onClick={onRenew} className={row}>
          <RenewIcon className="size-4.5 shrink-0 text-muted" />
          <span className="flex-1 text-row font-medium text-ink">{t("Link erneuern")}</span>
          <span className="text-label text-faint">{t("alter geht aus")}</span>
          <ChevronRight className="size-4 shrink-0 text-faint2" />
        </button>
      </li>
      <li className="flex">
        <button type="button" onClick={onDelete} className={row}>
          <TrashIcon className="size-4.5 shrink-0 text-danger" />
          <span className="flex-1 text-row font-medium text-danger">{t("Abo löschen")}</span>
        </button>
      </li>
    </ul>
  );
};

export default FeedManage;
