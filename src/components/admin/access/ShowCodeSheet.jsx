import { useEffect, useState } from "react";
import * as admin from "../../../shared/api/admin";
import { useAccessScope } from "../../../shared/hooks/useAccessScope";
import Button from "../../ui/Button";
import { CheckIcon, RenewIcon } from "../../ui/icons";
import Sheet from "../../ui/Sheet";
import CodeReveal from "../CodeReveal";

// ─────────────────────────────────────────────────────────────
// «Code anzeigen» (власник 07.11): повний Zugangscode ще раз. Сервер зберігає його зашифрованим;
// старі коди (до 07.11) — лише як хеш: тоді пропонуємо «Neu erzeugen».
// Часть 29d (владелец 14.11): то же окно для Editor- и Lehrer-Code — source="editor", eyebrow и extra (QR под кодом)
// ─────────────────────────────────────────────────────────────
const ShowCodeSheet = ({ code, onClose, onRegenerate, source = "access", eyebrow, extra }) => {
  const [state, setState] = useState({ status: "loading" }); // loading | ready | hidden | error
  const { api } = useAccessScope();

  useEffect(() => {
    let cancelled = false;
    (source === "editor" ? admin.showCode : api.show)(code.id, code.classId)
      .then(({ code: full }) => !cancelled && setState({ status: "ready", full }))
      .catch((error) => !cancelled && setState({ status: error.code === "code_hidden" ? "hidden" : "error", error }));
    return () => {
      cancelled = true;
    };
  }, [api, source, code.id, code.classId]);

  return (
    <Sheet open onClose={onClose} desktop="dialog" eyebrow={eyebrow ?? `Zugangscode · ${code.label}`} title="Code anzeigen">
      {state.status === "loading" && <div className="h-28 animate-pulse rounded-card bg-skeleton" />}
      {state.status === "ready" && <CodeReveal code={state.full} masked={code.masked} title={code.label} note="Gib ihn nur an die Person oder Gruppe weiter, für die er ist." />}
      {state.status === "ready" && extra?.(state.full)}
      {state.status === "hidden" && (
        <>
          <p className="text-body-sm text-muted">Dieser Code ist älter und nur als Hash gespeichert — er lässt sich nicht mehr anzeigen. »Neu erzeugen« macht einen neuen Code, den du jederzeit wieder sehen kannst. Die Geräte dieses Codes müssen sich danach neu anmelden.</p>
          <Button variant="primary" className="flex-none" onClick={onRegenerate}>
            <RenewIcon className="size-4" /> Neu erzeugen
          </Button>
        </>
      )}
      {state.status === "error" && <p className="rounded-card bg-danger-tint p-4 text-body-sm text-danger">{state.error.message}</p>}
      {state.status !== "hidden" && (
        <Button className="flex-none" onClick={onClose}>
          <CheckIcon className="size-4" /> Fertig
        </Button>
      )}
    </Sheet>
  );
};

export default ShowCodeSheet;
