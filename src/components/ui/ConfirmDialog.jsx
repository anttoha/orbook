import * as Dialog from "@radix-ui/react-dialog";

// ─────────────────────────────────────────────────────────────
// Діалог посередині екрана: «Klausur löschen?». Esc і клік по фону закривають.
// icon — іконка над заголовком, body — поля під текстом (необов'язково), children — кнопки
// ─────────────────────────────────────────────────────────────
const ConfirmDialog = ({ open, onClose, icon, title, text, body, children }) => (
  <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-[min(calc(100%-3.25rem),var(--container-dialog))] -translate-1/2 rounded-box bg-paper p-5 shadow-sheet outline-none data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in">
        {icon}
        <Dialog.Title className="mt-3 text-dialog text-ink">{title}</Dialog.Title>
        <Dialog.Description className="mt-2.5 text-body-sm leading-5.5 text-muted">{text}</Dialog.Description>
        {body && <div className="mt-4 flex flex-col gap-3.5">{body}</div>}
        <div className="mt-5.5 flex flex-wrap gap-2">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export default ConfirmDialog;
