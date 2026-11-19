import { changelog } from "../../shared/changelog";
import { useUserStore } from "../../shared/store/userStore";
import { hasNews } from "../../shared/utils/changelog";
import Badge from "../ui/Badge";
import { useT } from "../../shared/hooks/useT";

// Метка «NEU» рядом с пунктом «Neuigkeiten», пока человек не открыл список. Выскакивает с отскоком
const NewBadge = () => {
  const t = useT();
  const read = useUserStore((s) => s.readNews);
  return hasNews(read, changelog) ? (
    <Badge variant="live" className="motion-safe:animate-badge-pop">
      {t("Neu")}
    </Badge>
  ) : null;
};

export default NewBadge;
