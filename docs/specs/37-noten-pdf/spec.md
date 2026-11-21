# 37 — Noten als PDF

Источник: строка 37 в `docs/specs/README.md`, дизайн `design/neu/37-noten-pdf` (ок 2026-11-21) и пожелание владельца в тот же день: «оригинал тоже можно распечатывать, а не только неофициальное».

## Экраны
`handy-01-noten`, `handy-02-fehlzeiten` (кнопка), `handy-04-auswahl`, `handy-05-original-laden` (шторка), `handy-03-app-alt` (тост), `pc-01-noten` (кнопка «Als PDF»), `a4-01-halbjahr`, `a4-02-zeugnis`, `a4-03-fehlzeiten` (лист).

## Что видит пользователь
- В шапке «Noten» и «Fehlzeiten» — круглая кнопка «PDF» слева от ↻ (ПК: кнопка «Als PDF» слева от выбора полугодия). Без оценок кнопки нет.
- Нажал — шторка «Als PDF» (на ПК — окно): три строки, выбрать одну, внизу кнопка «Als PDF».
  - **ORBook-Blatt** — наш лист A4 из оценок на устройстве. В «Noten» печатается выбранная вкладка (1./2. Halbjahr — оценки + пропуски; Zeugnis — Endnoten по полугодиям), в «Fehlzeiten» — только пропуски выбранного полугодия.
  - **Original · Übersicht** — страница InfoPoint «Zusammenfassung» (`getdata.php?mode=summary`) как есть.
  - **Original · Alle Noten** — «Detailansicht» (`getdata.php?mode=detail`) как есть.
- Дальше окно печати: браузер (там «Als PDF speichern») или, в Android-App, системное окно печати.
- Оригинал: пока ORBook забирает страницу — кнопка «Hole Original …» (не нажимается). Пароль не сохранён — открывается вход (как в «Noten»); неверный — вход с ошибкой; InfoPoint не отвечает / слишком часто — тост, как в «Noten».
- Старая Android-App без печати — тост «Für PDF bitte die App aktualisieren».

## Техника
- **ORBook-Blatt:** `components/noten/print/` — лист рисуется в `PrintArea` (часть 25, `usePrint`), цвета `qr-*`/светлые токены, `@page A4`. Данные — `shared/utils/notenSheet.js` (чистая функция: из `data` + вкладки → строки листа; тест рядом). На сайте `window.print()`, в App — мост `printPage()` (PrintManager печатает WebView, `@media print` оставляет только лист).
- **Оригинал на сайте:** `POST /api/noten/original` (новое, бэкенд) → `{html}`; страница печатается в скрытой `iframe` с `sandbox="allow-same-origin allow-modals"` (скрипты внутри не запускаются) через `contentWindow.print()`, рамка удаляется после печати. Нигде не сохраняется.
- **Оригинал в App (прод):** приложение само идёт в InfoPoint (`InfoPoint.kt`, как 36c) за `getdata.php?mode=…`, грузит страницу в невидимый WebView без JavaScript с адресом InfoPoint как базой (стиль печати школы подтягивается сам) и печатает. Мост `notenOriginal(json)`, ответ событием `{type:"notenOriginal", id, ok, error}`. В демо (адреса нет) — HTML с сервера и мост `printHtml(html)`.
- Тексты — немецкие, EN/UK в словарях.

## Бэкенд: `POST /api/noten/original`
- Тело `{username, password, mode: "summary"|"detail"}`, ответ `{html, fetchedAt}`. Вход, страница, `css/site.css` школы, выход — как `abrufen`; ничего не хранится и не пишется в лог.
- Сервер чистит страницу: только безопасные теги и атрибуты (таблицы, заголовки, текст; без `<script>`, `<img>`, `<link>`, `on…`, ссылок), стиль школы вставляется внутрь `<style>` (без `url(…)` и `@import`) — браузер не ходит на сайт школы.
- Лимиты: 6 попыток за 10 минут с устройства, общий лимит школы 30/мин; 5-минутная пауза `abrufen` **не** мешает.
- Ошибки — как у `abrufen`. Демо: выдуманные `beispiel.html` / `beispiel-kompakt.html` и свой простой стиль, `falsch` → `infopoint_denied`.

## Решения (технические, приняты сами)
- Отдельный запрос вместо «сохранять оригинал при каждом обновлении»: оригинал с именем ученика и учителей не лежит на устройстве и не уходит в Sync — только напечатать.
- Оригинал — весь документ (обе половины года, как в InfoPoint), без выбора полугодия.
- Строка в Datenschutz: «Original aus InfoPoint drucken — Seite wird nur zum Drucken geholt, nicht gespeichert».

## Чего нет
Своего PDF-файла (генератор PDF): печать браузера/Android уже умеет «Als PDF speichern». Отправки PDF куда-либо.

## Слова
- **Original** — страница InfoPoint как её видит ученик в браузере школы.
- **sandbox-iframe** — рамка, в которой чужая страница не может запустить код.
- **PrintManager** — системная печать Android, умеет «Als PDF speichern».
