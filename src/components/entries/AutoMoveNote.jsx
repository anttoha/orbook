import { CornerDownLeft } from "lucide-react";
import { cn } from "../../shared/utils/cn";

// Плашка про авто-перенос (часть 24): «Fällt die Stunde aus, rutscht der Test auf die nächste Mathe-Stunde.»
// и в окне записи: «Verschoben von Mi 17.09., 3. Stunde — die Stunde fällt aus. Automatisch.»
const AutoMoveNote = ({ lead, children, className }) => (
  <p className={cn("flex items-start gap-2.5 rounded-field bg-sand px-3.25 py-3 text-label leading-4.5 text-muted", className)}>
    <CornerDownLeft className="mt-px size-4 shrink-0 -scale-x-100" />
    <span className="min-w-0 flex-1">
      <span className="font-bold text-ink">{lead}</span> {children}
    </span>
  </p>
);

export default AutoMoveNote;
