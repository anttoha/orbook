import { lastUsedDay, rightsText, validText } from "../../shared/utils/admin";
import { cn } from "../../shared/utils/cn";
import Switch from "../ui/Switch";
import CodeChip from "./CodeChip";
import CodeMenu from "./CodeMenu";

const th = "pb-3 text-left text-hint font-extrabold text-faint";

// Таблиця кодів на ПК (макети 43 і 42). compact — на Übersicht: без «Gültig bis»
const CodeTable = ({ codes, today, compact = false, onToggle, onAction }) => (
  <table className="w-full border-collapse">
    <thead className="border-b border-hair">
      <tr>
        <th className={th}>Name</th>
        <th className={th}>Code</th>
        <th className={th}>Rechte</th>
        {!compact && <th className={th}>Gültig bis</th>}
        <th className={th}>Zuletzt</th>
        <th className={th}>Einträge</th>
        <th className={th}>Status</th>
        <th className={th}>
          <span className="sr-only">Aktionen</span>
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-hair">
      {codes.map((code) => (
        <tr key={code.id} className={cn("text-body-sm text-muted", !code.active && "opacity-60")}>
          <td className="py-4 pr-3 font-extrabold text-ink">{code.label}</td>
          <td className="pr-3 whitespace-nowrap text-ink">{code.masked}</td>
          <td className="pr-3">{rightsText(code.rights)}</td>
          {!compact && <td className="pr-3">{validText(code)}</td>}
          <td className="pr-3">{lastUsedDay(code.lastUsedAt, today)}</td>
          <td className="pr-3 text-ink">{code.examCount}</td>
          <td className="pr-3">
            <CodeChip code={code} />
          </td>
          <td>
            <div className="flex items-center justify-end gap-3">
              <Switch checked={code.active} onChange={() => onToggle(code)} label={code.active ? `${code.label} sperren` : `${code.label} entsperren`} />
              <CodeMenu code={code} onAction={onAction} />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default CodeTable;
