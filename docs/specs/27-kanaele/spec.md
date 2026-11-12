# Часть 27 · Kanäle: Telegram-группа класса и «Für morgen»

Макеты: `design/neu/27-kanaele/` (ок владельца 12.11.2026: «меньше текста»). API: `/opt/orbook-be/docs/API.md` → «Kanäle (Admin, часть 27)».

## Решения владельца (12.11.2026)
- Один общий бот на сервер, у каждого класса — своя **группа** (не канал). Токен — `orbook telegram-token` на сервере.
- В группе — предметы, Kürzel, кабинеты, тесты, домашки; без имён учеников; группа закрытая.
- Neuer Plan и Für morgen включены, Neuer Test выключен, N = 30 минут.
- WhatsApp: автоматически нельзя (у Groups API Meta — максимум 8 участников, платно и с проверкой бизнеса). Вместо этого — «Nachricht teilen» в админке и галочка «Aufgaben» в обычном «Teilen» для всех.

## Экраны
| Экран | Где | Данные |
|---|---|---|
| Admin → Kanäle | `/admin/kanaele` (ПК — меню, телефон — Einstellungen и «Übersicht → Schnell») | `GET /api/admin/channels`, настройки `channels.*` |
| Telegram verbinden | шторка | `POST …/telegram/link`, затем `GET /api/admin/channels` раз в 3 с |
| Nachricht teilen | шторка | `GET …/channels/text?kind=` |
| Teilen (ученики) | `?sheet=teilen` | `GET /api/share?include=…,homework` |

## Отличия от макета
- «Für morgen · wann?» — не шторка, а список-«пигулка» в строке (как время в Soft 45): то же действие, на один экран меньше.

## Проверка
`shared/utils/channels.test.js`; бэкенд — `tests/test_channels.py`. Скриншоты: `/root/work/orbook-compare/27-kanaele/shots/` (`_tools/p27.mjs`).
