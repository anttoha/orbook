import { copyText } from "../../shared/utils/share";
import { CopyIcon } from "../ui/icons";
import RoundButton from "../ui/RoundButton";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";

// Фіолетова картка «… · nur jetzt sichtbar» (макети 42 і 44, пароль класу — 14b).
// Повний код або пароль є тільки у відповіді сервера: ніде не зберігаємо, лише показуємо один раз.
// title і note — для пароля класу інші тексти; за замовчуванням — новий Editor-Code
const CodeReveal = ({ code, masked, title = translate("Neuer Code"), note, copyLabel = translate("Code kopieren") }) => {
  const t = useT();
  return (
  <div className="rounded-card bg-accent px-4 py-4 text-on-accent">
    <p className="text-label font-extrabold text-on-accent/80">{title}</p>
    <div className="mt-2 flex items-center gap-3">
      <p className="min-w-0 flex-1 text-dialog font-black tracking-code break-all select-all lg:text-heading">{code}</p>
      <RoundButton onClick={() => copyText(code)} aria-label={copyLabel} look="grid size-9.5 shrink-0 place-items-center rounded-full hover:bg-on-accent/15">
        <CopyIcon className="size-4.25" />
      </RoundButton>
    </div>
    <p className="mt-2 text-caption leading-4.5 text-on-accent/80">{note ?? t("Danach siehst du nur noch {masked}. Weitergeben am besten persönlich.", { masked })}</p>
  </div>
);
};

export default CodeReveal;
