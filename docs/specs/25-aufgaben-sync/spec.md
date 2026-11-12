# 25 · Aufgaben + Sync всего + QR

**Статус:** дизайн ок 2026-11-12, ответы владельца 2026-11-12; бэкенд не нужен
**Источники:** `design/neu/25-aufgaben-sync/` (артефакт https://claude.ai/artifact/5WJ8aVXREHzVm17rZcxoEg), идеи 11.11 (`docs/ideas/2026-11-11/ideas.md`), `/opt/orbook-be/docs/API.md` («Notizen-Sync», «Hausaufgaben»), `/opt/orbook-be/docs/frontend/06-notizen.md`, код `src/shared/store/syncStore.js`, `src/shared/utils/notes.js`, `src/pages/Homework.jsx`, `src/pages/JoinPage.jsx`, `src/pages/AuthPage.jsx`.

## Зачем
Записывать, что сделать и что уже сделал (домашки класса и свои дела). Один Sync-Code переносит на второе устройство всё, а не только заметки. Коды удобно передавать: QR и лист A4 для класса и для учителя. Новичку — три коротких подсказки.

## Решения владельца (12.11.2026)
1. «Aufgaben» — во вкладке Tests вместо «Hausaufgaben» (выбрал Claude: «как хочешь»).
2. Синхронизировать всё; что именно — **настраивается** переключателями.
3. Лист A4 может печатать каждый, у кого есть «Klasse einladen».
4. QR кода учителя только вписывает код; **по ссылке-приглашению учитель тоже может зайти** — как ученик («Beitreten») или своим Lehrer-Code (ссылка «Lehrkraft?» на той же странице).

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Aufgaben | `handy-01…04`, `pc-01-aufgaben` | список «Bis morgen / Diese Woche / … / Ohne Datum», кружок «erledigt», «Erledigt · N» (свернуто), «Rückgängig», «+» → Eigene Aufgabe |
| Tag | `handy-05-tag` | «Aufgaben · fällig …» с кружками и своими задачами |
| Mehr | `handy-06-mehr` | «Synchronisieren», «Kurz erklärt» |
| Synchronisieren | `handy-07…09`, `pc-02-sync` | код + QR, «Was wird synchronisiert» (4 переключателя), «Gerät verbinden?» после QR |
| Drucken | `handy-10/11`, `pc-03-drucken`, `a4-01/02` | строка «Blatt für die Klasse drucken», выбор Aushang / Kärtchen, Anleitung вкл/выкл |
| Code erstellt | `handy-12-lehrer-code-qr`, `a4-03` | QR + Kopieren + Drucken (лист учителя) |
| Kurz erklärt | `handy-13…15`, `pc-04-tipp` | 3 карточки, «Überspringen», «Weiter», «Los geht’s» |

## Данные (всё только на устройстве; на сервер — лишь в зашифрованном Sync-блоке)
- **Своя задача:** `{ id, text, due: "2026-09-19" | null, subject: "De" | null, done, updatedAt, deleted? }` — `tasksStore` (`localStorage` «orbook-tasks»).
- **Галочка у домашки класса:** `{ id: <id домашки>, done, updatedAt }` в `tasksStore.marks`. Класс и сервер её не видят.
- **Sync-блок** (тот же `PUT /api/sync`, шифрование — эталон `syncCrypto.js` без изменений): `{ notes, tasks, marks, kurse: { value, updatedAt }, darstellung: { value, updatedAt } }`. Старый блок `{ notes }` читается как раньше.
  - Notizen, свои задачи, галочки — слияние по `id` и `updatedAt` (как заметки, с «надгробками»).
  - Meine Kurse (`picked`, `hiddenRequired`, `coursesChosen`) и Darstellung+Fachfarben (тема, вид, шрифт, формат даты, выходные, цвета) — побеждает более новое изменение. При подключении нового устройства — берутся с кода.
  - Выключенная часть не применяется и не отправляется от этого устройства, но то, что уже лежит в блоке, сохраняется для других устройств.
  - Лимит блока 64 КБ (≈48 КБ текста) — как раньше; галочки старше 60 дней удаляются.
- Переключатели «Was wird synchronisiert» — свои у каждого устройства, по умолчанию все включены.

## Ссылки с кодом (QR)
Код всегда после `#` — браузер не отправляет эту часть на сервер, в журналы она не попадает. Открытие ссылки сразу убирает `#…` из адреса.
- Sync: `/mehr/sync#K7QM-4TXP-…` → экран «Gerät verbinden?» (без входа — сначала вход, потом этот экран).
- Lehrer-Code: `/?zugang=lehrkraft#ORB-L-…` → форма учителя с вписанным кодом, «Anmelden» нажимает человек.
- Editor-Code: `/mehr/editor-code#…` → поле с вписанным кодом.
- Приглашение класса — как в части 16 (`/i/<token>`), плюс ссылка «Lehrkraft? Mit Lehrer-Code anmelden».

## Печать
`window.print()` и печатная вёрстка (`print:` в Tailwind): на бумаге только лист, приложение скрыто. Aushang — один большой QR, три шага (можно выключить), «gilt bis» из приглашения; Kärtchen — 8 карточек. Лист учителя — QR, код, три шага, что можно делать (предметы из кода). На листе нет имён учеников.

## Kurz erklärt
Показывается один раз после выбора курсов (учителю — после первого входа); флаг `seenTips` в `userStore`. Снова — Mehr → «Kurz erklärt» (на ПК — в меню Mehr).

## Состояния
- Нет домашек и задач → «Alles erledigt» (если есть сделанные — строка «Erledigt · N»). Домашки не загрузились → прежняя ошибка, свои задачи всё равно видны.
- Sync выключен школой → как раньше «Ausgeschaltet»; задачи и галочки просто остаются на устройстве.
- Ссылка с неверным Sync-кодом → ошибка под полем, как при вводе.
- Своя задача без даты → группа «Ohne Datum»; сделанные свои задачи видны в «Erledigt» 14 дней, потом исчезают.

## Чего здесь НЕТ
- Камеры внутри приложения: QR сканирует обычная камера телефона.
- Сервер не знает о задачах и галочках (кроме зашифрованного блока).
- Напоминаний о задачах (часть 17).

## Решения при сборке
- `syncNotes` из `notes.js` заменён общим `syncBlock` в `shared/utils/syncPayload.js` (тот же алгоритм: GET → слить → PUT с `baseVersion`, на 409 — заново).
- Время изменения Kurse/Darstellung ставится подпиской на сторы, а не в каждом сеттере.
- «+» в Aufgaben: у кого есть право на Hausaufgaben — меню «Eigene Aufgabe» / «Hausaufgabe für die Klasse»; у остальных сразу своя задача.

## Отличия от дизайна
- В шторке «Eigene Aufgabe» второй чип — ближайший учебный день после завтра (в макете «Fr 19.09.»).

## Слова
- **Aufgabe** — домашка класса или своё дело; **erledigt** — отмечено сделанным (только у тебя).
- **Sync-блок** — зашифрованная коробка на сервере, ключ к ней — Sync-Code.
- **Надгробок** — запись «удалено», чтобы удаление дошло до других устройств.

## Открытые вопросы
Нет.
