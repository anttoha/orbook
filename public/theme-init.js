// Ставить тему до першого малювання, щоб екран не блимав світлим.
// Окремий файл, бо сервер забороняє вбудовані скрипти (CSP script-src 'self').
(function () {
  try {
    var theme = localStorage.getItem("theme") || "system";
    var dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch {
    // localStorage заборонено: лишаємо світлу тему
  }
})();
