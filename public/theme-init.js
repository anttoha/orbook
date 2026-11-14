// Ставить тему і розмір шрифту до першого малювання, щоб екран не блимав.
// Окремий файл, бо сервер забороняє вбудовані скрипти (CSP script-src 'self').
(function () {
  try {
    var theme = localStorage.getItem("theme") || "system";
    var dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");

    // Шрифт лежить серед налаштувань userStore (ключ "orbook-user")
    var user = JSON.parse(localStorage.getItem("orbook-user") || "{}");
    var st = user.state || {};
    var root = document.documentElement.dataset;
    if (st.fontScale) root.fontScale = st.fontScale;

    // Оформлення (частина 30a) — та сама логіка, що appearanceAttrs у src/shared/utils/appearance.js
    var one = function (list, value) { return list.indexOf(value) >= 0 ? value : list[0]; };
    root.design = one(["soft", "glas", "klar"], st.design);
    root.accent = one(["violett", "blau", "gruen", "orange", "pink", "grafit"], st.accent);
    root.glassBg = one(["aurora", "abendrot", "meer", "wald"], st.glassBg);
    root.glass = one(["voll", "einfach"], st.glassMode);
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.motion = ["voll", "weniger", "aus"].indexOf(st.motion) >= 0 ? st.motion : reduced ? "weniger" : "voll";
  } catch {
    // localStorage заборонено: лишаємо світлу тему і звичайний шрифт
  }
})();
