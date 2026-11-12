import { CornerDownLeft } from "lucide-react";

// Строка «↩ von Mi 17.09., 3. Std – fiel aus» под записью в списке (макет 24 handy-08)
const MovedLine = ({ children }) => (
  <span className="mt-1 flex items-center gap-1.5 text-caption text-accent-ink">
    <CornerDownLeft className="size-3.5 shrink-0 -scale-x-100" />
    <span className="truncate">{children}</span>
  </span>
);

export default MovedLine;
