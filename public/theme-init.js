// Ставить тему і розмір шрифту до першого малювання, щоб екран не блимав.
// Окремий файл, бо сервер забороняє вбудовані скрипти (CSP script-src 'self').
(function () {
  try {
    var theme = localStorage.getItem("theme") || "system";
    var dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");

    // Шрифт лежить серед налаштувань userStore (ключ "orbook-user")
    var user = JSON.parse(localStorage.getItem("orbook-user") || "{}");
    if (user.state && user.state.fontScale) document.documentElement.dataset.fontScale = user.state.fontScale;
  } catch {
    // localStorage заборонено: лишаємо світлу тему і звичайний шрифт
  }
})();
