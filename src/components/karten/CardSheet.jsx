import { useRef, useState } from "react";
import { toast } from "sonner";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";
import { useKartenStore } from "../../shared/store/kartenStore";
import { TEXT_MAX, sideName } from "../../shared/utils/karten";
import Button from "../ui/Button";
import { CheckIcon, TrashIcon } from "../ui/icons";
import Sheet from "../ui/Sheet";
import TextField from "../ui/TextField";
import { Plus } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Шторка «Karte hinzufügen» / «Karte bearbeiten» (макет 43 handy-07).
// Новая: «Nächste Karte» сохраняет и очищает поля (вбивать подряд), «Fertig» сохраняет (если заполнено) и закрывает.
// card — карточка для правки (или null)
// ─────────────────────────────────────────────────────────────
const CardSheet = ({ open, onClose, deck, card }) => (
  <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow={`${deck.name} · ${deck.cards.length}`} title={card ? translate("Karte bearbeiten") : translate("Karte hinzufügen")}>
    <CardForm key={card?.id ?? "neu"} deck={deck} card={card} onDone={onClose} />
  </Sheet>
);

const CardForm = ({ deck, card, onDone }) => {
  const t = useT();
  const [a, setA] = useState(card?.a ?? "");
  const [b, setB] = useState(card?.b ?? "");
  const first = useRef(null);
  const { addCards, updateCard, deleteCard } = useKartenStore.getState();
  const filled = a.trim() && b.trim();

  const save = () => {
    if (card) updateCard(deck.id, card.id, { a, b });
    else addCards(deck.id, [{ a, b }]);
  };

  // Enter / «Nächste Karte»: сохранить и сразу следующую
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!filled) return;
    save();
    if (card) return onDone();
    toast.success(translate("«{a}» gespeichert", { a: a.trim() }));
    setA("");
    setB("");
    first.current?.focus();
  };

  const handleDone = () => {
    if (filled) save();
    onDone();
  };

  const handleDelete = () => {
    deleteCard(deck.id, card.id);
    toast(translate("Karte gelöscht"));
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <TextField id="karte-a" ref={first} label={sideName(deck, "a")} value={a} onChange={(e) => setA(e.target.value)} maxLength={TEXT_MAX} autoFocus />
      <TextField id="karte-b" label={sideName(deck, "b")} value={b} onChange={(e) => setB(e.target.value)} maxLength={TEXT_MAX} />
      <div className="flex gap-2">
        {card ? (
          <>
            <Button variant="danger" onClick={handleDelete} className="flex-none px-4.5">
              <TrashIcon className="size-4" /> {t("Löschen")}
            </Button>
            <Button type="submit" variant="primary" disabled={!filled}>
              <CheckIcon className="size-4" /> {t("Speichern")}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleDone} className="flex-none px-6">
              {t("Fertig")}
            </Button>
            <Button type="submit" variant="primary" disabled={!filled}>
              <Plus className="size-4" strokeWidth={2.4} /> {t("Nächste Karte")}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};

export default CardSheet;
