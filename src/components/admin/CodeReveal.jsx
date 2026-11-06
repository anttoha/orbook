import { copyText } from "../../shared/utils/share";
import { CopyIcon } from "../ui/icons";

// Фіолетова картка «Neuer Code · nur jetzt sichtbar» (макети 42 і 44).
// Повний код є тільки у відповіді сервера: ніде не зберігаємо, лише показуємо один раз
const CodeReveal = ({ code, masked }) => (
  <div className="rounded-card bg-accent px-4 py-4 text-on-accent">
    <p className="text-label font-extrabold text-on-accent/80">Neuer Code · nur jetzt sichtbar</p>
    <div className="mt-2 flex items-center gap-3">
      <p className="min-w-0 flex-1 text-heading font-black tracking-code break-all select-all">{code}</p>
      <button type="button" onClick={() => copyText(code)} aria-label="Code kopieren" className="grid size-9.5 shrink-0 place-items-center rounded-full hover:bg-on-accent/15">
        <CopyIcon className="size-4.25" />
      </button>
    </div>
    <p className="mt-2 text-caption leading-4.5 text-on-accent/80">Danach siehst du nur noch {masked}. Weitergeben am besten persönlich.</p>
  </div>
);

export default CodeReveal;
