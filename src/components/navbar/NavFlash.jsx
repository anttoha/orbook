// Кольцо и мягкий фон поверх вкладки сразу после правки (часть 38). Сам по себе невидим (opacity-0):
// при «Animationen: Aus» анимация выключена — и подсветки нет. Новый stamp → новый key → анимация с начала
const NavFlash = ({ stamp }) =>
  stamp ? <span key={stamp} aria-hidden="true" className="pointer-events-none absolute inset-0 animate-nav-flash rounded-full bg-accent/12 opacity-0 ring-2 ring-accent ring-inset" /> : null;

export default NavFlash;
