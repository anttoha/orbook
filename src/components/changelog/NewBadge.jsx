import { changelog } from "../../shared/changelog";
import { useUserStore } from "../../shared/store/userStore";
import { hasNews } from "../../shared/utils/changelog";
import Badge from "../ui/Badge";

// Метка «NEU» рядом с пунктом «Neuigkeiten», пока человек не открыл список
const NewBadge = () => {
  const read = useUserStore((s) => s.readNews);
  return hasNews(read, changelog) ? <Badge variant="live">Neu</Badge> : null;
};

export default NewBadge;
