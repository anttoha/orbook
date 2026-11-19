import { useState } from "react";
import { toast } from "sonner";
import { changeClassPassword, generateClassPassword } from "../../../shared/api/admin";
import { changedText, CLASS_PASSWORD_MIN, classShareText, devicesText, lengthError } from "../../../shared/utils/passwords";
import { copyText } from "../../../shared/utils/share";
import Button from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { CheckIcon, CopyIcon, KeyIcon, SparkIcon, WarningIcon } from "../../ui/icons";
import PasswordField from "../../ui/PasswordField";
import CodeReveal from "../CodeReveal";
import PasswordSection from "./PasswordSection";
import { useT } from "../../../shared/hooks/useT";
import { translate } from "../../../shared/i18n/translate";

// Тексти вікна-питання: «ändern» (свій пароль) або «erzeugen» (придумує сервер). who — «der 9b» або «der Klasse»
const questions = (who) => ({
  change: { title: translate("Klassenpasswort ändern?"), text: translate("Alle Geräte {who} werden sofort abgemeldet und brauchen das neue Passwort. Sag es der Klasse vorher.", { who }), button: translate("Ändern"), Icon: KeyIcon },
  generate: { title: "Passwort erzeugen?", text: translate("Alle Geräte {who} werden sofort abgemeldet. Das neue Passwort siehst du nur einmal — direkt danach.", { who }), button: translate("Erzeugen"), Icon: SparkIcon },
});

// Після «Erzeugen»: пароль один раз, кнопки «Für die Klassengruppe kopieren» і «Fertig»
const Generated = ({ result, schoolClass, onDone }) => {
  const t = useT();
  const share = () => copyText(classShareText(result.password, { className: schoolClass, url: window.location.origin }));
  return (
    <div className="flex flex-col gap-3.5">
      <CodeReveal
        code={result.password}
        title={t("Neues Klassenpasswort · nur jetzt sichtbar")}
        copyLabel={t("Passwort kopieren")}
        note={t("{1}. Später ist das Passwort nirgends mehr zu sehen — schreib es jetzt in die Klassengruppe.", { "1": devicesText(result.devicesSignedOut) ?? t("Alle Geräte abgemeldet") })}
      />
      <div className="flex flex-col gap-2 lg:flex-row">
        <Button className="flex-none px-5" onClick={share}>
          <CopyIcon className="size-4" /> {t("Für die Klassengruppe kopieren")}
        </Button>
        <Button variant="primary" className="flex-none px-6" onClick={onDone}>
          <CheckIcon className="size-4" /> {t("Fertig")}
        </Button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// «Klassenpasswort» (макети 14b handy-01…03, pc-01…03). Окрема дія: усі пристрої класу вийдуть,
// тому спершу питаємо. Згенерований пароль живе тільки тут, у стані форми, — до «Fertig».
// ─────────────────────────────────────────────────────────────
const ClassPasswordForm = ({ since, schoolClass, onChanged }) => {
  const t = useT();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState("change"); // яке питання у вікні: "change" | "generate"
  const [open, setOpen] = useState(false); // окремо від question: текст не зникає, поки вікно закривається
  const [busy, setBusy] = useState(false);
  const [generated, setGenerated] = useState(null); // { password, devicesSignedOut }

  const openQuestion = (kind) => {
    setQuestion(kind);
    setOpen(true);
  };

  const askChange = () => {
    const tooShort = lengthError(password, CLASS_PASSWORD_MIN);
    setError(tooShort);
    if (!tooShort) openQuestion("change");
  };

  const run = async () => {
    setBusy(true);
    try {
      if (question === "generate") {
        setGenerated(await generateClassPassword());
      } else {
        const result = await changeClassPassword(password);
        toast.success(changedText(translate("Passwort geändert"), result.devicesSignedOut));
        setPassword("");
      }
      onChanged(); // дата «Seit …» тепер сьогоднішня
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const ask = questions(schoolClass ? translate("der {schoolClass}", { schoolClass }) : translate("der Klasse"))[question];
  return (
    <PasswordSection title={t("Klassenpasswort")} note={generated ? t("seit heute") : since}>
      {generated ? (
        <Generated result={generated} schoolClass={schoolClass} onDone={() => setGenerated(null)} />
      ) : (
        <>
          <PasswordField
            id="class-password-new"
            label={t("Neues Passwort")}
            autoComplete="new-password"
            placeholder={t("mindestens {CLASS_PASSWORD_MIN} Zeichen", { CLASS_PASSWORD_MIN })}
            hint={t("Alle Geräte der Klasse werden danach abgemeldet.")}
            error={error}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <div className="mt-3.5 flex gap-2.5">
            <Button variant="primary" className="lg:flex-none lg:px-5" onClick={askChange}>
              <KeyIcon className="size-4" /> {t("Passwort ändern")}
            </Button>
            {/* на телефоні «Erzeugen» ліворуч (макет handy-01), на ПК — після головної кнопки */}
            <Button className="flex-none px-5 max-lg:order-first" onClick={() => openQuestion("generate")}>
              <SparkIcon className="size-4" /> {t("Erzeugen")}
            </Button>
          </div>
          <p className="mt-3.5 text-caption text-faint lg:mt-4 lg:border-t lg:border-hair lg:pt-3.5">{t("„Erzeugen“: ORBook denkt sich ein sicheres Passwort aus. Du siehst es nur einmal.")}</p>
        </>
      )}

      <ConfirmDialog open={open} onClose={() => setOpen(false)} icon={question === "generate" ? <SparkIcon className="size-6.5 text-accent" /> : <WarningIcon className="size-6.5 text-danger" />} title={ask.title} text={ask.text}>
        <Button onClick={() => setOpen(false)}>{t("Abbrechen")}</Button>
        <Button variant="primary" disabled={busy} onClick={run}>
          <ask.Icon className="size-4" /> {ask.button}
        </Button>
      </ConfirmDialog>
    </PasswordSection>
  );
};

export default ClassPasswordForm;
