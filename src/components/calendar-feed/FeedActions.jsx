import { CalendarPlus } from "lucide-react";
import Button from "../ui/Button";
import { CopyIcon } from "../ui/icons";
import TargetMenu from "./TargetMenu";
import { useT } from "../../shared/hooks/useT";

// «Zum Kalender» + «Kopieren» (макет handy-02). На телефоне «Zum Kalender» открывает шторку,
// на ПК — меню под кнопкой. links null — ссылки нет (ключ сервера сменили): кнопки неактивны
const FeedActions = ({ links, desktop, onChoose, onCopy }) => {
  const t = useT();
  const add = (
    <Button variant="primary" onClick={desktop ? undefined : onChoose} disabled={!links} className="flex-[1.25]">
      <CalendarPlus className="size-4" aria-hidden="true" /> {t("Zum Kalender")}
    </Button>
  );
  return (
    <div className="flex gap-2">
      {desktop && links ? (
        <TargetMenu links={links} onCopy={onCopy}>
          {add}
        </TargetMenu>
      ) : (
        add
      )}
      <Button onClick={onCopy} disabled={!links}>
        <CopyIcon className="size-4" /> {t(desktop ? "Link kopieren" : "Kopieren")}
      </Button>
    </div>
  );
};

export default FeedActions;
