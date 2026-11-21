# 39 · Widgets «Noten», «Neue Noten», «Fehlzeiten» (Android)

**Статус:** в работе (дизайн ок 2026-11-21)
**Источники:** `design/neu/39-widget-noten/` (handy-01…06), виджеты 31d (`design/neu/31d-widget-design/`), экран «Noten» 36b, `docs/API.md` бэкенда «Noten» (формат данных), код 36c (`android/…/noten/`).

## Зачем
Посмотреть средний балл, новые оценки и пропуски прямо с рабочего стола, не открывая приложение. Виджет видит любой, кто смотрит на телефон, поэтому оценки по умолчанию скрыты.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Noten | handy-01-noten(-sichtbar) | Schnitt полугодия, предметы со средним; новые — первыми с «neu»; широкий — две колонки |
| Neue Noten | handy-02-neue(-sichtbar) | оценки полугодия, новые сверху: Fach · Art · дата · Note |
| Fehlzeiten | handy-03-fehl(-sichtbar) | Fehltage, Fehlstunden, unentschuldigt; на 4×3 — «Zuletzt» |
| Состояния | handy-04-ohne-anmeldung | «In ORBook bei Noten anmelden», «Noch keine Noten», «Keine Fehlzeiten» |
| Оформление | handy-05-designs | Soft / Glas / Klar, hell/dunkel — как у всех виджетов |
| Widget einstellen | handy-06-einstellen | 12 плиток «Inhalt», «Anzeige» → «Noten anzeigen» |

## Что куда нажимать
- Положить виджет → «Widget einstellen» → плитка «Noten» / «Neue Noten» / «Fehlzeiten» → «Fertig».
- «Noten anzeigen» (по умолчанию выкл.) — оценки и числа вместо «•••». Своя настройка у каждого виджета.
- Нажатие на виджет: Noten и Neue Noten → `/noten`, Fehlzeiten → `/fehlzeiten`.

## Данные
Сервер не участвует: всё берётся из того, что приложение уже хранит (36c).
| На виджете | Откуда | Может быть пустым? |
|---|---|---|
| оценки, пропуски | `NotenStore.data()` — последний JSON (формат `POST /api/noten/abrufen`), зашифрован Keystore | да → «In ORBook bei Noten anmelden» |
| полугодие | как `defaultHalf` в `noten.js`: есть оценки 2. полугодия → 2, иначе 1 | — |
| Schnitt, средние | как `overviewOf`/`averageOf`: Σ value×weight / Σ weight, только `value != null`; Schnitt — среднее предметов | `null` → «–» |
| «neu» | ключи `gradeKey` из `fresh` сайта (мост `notenFresh`) + новые из фоновой проверки | пусто → без «neu» |
| «Stand 16.09.» | `updatedAt` (иначе дата `fetchedAt`) | оба null → без «Stand» |
| Fehlzeiten | как `absenceStats`/`absenceEntries` | `hours` null → `amount` |

Технические решения:
- **Где лежат оценки для виджета** — только в `NotenStore` (зашифровано). Без «Angemeldet bleiben» приложение оценки не хранит → виджет показывает «In ORBook bei Noten anmelden». Отдельной копии для виджета не делаем.
- **«neu»**: сайт после каждого изменения `fresh` передаёт ключи мостом `notenFresh(json)` → `NotenStore.saveFresh` (тоже зашифровано). Фоновая проверка добавляет туда новые оценки. «Abmelden» стирает.
- **Перерисовка**: после загрузки оценок (кнопка или фон), `notenFresh`, «Abmelden» — `Widgets.redraw`. `WidgetSync` для этих видов сервер не спрашивает.
- Настройка: поле `showGrades` (bool, `false`) в `widgetConfig.js` и `WidgetConfig` (Kotlin). У трёх видов в «Einstellen» нет «Klasse», «Nur meine Kurse» и «Verhalten» (обновлять нечего — данные с телефона; куда открыть — само).
- Правило содержания — тот же `fit()` из `WidgetLayout.kt`; две колонки у широкого «Noten» — новая чистая функция с тестом.
- Превью в «Einstellen» — свой маленький блок по данным сайта (`notenStore`), с «•••», пока «Noten anzeigen» выкл.

## Состояния
- Загрузка: нет (данные локальные).
- Офлайн: не важно; «Stand …» показывает, насколько данные старые.
- Не вошёл / вышел / без «Angemeldet bleiben»: «In ORBook bei Noten anmelden».
- Пусто: «Noch keine Noten» (нет оценок в полугодии), «Keine Fehlzeiten».
- Расшифровать не удалось (ключ пропал) → как «не вошёл».

## Бэкенд
Не нужно.

## Datenschutz
Абзац «Noten aus InfoPoint»: виджеты показывают только сохранённое приложением, оценки и Fehlzeiten там по умолчанию скрыты, с «Noten anzeigen» их видит любой, кто смотрит на экран. `STAND` — дата выкладки.

## Чего здесь НЕТ
- Zeugnis в виджете, выбор полугодия, Notenrechner.
- Виджет не ходит в InfoPoint сам — обновление как раньше (кнопка в приложении или фон «Neue Note»).

## Отличия от дизайна
- В «Einstellen» у трёх видов нет блока «Verhalten» (на макете его тоже нет).

## Слова
- **fresh** — оценки, которые пришли, но предмет ещё не открывали («neu»).
- **Keystore** — хранилище ключей Android; ключ не покидает телефон.
- **Glance** — библиотека Android, на которой нарисованы виджеты.

## Открытые вопросы
нет
