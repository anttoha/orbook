import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Copy, Info, X } from "lucide-react";
import { classTitle, shortUrl } from "../../shared/utils/invite";
import { copyText } from "../../shared/utils/share";
import Button from "../ui/Button";
import QrCode from "../ui/QrCode";
import RoundButton from "../ui/RoundButton";

// Поки великий QR відкритий, екран не гасне (Wake Lock). Браузер може відмовити — тоді просто без цього
function useScreenAwake(on) {
  useEffect(() => {
    if (!on || !navigator.wakeLock) return undefined;
    let lock = null;
    let closed = false;
    navigator.wakeLock
      .request("screen")
      .then((l) => (closed ? l.release() : (lock = l)))
      .catch(() => {}); // наприклад, вкладка не видима — нічого страшного
    return () => {
      closed = true;
      lock?.release().catch(() => {});
    };
  }, [on]);
}

// ─────────────────────────────────────────────────────────────
// «QR groß zeigen» (макети 16-einladen handy-04, pc-04): QR на весь екран — для проєктора
// на Elternabend або щоб показати сусідові по парті. Esc / хрестик закривають.
// ─────────────────────────────────────────────────────────────
const QrFullscreen = ({ open, onClose, url, className }) => {
  useScreenAwake(open);
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col overflow-y-auto scroll-stable bg-paper px-gutter pt-8 pb-6 outline-none lg:inset-x-auto lg:inset-y-10 lg:left-1/2 lg:w-150 lg:-translate-x-1/2 lg:rounded-panel lg:px-8 lg:pt-6 lg:shadow-sheet">
          <header className="flex items-end gap-3 lg:flex-col lg:items-center lg:text-center">
            <Dialog.Close asChild><RoundButton aria-label="Schließen" look="grid size-9.5 shrink-0 place-items-center rounded-full bg-card text-ink lg:absolute lg:top-6 lg:right-6 lg:size-8.5">
              <X className="size-4" />
            </RoundButton></Dialog.Close>
            <div className="space-y-1">
              <Dialog.Description className="text-hint font-extrabold text-faint">Einladung · {className ?? "ORBook"}</Dialog.Description>
              <Dialog.Title className="text-title text-ink lg:text-lobby">{classTitle(className)}</Dialog.Title>
            </div>
          </header>
          <QrCode value={url} className="mx-auto mt-9 aspect-square w-full max-w-82 lg:mt-6 lg:max-w-115" />
          <p className="mt-10 text-center text-dialog text-ink lg:mt-6 lg:text-subhead">Kamera drauf halten</p>
          <p className="mt-1 text-center text-body-sm text-muted">und den Link antippen — fertig.</p>
          <p className="mt-5 text-center text-body font-extrabold break-all text-accent-ink lg:text-heading">{shortUrl(url)}</p>
          <div className="mt-auto flex flex-col gap-3 pt-8 lg:hidden">
            <p className="flex gap-2.5 rounded-card bg-sand px-3.5 py-3 text-label text-muted">
              <Info className="mt-0.5 size-4 shrink-0" /> Der Bildschirm bleibt an, solange der QR offen ist.
            </p>
            <Button onClick={() => copyText(url)} className="flex-none">
              <Copy className="size-4" /> Link kopieren
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default QrFullscreen;
