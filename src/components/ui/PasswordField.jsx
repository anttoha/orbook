import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import TextField from "./TextField";
import RoundButton from "./RoundButton";

// Поле пароля з «оком»: показати набране, щоб перевірити друкарські помилки.
// Решта пропсів — як у TextField (label, hint, error, value, onChange …)
const PasswordField = (props) => {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  const eye = (
    <RoundButton onClick={() => setVisible(!visible)} aria-label={visible ? "Passwort verbergen" : "Passwort zeigen"} aria-pressed={visible} look="grid size-9.5 place-items-center rounded-full text-faint hover:text-ink">
      <Icon className="size-5" />
    </RoundButton>
  );
  return <TextField {...props} type={visible ? "text" : "password"} trailing={eye} />;
};

export default PasswordField;
