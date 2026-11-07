import { Layers } from "lucide-react";
import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Плашка «Muster: так зазвичай…» (частина 19, макети 19 handy-01, 03; pc-01).
// Як «Info zum Tag», але фіолетова і зі стосом аркушів. lead — жирний початок, children — решта тексту
// ─────────────────────────────────────────────────────────────
const MusterNote = ({ lead, children, className }) => (
  <p className={cn("flex items-start gap-2.5 rounded-field bg-tint px-3.25 py-3 text-label leading-4.5 text-muted", className)}>
    <Layers className="mt-px size-4 shrink-0 text-accent-ink" />
    <span className="min-w-0 flex-1">
      <span className="font-bold text-accent-ink">{lead}</span> {children}
    </span>
  </p>
);

export default MusterNote;
