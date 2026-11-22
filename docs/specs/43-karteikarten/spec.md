# 43 · Karteikarten (Vokabeln)

**Статус:** в работе (дизайн ок 2026-11-22)
**Источники:** `design/neu/43-karteikarten/` (handy-01…15, pc-01, pc-02), Lernplan — часть 41 (`shared/utils/lernplan.js`, `components/lernplan/*`), Aufgaben — часть 25 (`shared/utils/tasks.js`), Start — 30c (`components/start/*`), «Untere Leiste» — 35 (`shared/utils/navLayout.js`), Sync — 25/42 (`shared/utils/syncPayload.js`, `shared/store/syncStore.js`, эталон `shared/utils/syncCrypto.js`), QR — `components/ui/QrCode.jsx`.

## Зачем
Ученик учит слова и термины карточками: сам вбивает или вставляет списком, приложение каждый день показывает только те карточки, которые пора повторить (коробки Leitner), и связывает стопку с тестом.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Karteikarten | `handy-01-karteikarten`, `handy-13-leer` | «Heute lernen · N Karten aus M Stapeln» + «Lernen»; стопки по предметам (имя, «N Karten · K fällig» / «alles sicher», полоска Lernstand, бейдж теста); пусто — «Noch keine Stapel» + «Stapel anlegen» |
| Stapel | `handy-02-stapel`, `handy-14-menue`, `handy-15-loeschen` | тест стопки; «Lernstand» — 5 коробок; «Zuerst zeigen»; «K fällige lernen», «Alle N üben»; карточки (первые 6 + «Alle N anzeigen»); ⋮ → Bearbeiten / Teilen / Lernstand zurücksetzen / Löschen |
| Lernen | `handy-03-lernen`, `handy-04-umgedreht`, `handy-05-geschafft` | «5 / 12» + полоска; карточка → «Umdrehen» → «Weiß ich nicht» / «Weiß ich»; итог «Geschafft!» |
| Neuer Stapel / Bearbeiten | `handy-06-neuer-stapel` | Name, Fach, Seiten (2 имени), Für Test, Karten: «Einzeln» / «Liste» |
| Karte hinzufügen | `handy-07-karte-hinzufuegen` | шторка: две строки, «Fertig», «Nächste Karte», тост «… gespeichert» |
| Start, Aufgaben, тест (43b) | `handy-08-start`, `handy-09-aufgaben`, `handy-10-test` | блок «Karteikarten»; строки «Karteikarten · Fach · heute» в «Heute»; в шторке теста — карточка стопки |
| Teilen / Übernehmen (43b) | `handy-11-teilen`, `handy-12-uebernehmen` | QR + ссылка, «Link kopieren», «Teilen»; импорт: карточки, Fach, «Übernehmen» |
| ПК | `pc-01-karteikarten`, `pc-02-lernen` | слева стопки, справа стопка; учить — карточка по центру |

## Что куда нажимать
- Раздел `/karteikarten`: в группе «Leistung» по умолчанию (`navLayout.SECTIONS.karteikarten`, в `defaultNav` после «aufgaben»), строка в «Mehr → Seiten», можно поставить в панель (часть 35).
- «Lernen» (Heute lernen) → `/karteikarten/lernen` — все fällige из всех стопок подряд (по стопкам).
- Строка стопки → `/karteikarten/:id` (на ПК — правая колонка той же страницы, как «Noten»).
- «+» → `/karteikarten/neu`. ⋮ → «Bearbeiten» (`/karteikarten/:id/bearbeiten`, та же форма), «Teilen» (шторка), «Lernstand zurücksetzen» (вопрос → все карточки в «Neu»), «Löschen» (вопрос).
- «K fällige lernen» → `/karteikarten/:id/lernen`; «Alle N üben» → `/karteikarten/:id/lernen?alle=1` (коробки не двигаются).
- Lernen: «Umdrehen» (или клик по карточке, пробел на ПК) → оборот; «Weiß ich» / «Weiß ich nicht» (на ПК стрелки ← →). Крестик — выйти (что ответил — сохранено). «Geschafft!»: «Die N nochmal» — сразу ещё раз ошибки (как «üben», коробки не двигаются), «Fertig» — назад.
- «+ Karte» в стопке → шторка «Karte hinzufügen»: «Nächste Karte» сохраняет и очищает поля, «Fertig» сохраняет (если заполнено) и закрывает.
- Строка карточки → та же шторка с полями карточки и «Löschen».
- Тест на карточке стопки → шторка теста. В шторке теста: «Karteikarten» — привязанные стопки с «Jetzt lernen»; «Stapel wählen» → список стопок (галочкой) + «Neuer Stapel» (форма с предметом и тестом).
- Строка «Karteikarten» в Aufgaben и блок на Start → учить эту стопку (блок — всё fällige).
- «Teilen» → шторка: QR, ссылка, «Link kopieren», «Teilen» (Web Share; нет — копировать). Ссылка `https://<хост>/karten#k1.<данные>` → экран «Stapel übernehmen».

## Данные (всё только на устройстве + Sync)
Новый `kartenStore` (localStorage `orbook.karten`):
```
deck = { id: "k-…", name, subject: "En" | null, sides: ["Englisch", "Deutsch"],
         first: "a" | "b" | "mix", exam: { id, cls, date, title } | null,
         cards: [{ id, a, b, box: 1..5, due: "YYYY-MM-DD" | null }], updatedAt, deleted? }
```
- Сервер ORBook про стопки ничего не знает. Тест — снимок (id, класс, дата, название): если тест перенесли, дата берётся из списка тестов; тест удалён — бейдж и карточка теста просто пропадают (стопка остаётся).
- Предмет — Kürzel как у своих задач (`subject` в tasks.js), цвет — Fachfarbe. `null` — без предмета (серый кружок, группа «Ohne Fach»).
- Лимиты: имя 60, сторона 30, текст карточки 120 знаков; до 500 карточек в стопке, до 60 стопок.

## Leitner (`shared/utils/karten.js` + тест)
- Новая карточка: `box 1`, `due null` (= fällig сразу).
- **fällig** — `due` пусто или `due ≤ сегодня`.
- «Weiß ich»: `box = min(box+1, 5)`, `due = сегодня + [1, 2, 4, 8][box-2]`; в коробке 5 снова «Weiß ich» → +16 дней.
- «Weiß ich nicht»: `box 1`, `due = завтра`.
- «Alle üben» и «nochmal» — коробки и `due` не трогаем.
- Порядок в Lernen: сначала меньшая коробка, внутри — перемешано.
- **sicher** — коробки 4 и 5; «alles sicher» — нет fällig и все в 4–5.
- Полоска Lernstand — доли коробок 1…5 (`bg-accent` с прозрачностью 20…100 %).
- «Zuerst zeigen»: `a` — первая сторона, `b` — вторая, `mix` — случайно для каждой карточки.

## Liste («Wort – Übersetzung»)
- Разделитель — первый из: Tab, « – », « - », «=», «;», «:» (с пробелами или без для `=`, `;`, Tab). Пустые строки пропускаем.
- Строка без разделителя или с пустой стороной — ошибка «Zeile N: «–» fehlt» (подсвечена), такие не сохраняем; «Stapel speichern» сохраняет остальные. Счётчик «N Karten».
- Дубликаты (та же пара) — один раз.

## Sync
- Новая часть **«Karteikarten»** в «Was wird synchronisiert» (по умолчанию вкл.).
- Стопки едут **вторым зашифрованным блоком**: у общего блока лимит ~48 КБ, а стопки бывают большими. Его `syncId` = SHA-256(«orbook-karten-v1|» + основной syncId) (hex), ключ и функции шифрования — из эталона `syncCrypto.js` без изменений (`encryptNotes`/`decryptNotes` с этим syncId). Сервер не может связать два блока.
- Слияние по стопкам: побеждает более новый `updatedAt`, удалённые — «надгробки» (как свои задачи). Ответ в Lernen тоже меняет `updatedAt` стопки.
- «Neuen Code erzeugen» и «Sync-Daten löschen» переносят/удаляют и второй блок. Блок больше лимита → ошибка «Zu viele Karten für Sync» в «Sync», остальной Sync работает.

## Teilen (ссылкой, без сервера)
- Данные — в части ссылки после `#` (браузер её на сервер не отправляет): `k1.` + base64url(deflate-raw(JSON `{n, s, f, c: [[a, b], …]}`)) — без Lernstand и теста. Сжатие — `CompressionStream` браузера.
- QR — если ссылка ≤ 1200 знаков; длиннее — вместо QR «Zu groß für QR – teile den Link».
- `/karten#k1.…` → «Stapel übernehmen»: имя, «N Karten · A – B», выбор Fach (свой курс), первые 5 карточек + «und N weitere», «Übernehmen» → новая стопка с нуля, переход в неё. Битая ссылка — «Dieser Link ist kaputt.».
- Не вошёл в ORBook — ссылка открывается после входа (хэш запоминаем на время входа).

## Анимации (владелец 22.11: «нормальные и прикольные»)
Всё — классами `animate-*` из `@theme` (`index.css`), «Animationen: Weniger» — короткий fade, «Aus» и `prefers-reduced-motion` — без движения (как остальное приложение, `html[data-motion]`). Без конфетти (правило 13.11).
- **Переворот** — настоящий 3D: карточка поворачивается по оси Y (`perspective`, `rotateY 180°`, `backface-hidden`), ~0,45 с с лёгким «пружинным» концом.
- **Ответ** — карточка улетает: «Weiß ich» — вправо с поворотом, «Weiß ich nicht» — влево; следующая выезжает из-под неё (масштаб 0,94 → 1). Под карточкой видна «стопка» (две тени-карточки).
- **Свайп** на телефоне по перевёрнутой карточке: вправо — «Weiß ich», влево — «Weiß ich nicht»; карточка идёт за пальцем, наклоняется, край подсвечивается `ok`/`danger`; отпустил раньше порога — пружинит назад.
- **Полоска «5 / 12»** — плавно растёт; число «прыгает».
- **Geschafft!** — галочка «выпрыгивает» (как `check-pop`), плитки «gewusst / noch nicht» поднимаются по очереди, числа считают от 0, столбики коробок растут до нового значения, «+3 / −3» всплывают.
- **Lernstand** в стопке и полоски в списке — растут при открытии (по очереди, `item-rise`).
- **Список «Liste»** — счётчик «N Karten» пересчитывается с «прыжком»; строка с ошибкой мягко подсвечивается.

## Состояния
- Загрузка: нет (данные локальные). Список тестов для бейджа — из уже загруженного стора тестов; нет — без бейджа.
- Офлайн: всё работает (кроме «Teilen» через Web Share — копирование работает).
- Пусто: «Noch keine Stapel» + «Stapel anlegen». Стопка без карточек — «Noch keine Karten» и «+ Karte»; кнопок «lernen» нет.
- Нет fällig: «Heute lernen» показывает «Alles gelernt» без кнопки; кнопка «K fällige lernen» скрыта, остаётся «Alle N üben».
- Lernen открыт, а стопку удалили (Sync) — назад к списку.

## Бэкенд
Не нужно. Sync-блок — тот же `PUT /api/sync` (ещё один блок на устройство; лимит сервера 2000 блоков — хватает).

## Android-App
Отдельной работы нет (тот же сайт, localStorage, Sync). Виджеты стопки не показывают.

## Чего здесь НЕТ
- Учитель не раздаёт стопки классу (только ученик → ученик ссылкой).
- Картинок, звука, произношения, ввода ответа с клавиатуры.
- Напоминаний/уведомлений «Karten fällig».
- Связи с Lernplan (41) — план не добавляет «Karteikarten» сам.

## Отличия от дизайна
- Ссылка `…/karten#k1.…` (на макете `v1.eJx…` — пример).
- «Alles gelernt» на плашке «Heute lernen» и «Zu groß für QR» — состояния, которых нет на макетах.

## Слова
- **Stapel** — набор карточек одной темы.
- **Karte** — две стороны: слово и перевод (или термин и объяснение).
- **Kasten / Leitner** — 5 коробок: знаешь — карточка уходит дальше и приходит реже; не знаешь — обратно в первую.
- **fällig** — карточку пора повторить сегодня.
- **sicher** — карточка в коробке 4 или 5.

## Datenschutz
Раздел «Karteikarten»: стопки и Lernstand — только на устройстве; с Sync-Code — зашифрованным вторым блоком (сервер видит только шифр); «Teilen» — карточки в ссылке после «#», на сервер ORBook не попадают; кто получил ссылку, видит карточки.

## Открытые вопросы
- нет
