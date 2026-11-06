# 12 · ПК-раскладка

**Статус:** в работе
**Источники:** `/opt/orbook-be/design/ORBook Soft/3 PC Hell`, `4 PC Dunkel` (экраны 04–40, 50–52; Admin 41–49 — часть 13), сверка 2026-11-06.

## Зачем
На компьютере (от 1024 px) ученик видит то же, что на телефоне, но в раскладке ПК: сайдбар слева, широкие страницы, панели справа, окна по центру, горячие клавиши.

## Что уже было (сверено скриншотами, совпадает с макетом)
Woche (04, 05), Tag Liste и Zeitleiste (06, 07), панели «Stunde» и «Info zum Tag» (08, 09), меню по правому клику (10), меню недели (11), выбор недели (12), Teilen (13), панель Klausur (15), Klasse verlassen (30), свёрнутый сайдбар (50).

## Что делаем в этой части
| Экран | Макет | Что меняем |
|---|---|---|
| Einstellungen | 22–29 | На ПК: слева своё меню разделов (Übersicht, Meine Kurse, Darstellung, Fachfarben, Notizen-Sync, Editor-Code, Datenschutz, «Klasse verlassen»), справа выбранный раздел. «Übersicht» — плитки в две колонки с подписью-состоянием. Пункт «Einstellungen» в сайдбаре подсвечен на всех этих страницах. |
| Tastenkürzel | 52 | Окно со списком клавиш (`?` или плитка в Einstellungen). Недостающие клавиши: `W` Woche, `D` Tagesansicht, `N` Notiz, `K` Klausur eintragen, `R` Plan neu laden, `⌘B` сайдбар. |
| Klausuren | 14, 16 | В шапке: поиск «Thema oder Fach suchen», кнопка фильтра, «+ Klausur eintragen» (текстом). Переключатель «Kommend · 5 / Vergangen · 12». Справа: карточка «N Tage bis …» и календарь месяца с точками Klausuren. |
| Statistik | 20 | Четыре плитки (+ «Ausfallquote … von N Stunden»), «Halbjahr», график «<Monat> nach Woche», «Ausfall nach Stunde», раскладка 2 + 3 колонки. |
| Suche ⌘K | 51 | Окно по центру: поле, группы «Stunden», «Klausuren», «Aktionen» (Klausur eintragen, Zu heute springen, Dunkles Design), подсказка клавиш снизу. |

## Данные
Новых запросов нет. Klausuren: `GET /api/exams` (как сейчас; «Vergangen» — `scope=past`, если есть в API, иначе только счётчик из имеющихся). Statistik: `GET /api/stats` — `byWeek`, `byPeriod`, `totals.cancelRate`, `totals.lessons` (уже приходят).

## Состояния
Как в частях 06–11: загрузка, офлайн, ошибка уже есть и на ПК. Пустые графики (`byWeek`/`byPeriod` пустые) — блок не показываем. `cancelRate` может быть 0 — показываем «0 %».

## Бэкенд
Не нужен.

## Чего здесь НЕТ
- «Mitteilungen» (26) — часть 17 (Push). Плитку и пункт меню пока не показываем.
- Admin (41–49) — сделано в части 13.

## Отличия от дизайна
- Под датой дня и в шапке недели — строки «Stand»/«aktualisiert» (решение владельца 2026-11-05), их в макете нет.
- Сайдбар «Stand» берёт время последней проверки плана, как на телефоне.

## Слова
- **Сайдбар** — левая колонка с меню на ПК.
- **Панель справа** — окно, которое выезжает справа поверх страницы (Stunde, Klausur, Info zum Tag).
- **Палитра ⌘K** — окно поиска по всему: урокам, Klausuren и действиям.

## Открытые вопросы
Нет.
