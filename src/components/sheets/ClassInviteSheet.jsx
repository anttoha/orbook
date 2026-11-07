import { useEffect, useState } from "react";
import { Link2, RefreshCw, ShieldCheck } from "lucide-react";
import { loadClassInvite } from "../../shared/api/invite";
import { inviteUrl } from "../../shared/utils/invite";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";
import InviteCard, { InviteCardSkeleton } from "../invite/InviteCard";
import QrFullscreen from "../invite/QrFullscreen";

// «Einladen ist gerade aus» (макет handy-10): адмін не дав посилання для учнів
const Off = ({ onClose }) => (
  <div className="flex flex-col items-center gap-2 pt-2 text-center">
    <span className="grid size-16 place-items-center rounded-full bg-sand text-muted">
      <Link2 className="size-6.5" />
    </span>
    <p className="mt-3 text-dialog text-ink">Einladen ist gerade aus</p>
    <p className="max-w-80 text-body-sm leading-5.5 text-muted">Der Admin hat den Link ausgeschaltet. Neue können sich mit einem Zugangscode anmelden — den gibt es beim Admin.</p>
    <Button className="mt-3 w-full flex-none" onClick={onClose}>
      Verstanden
    </Button>
  </div>
);

// ─────────────────────────────────────────────────────────────
// «Klasse einladen» для учня (частина 16, макети handy-09, handy-10, pc-08).
// Адреса: ?sheet=einladen. Посилання питаємо щоразу при відкритті: адмін міг його змінити.
// ─────────────────────────────────────────────────────────────
const ClassInviteSheet = ({ open, onClose }) => {
  const [state, setState] = useState({ status: "loading" }); // loading | ready | off | error
  const [attempt, setAttempt] = useState(0); // «Erneut versuchen» → запит ще раз
  const [big, setBig] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false; // шторку закрили, поки йшов запит — відповідь уже не потрібна
    loadClassInvite()
      .then((data) => !cancelled && setState({ status: "ready", ...data }))
      .catch((error) => !cancelled && setState({ status: error.code === "invite_off" ? "off" : "error", error }));
    return () => {
      cancelled = true;
    };
  }, [open, attempt]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((a) => a + 1);
  };
  const url = state.status === "ready" ? inviteUrl(state.token) : null;
  const intro = state.status === "off" ? null : "Zeig den QR deinen Mitschülern oder schick den Link in die Klassengruppe.";

  return (
    <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow={state.className ? `${state.className} · Meine Schule` : "Meine Schule"} title="Klasse einladen">
      {intro && <p className="-mt-2 text-body-sm text-muted">{intro}</p>}
      {state.status === "loading" && <InviteCardSkeleton />}
      {state.status === "off" && <Off onClose={onClose} />}
      {state.status === "error" && (
        <div className="flex flex-col items-start gap-3 rounded-card bg-danger-tint p-4 text-body-sm text-danger">
          <p>Link konnte nicht geladen werden. {state.error.message}</p>
          <button type="button" onClick={retry} className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-extrabold">
            <RefreshCw className="size-3.5" /> Erneut versuchen
          </button>
        </div>
      )}
      {url && (
        <>
          <InviteCard url={url} className={state.className} onBig={() => setBig(true)} caption={`Ein Tippen — und der Plan der ${state.className ?? "Klasse"} ist da`} />
          <p className="flex items-center gap-1.5 text-caption text-faint">
            <ShieldCheck className="size-3.5 shrink-0" /> Nur für die {state.className ?? "Klasse"} — bitte nicht öffentlich posten.
          </p>
          <QrFullscreen open={big} onClose={() => setBig(false)} url={url} className={state.className} />
        </>
      )}
    </Sheet>
  );
};

export default ClassInviteSheet;
