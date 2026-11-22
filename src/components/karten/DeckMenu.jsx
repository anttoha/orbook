import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, RotateCcw, Share } from "lucide-react";
import { toast } from "sonner";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";
import { useKartenStore } from "../../shared/store/kartenStore";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { PencilIcon, TrashIcon } from "../ui/icons";
import Sheet from "../ui/Sheet";
import ShareSheet from "./ShareSheet";

// ─────────────────────────────────────────────────────────────
// ⋮ у стопки (макет 43 handy-14, handy-15): Bearbeiten, Teilen, Lernstand zurücksetzen, Löschen.
// Сброс и удаление — с вопросом. share — внешняя кнопка «Teilen» на ПК открывает ту же шторку
// ─────────────────────────────────────────────────────────────
const DeckMenu = ({ deck }) => {
  const t = useT();
  const navigate = useNavigate();
  const [open, setOpen] = useState(null); // "menu" | "share" | "reset" | "delete" | null
  const close = () => setOpen(null);
  const { deleteDeck, resetDeck } = useKartenStore.getState();

  const rows = [
    { key: "edit", icon: PencilIcon, label: t("Bearbeiten"), onClick: () => navigate(`/karteikarten/${deck.id}/bearbeiten`) },
    { key: "share", icon: Share, label: t("Teilen"), onClick: () => setOpen("share") },
    { key: "reset", icon: RotateCcw, label: t("Lernstand zurücksetzen"), onClick: () => setOpen("reset") },
    { key: "delete", icon: TrashIcon, label: t("Löschen"), onClick: () => setOpen("delete"), danger: true },
  ];

  return (
    <>
      <div className="flex gap-2.5">
        <button type="button" onClick={() => setOpen("share")} className="hidden h-9.5 items-center gap-2 rounded-full bg-card px-4 text-label font-extrabold text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50 lg:flex">
          <Share className="size-4" /> {t("Teilen")}
        </button>
        <button type="button" onClick={() => setOpen("menu")} aria-label={t("Weitere Optionen")} className="grid size-9.5 place-items-center rounded-full bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
          <MoreVertical className="size-4.25" />
        </button>
      </div>

      <Sheet open={open === "menu"} onClose={close} desktop="dialog" eyebrow={translate("{n} Karten", { n: deck.cards.length })} title={deck.name}>
        <ul className="overflow-hidden rounded-card bg-card">
          {rows.map((row) => (
            <li key={row.key} className="mx-4 border-hair not-first:border-t">
              <button type="button" onClick={row.onClick} className="flex h-13 w-full items-center gap-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
                <row.icon className={row.danger ? "size-5 text-danger" : "size-5 text-muted"} />
                <span className={row.danger ? "text-row font-bold text-danger" : "text-row font-bold text-ink"}>{row.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      <ShareSheet open={open === "share"} onClose={close} deck={deck} />

      <ConfirmDialog open={open === "reset"} onClose={close} icon={<RotateCcw className="size-5 text-accent-ink" />} title={t("Lernstand zurücksetzen?")} text={t("Alle Karten kommen wieder in „Neu“.")}>
        <Button onClick={close}>{t("Abbrechen")}</Button>
        <Button
          variant="primary"
          onClick={() => {
            resetDeck(deck.id);
            toast(translate("Lernstand zurückgesetzt"));
            close();
          }}
        >
          <RotateCcw className="size-4" /> {t("Zurücksetzen")}
        </Button>
      </ConfirmDialog>

      <ConfirmDialog
        open={open === "delete"}
        onClose={close}
        icon={<TrashIcon className="size-5 text-danger" />}
        title={t("Stapel löschen?")}
        text={t("Alle {n} Karten und der Lernstand sind dann weg.", { n: deck.cards.length })}
      >
        <Button onClick={close}>{t("Abbrechen")}</Button>
        <Button
          variant="danger"
          onClick={() => {
            deleteDeck(deck.id);
            toast(translate("Stapel gelöscht"));
            navigate("/karteikarten", { replace: true });
          }}
        >
          <TrashIcon className="size-4" /> {t("Löschen")}
        </Button>
      </ConfirmDialog>
    </>
  );
};

export default DeckMenu;
