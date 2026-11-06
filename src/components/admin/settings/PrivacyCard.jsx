import TextField from "../../ui/TextField";
import SettingsCard from "./SettingsCard";

// «Datenschutz-Kontakt»: хто відповідає (показується на екрані Datenschutz)
const PrivacyCard = ({ privacy, onChange, bad, className }) => (
  <SettingsCard title="Datenschutz-Kontakt" plain className={className}>
    <div className="flex flex-col gap-4 pb-3 lg:grid lg:grid-cols-2 lg:gap-x-5">
      <TextField id="privacy-name" label="Verantwortlich" placeholder="Name eines Elternteils" maxLength={100} autoComplete="off" error={bad.has("privacy.responsibleName") ? "Dieser Wert ist nicht erlaubt." : null} value={privacy.responsibleName} onChange={(event) => onChange("responsibleName", event.target.value)} />
      <TextField id="privacy-email" label="E-Mail" type="email" placeholder="E-Mail-Adresse" maxLength={200} autoComplete="off" error={bad.has("privacy.responsibleEmail") ? "Bitte eine gültige E-Mail-Adresse." : null} value={privacy.responsibleEmail} onChange={(event) => onChange("responsibleEmail", event.target.value)} />
    </div>
  </SettingsCard>
);

export default PrivacyCard;
