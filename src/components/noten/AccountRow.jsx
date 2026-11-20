import { LogIn, User } from "lucide-react";
import { useState } from "react";
import { useT } from "../../shared/hooks/useT";
import { useNotenStore } from "../../shared/store/notenStore";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";

// «InfoPoint»: под чьим логином забраны оценки и «Abmelden» (с вопросом — макет handy-11).
// Abmelden стирает логин и оценки на устройстве и, через Sync, на других устройствах
const AccountRow = () => {
  const t = useT();
  const username = useNotenStore((s) => s.username);
  const logout = useNotenStore((s) => s.logout);
  const [asking, setAsking] = useState(false);

  return (
    <section>
      <h2 className="mb-2.5 text-hint font-extrabold text-faint">InfoPoint</h2>
      <div className="flex items-center gap-3 rounded-card bg-card py-2 pr-2 pl-3.5">
        <User className="size-5 shrink-0 text-muted" />
        <span className="min-w-0 flex-1 truncate text-row text-ink">{username || "Home.InfoPoint"}</span>
        <button type="button" onClick={() => setAsking(true)} className="h-10 shrink-0 rounded-full px-2.5 text-body-sm font-extrabold text-danger outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:bg-danger-tint">
          {t("Abmelden")}
        </button>
      </div>
      <ConfirmDialog
        open={asking}
        onClose={() => setAsking(false)}
        icon={
          <span className="grid size-10 place-items-center rounded-full bg-danger-tint">
            <LogIn className="size-5 text-danger" />
          </span>
        }
        title={t("Abmelden?")}
        text={t("Login und geholte Noten werden gelöscht.")}
      >
        <Button onClick={() => setAsking(false)}>{t("Abbrechen")}</Button>
        <Button
          variant="danger"
          onClick={() => {
            setAsking(false);
            logout();
          }}
        >
          {t("Abmelden")}
        </Button>
      </ConfirmDialog>
    </section>
  );
};

export default AccountRow;
