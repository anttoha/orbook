import { File, FileSpreadsheet, Folder, Presentation } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { fachClasses } from "../../shared/utils/lessons";

// Іконка за видом посилання; документ, PDF і «просто файл» — однаковий аркуш (як на макеті)
const ICONS = { folder: Folder, sheet: FileSpreadsheet, slides: Presentation };

// Плитка в кольорі предмета з іконкою виду (макет handy-01): папка або файл.
// size: "md" — у списку (40px), "sm" — у вікні уроку (36px), "lg" — у шторці дій (44px)
const SIZES = { sm: "size-9 rounded-tile", md: "size-10 rounded-tile", lg: "size-11 rounded-tile" };

const MaterialTile = ({ item, overrides, size = "md" }) => {
  const Icon = ICONS[item.kind] ?? File;
  return (
    <span className={cn("grid shrink-0 place-items-center", SIZES[size], fachClasses(item.subject?.code, overrides))}>
      <Icon className={size === "lg" ? "size-5.5" : "size-4.5"} />
    </span>
  );
};

export default MaterialTile;
