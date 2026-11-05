import { ChevronRight, Info } from "lucide-react";
import { infoParagraphs } from "../../shared/utils/format";

// Плашка «Info zum Tag: …» — по кліку відкривається шторка з усім текстом.
// info — day.info з сервера (рядки; текст школи для всієї школи)
const DayInfoBanner = ({ info, onClick }) => {
  return (
    <button type="button" onClick={onClick} className="flex items-start gap-2.5 rounded-field bg-sand px-3.25 py-3 text-left text-label leading-4.5 text-muted">
      <Info className="size-4 shrink-0" />
      {/* перший абзац, максимум два рядки */}
      <p className="line-clamp-2 min-w-0 flex-1">
        <span className="font-bold text-ink">Info zum Tag:</span> {infoParagraphs(info)[0]}
      </p>
      <ChevronRight className="size-3.75 shrink-0 text-faint" />
    </button>
  );
};

export default DayInfoBanner;
