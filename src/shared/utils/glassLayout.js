// «Glas» (часть 30a): компоненты библиотеки liquid-glass сами задают цвет, высоту и скругление.
// От нашего className им нужны только классы раскладки — ширина, отступы, положение
const LAYOUT = /^((sm|md|lg|desktop|max-lg|max-sm):)?(w-|min-w-|max-w-|flex-|basis-|grow|shrink|self-|order-|col-|row-|m[trblxy]?-|-m[trblxy]?-|hidden$|block$|absolute$|relative$|top-|right-|bottom-|left-|inset-|z-|-translate)/;

export const layoutOnly = (className = "") =>
  String(className ?? "")
    .split(/\s+/)
    .filter((name) => LAYOUT.test(name))
    .join(" ");
