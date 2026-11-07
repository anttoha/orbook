import { useEffect, useRef, useState } from "react";
import { ChevronRight, Link2, Maximize, Users } from "lucide-react";
import { useAccessActions } from "../../../shared/hooks/useAccessActions";
import { DESKTOP_QUERY, useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { useAdminStore } from "../../../shared/store/adminStore";
import { inviteUrl } from "../../../shared/utils/invite";
import Button from "../../ui/Button";
import { RenewIcon } from "../../ui/icons";
import Sheet from "../../ui/Sheet";
import Switch from "../../ui/Switch";
import InviteCard, { InviteCardSkeleton } from "../../invite/InviteCard";
import QrFullscreen from "../../invite/QrFullscreen";

// Рядок картки: значок, підпис, праворуч перемикач або «›»
const Row = ({ icon: Icon, label, hint, checked, onToggle, onClick }) => {
  const inner = (
    <>
      <Icon className="size-4.5 shrink-0 text-muted" />
      <span className="flex-1 text-row font-medium text-ink">{label}</span>
      {onToggle ? <Switch checked={checked} onChange={onToggle} label={label} /> : <span className="text-label text-faint">{hint}</span>}
      {!onToggle && <ChevronRight className="size-4 shrink-0 text-faint2" />}
    </>
  );
  const row = "flex h-12.5 w-full items-center gap-3.25 text-left";
  return <li>{onToggle ? <div className={row}>{inner}</div> : <button type="button" onClick={onClick} className={row}>{inner}</button>}</li>;
};

// ─────────────────────────────────────────────────────────────
// «Einladen» у адмінці (частина 16, макети handy-02…07, pc-02…06): посилання групового коду.
// Перше відкриття саме створює посилання. Код беремо зі сховища за id — після кожної дії
// список перезавантажується, і перемикачі показують свіжий стан.
//   onRenew — питання «Neuen Link erzeugen?» (вікно відкриває AccessDialogs)
// ─────────────────────────────────────────────────────────────
const InviteSheet = ({ code: start, onClose, onRenew }) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const actions = useAccessActions();
  const code = useAdminStore((s) => s.access.data?.codes.find((c) => c.id === start.id)) ?? start;
  const className = useAdminStore((s) => s.settings.data?.settings.school.className ?? null);
  const [big, setBig] = useState(false);
  const invite = code.invite;
  const { createInvite } = actions;
  const created = useRef(false); // actions нові на кожен рендер — без цього прапорця POST летів би щоразу

  // Посилання ще немає — створюємо одразу (один раз на відкриття вікна)
  useEffect(() => {
    if (start.invite || created.current) return;
    created.current = true;
    createInvite(start);
  }, [start, createInvite]);

  const toggle = (field, on, title) => actions.setInvite(code, { [field]: on }, title);
  const off = invite ? !invite.active : false;
  const url = invite?.token ? inviteUrl(invite.token) : null;

  const renderCard = () => {
    if (!invite) return <InviteCardSkeleton />;
    if (!url) {
      // ключ сервера змінили — старе посилання не прочитати, потрібне нове
      return (
        <div className="flex flex-col gap-3 rounded-card bg-card p-4 text-body-sm text-muted">
          Dieser Link kann nicht mehr angezeigt werden. Erzeuge einen neuen.
          <Button variant="primary" className="flex-none" onClick={onRenew}>
            <RenewIcon className="size-4" /> Neuen Link erzeugen
          </Button>
        </div>
      );
    }
    return <InviteCard url={url} className={className} off={off} onBig={isDesktop ? () => setBig(true) : null} />;
  };

  return (
    <Sheet open onClose={onClose} desktop="dialog" eyebrow={off ? `${code.label} · Link ausgeschaltet` : `${code.label} · Gruppe · ${code.devices ?? 0} Geräte`} title="Einladen">
      {renderCard()}
      {invite && (
        <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
          {!isDesktop && url && <Row icon={Maximize} label="QR groß zeigen" hint="Beamer" onClick={() => setBig(true)} />}
          <Row icon={Link2} label="Link aktiv" checked={invite.active} onToggle={(on) => toggle("active", on, on ? "Link eingeschaltet" : "Link ausgeschaltet")} />
          <Row icon={Users} label="Mitschüler dürfen teilen" checked={invite.shared} onToggle={(on) => toggle("shared", on, on ? "Mitschüler sehen den Link unter »Klasse einladen«" : "Mitschüler sehen den Link nicht mehr")} />
          <Row icon={RenewIcon} label="Neuen Link erzeugen" hint="alter geht aus" onClick={onRenew} />
        </ul>
      )}
      <p className="text-caption text-faint">
        Wer den Link hat, kommt in die {className ?? "Klasse"} und zählt zu »{code.label}«. Nur in der Klassengruppe teilen.
      </p>
      {url && <QrFullscreen open={big} onClose={() => setBig(false)} url={url} className={className} />}
    </Sheet>
  );
};

export default InviteSheet;
