import { ChevronRight, Info } from "lucide-react";
import { infoParagraphs } from "../../shared/utils/format";

// Плашка «Info zum Tag: …» — по кліку відкривається шторка з усім текстом.
// info — day.info з сервера (рядки; текст школи для всієї школи)
const DayInfoBanner = ({ info, onClick }) => {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-2xl bg-sand px-3.5 py-3 text-left text-label font-bold text-ink">
      <Info className="size-4.5 shrink-0 text-muted" />
      {/* перший абзац, максимум два рядки */}
      <p className="line-clamp-2 min-w-0 flex-1">
        <span className="font-black">Info zum Tag:</span> {infoParagraphs(info)[0]}
      </p>
      <ChevronRight className="size-4 shrink-0 text-faint" />
    </button>
  );
};

export default DayInfoBanner;
