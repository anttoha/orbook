import { ClipboardCheck, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { useNotenStore } from "../../shared/store/notenStore";
import Button from "../ui/Button";
import { KeyIcon } from "../ui/icons";
import PasswordField from "../ui/PasswordField";
import RowSwitch from "../ui/RowSwitch";
import TextField from "../ui/TextField";
import { translate } from "../../shared/i18n/translate";
import { waitMinutes } from "../../shared/utils/noten";

// Почему вход не получился (кроме неверного пароля — он у поля, и «nicht erreichbar» — плашка сверху).
// Сервер пускает удачную загрузку раз в 5 минут и 5 попыток за 10 минут с устройства: после «Abmelden»
// и сразу нового входа приходит too_often — без этого текста форма выглядела бы так, будто ничего не происходит
function loginErrorText(error) {
  switch (error?.code) {
    case "too_often":
      return translate("Gerade nicht möglich – wieder in {n} Min.", { n: waitMinutes(error.retryAfter) });
    case "rate_limited":
      return translate("Gerade zu viele Anfragen – versuch es gleich nochmal");
    case "disabled":
      return translate("Noten sind für deine Klasse ausgeschaltet");
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Вход в Home.InfoPoint (макеты handy-04, 05): свой логин школы, «Angemeldet bleiben», «Anmelden».
// Неверный пароль — красная рамка и текст под полем. Логин проверяет сам InfoPoint (через сервер ORBook)
// canCancel — оценки уже есть (вход открыли поверх них): можно вернуться без входа
// ─────────────────────────────────────────────────────────────
const NotenLogin = ({ canCancel }) => {
  const t = useT();
  const school = usePlanStore((s) => s.me?.schoolName);
  const { username: savedName, password: savedPassword, remember: savedRemember, busy, error, login, closeLogin } = useNotenStore();
  // Пока идёт вход, вместо формы серые плашки — после ошибки форма рисуется заново и берёт набранное из store
  // (неверный пароль store стирает сам)
  const [username, setUsername] = useState(savedName);
  const [password, setPassword] = useState(savedPassword);
  const [remember, setRemember] = useState(savedRemember);
  const denied = error?.code === "denied";

  const submit = (event) => {
    event.preventDefault();
    if (username.trim() && password) login(username.trim(), password, remember);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4.5 lg:max-w-dialog">
      <div className="flex items-center gap-3.5 rounded-card bg-card px-4 py-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-accent-ink">
          <ClipboardCheck className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-subhead text-ink">Home.InfoPoint</span>
          {school && <span className="block truncate text-body-sm text-faint">{school}</span>}
        </span>
      </div>
      <TextField id="noten-user" label={t("Benutzername")} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} required />
      <PasswordField
        id="noten-password"
        label={t("Passwort")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        error={denied ? t("Benutzername oder Passwort falsch") : undefined}
        required
      />
      <RowSwitch
        checked={remember}
        onToggle={() => setRemember(!remember)}
        label={t("Angemeldet bleiben")}
        className="flex w-full items-center gap-3 rounded-card bg-card px-3.5 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <span className="min-w-0 flex-1 text-row text-ink">{t("Angemeldet bleiben")}</span>
      </RowSwitch>
      <Button type="submit" variant="primary" disabled={busy || !username.trim() || !password} className="flex-none">
        <KeyIcon className="size-4.5" />
        {busy ? t("Wird geprüft …") : t("Anmelden")}
      </Button>
      {loginErrorText(error) && (
        <p role="alert" className="-mt-1.5 flex items-center gap-1.5 text-body-sm text-danger">
          <TriangleAlert className="size-4 shrink-0" />
          {loginErrorText(error)}
        </p>
      )}
      {canCancel && (
        <Button onClick={closeLogin} className="flex-none">
          {t("Abbrechen")}
        </Button>
      )}
    </form>
  );
};

export default NotenLogin;
