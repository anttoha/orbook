import { Share } from "lucide-react";
import Button from "../../ui/Button";
import { WhatsappIcon } from "../../ui/icons";
import Liquid from "../../ui/Liquid";

// WhatsApp (макет 27): автоматически нельзя — только «Nachricht teilen»
const WhatsappCard = ({ onShare }) => (
  <section className="flex flex-col gap-2.5">
    <h2 className="text-hint font-extrabold text-faint">WhatsApp</h2>
    <Liquid as="div" refract press={false} className="flex flex-col gap-3 rounded-card bg-card p-3.5">
      <div className="flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sand text-muted">
          <WhatsappIcon className="size-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-row font-extrabold text-ink">Nur zum Teilen</p>
          <p className="text-caption text-muted">Automatisch geht es bei WhatsApp nicht.</p>
        </div>
      </div>
      <Button className="flex-none" onClick={onShare}>
        <Share className="size-4" /> Nachricht teilen
      </Button>
    </Liquid>
  </section>
);

export default WhatsappCard;
