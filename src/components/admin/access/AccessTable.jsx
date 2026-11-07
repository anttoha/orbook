import { audienceShort, devicesShort } from "../../../shared/utils/accessCodes";
import { lastUsedDay, validText } from "../../../shared/utils/admin";
import { cn } from "../../../shared/utils/cn";
import Badge from "../../ui/Badge";
import Switch from "../../ui/Switch";
import CodeMenu from "../CodeMenu";
import { accessActions, passwordActions } from "./accessActions";
import { FullChip, LinkChip, StatusChip } from "./AccessChips";

const th = "pb-3 text-left text-hint font-extrabold text-faint";
const HEAD = ["Bezeichnung", "Für", "Code", "Geräte", "Gültig bis", "Zuletzt", "Status"];

// Один рядок таблиці: однаковий для коду і для Klassenpasswort
const Row = ({ cells, active, status, switchProps, menu }) => (
  <tr className={cn("text-body-sm text-muted", !active && "opacity-60")}>
    <td className="py-4 pr-3 font-extrabold text-ink">{cells[0]}</td>
    <td className="pr-3">{cells[1]}</td>
    <td className="pr-3 whitespace-nowrap text-ink">{cells[2]}</td>
    <td className="pr-3">{cells[3]}</td>
    <td className="pr-3">{cells[4]}</td>
    <td className="pr-3">{cells[5]}</td>
    <td className="pr-3">
      <span className="flex gap-1.5">{status}</span>
    </td>
    <td>
      <div className="flex items-center justify-end gap-3">
        <Switch {...switchProps} />
        {menu}
      </div>
    </td>
  </tr>
);

// Таблиця Zugangscodes на ПК (макет 14c pc-01); останній рядок — Klassenpasswort
const AccessTable = ({ codes, password, today, onToggle, onAction, onPasswordToggle }) => (
  <table className="w-full border-collapse">
    <thead className="border-b border-hair">
      <tr>
        {HEAD.map((name) => (
          <th key={name} className={th}>
            {name}
          </th>
        ))}
        <th className={th}>
          <span className="sr-only">Aktionen</span>
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-hair">
      {codes.map((code) => (
        <Row
          key={code.id}
          active={code.active}
          cells={[code.label, audienceShort(code.audience), code.masked, devicesShort(code.devices, code.maxDevices), validText(code), lastUsedDay(code.lastUsedAt, today)]}
          status={
            <>
              <StatusChip code={code} />
              <FullChip code={code} />
              <LinkChip code={code} />
            </>
          }
          switchProps={{ checked: code.active, onChange: () => onToggle(code), label: code.active ? `${code.label} sperren` : `${code.label} entsperren` }}
          menu={<CodeMenu code={code} items={accessActions(code)} onAction={onAction} />}
        />
      ))}
      {password && (
        <Row
          active={password.enabled}
          cells={["Klassenpasswort", "alle (alt)", "••••••••", devicesShort(password.devices, null), "ohne Ablauf", lastUsedDay(password.lastUsedAt, today)]}
          status={<Badge variant={password.enabled ? "ok" : "off"}>{password.enabled ? "Aktiv" : "Aus"}</Badge>}
          switchProps={{ checked: password.enabled, onChange: onPasswordToggle, label: password.enabled ? "Klassenpasswort ausschalten" : "Klassenpasswort einschalten" }}
          menu={<CodeMenu code={{ label: "Klassenpasswort" }} items={passwordActions(password)} onAction={(kind) => onAction(kind, null)} />}
        />
      )}
    </tbody>
  </table>
);

export default AccessTable;
