# 23 · Datenschutz

**Статус:** на демо, ждёт проверки текста владельцем
**Источники:** макет `ORBook Soft` 27 (телефон) и 29 (ПК); код бэкенда `/opt/orbook-be/src/orbook` (миграции 0001–0011, `cleanup.py`, `appsettings.py`, `security/sessions.py`); `/opt/orbook-be/docs/DATENSCHUTZ.md` (от 11.10 — устарел, сверено по коду); 2026-11-12.

## Зачем
Старый текст писался до Zugangscodes, учителей, Hausaufgaben, Termine и Materialien и местами врал («gemeinsames Passwort», «ohne Autor», «keine Cookies außer der Anmeldung»). Нужен текст, который точно описывает, что приложение делает.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Datenschutz | 27 (телефон), 29 (ПК, внутри Einstellungen) | коротко 5 строк как в макете + «Genauer»: 8 раскрывающихся разделов, «Stand», «Meine Sync-Notizen löschen» |

## Что куда нажимать
- Mehr → Datenschutz, или ссылка на экране входа (`/datenschutz`, без входа).
- Раздел в «Genauer» — нажать, раскрывается; открыт один за раз.

## Данные
| На экране | Откуда | Может быть пустым? |
|---|---|---|
| Verantwortlich | `GET /api/public/info` → `privacy.responsibleName/Email` | да → «Noch nicht angegeben.» |
| всё остальное | `src/shared/datenschutz.js` (текст во фронте) | нет |

## Разделы «Genauer»
Anmelden · Plan und Einträge · Notizen und Sync · Auf deinem Gerät · Cookies · Wie lange wir Daten aufheben · Links nach draußen · Deine Rechte. Сроки — значения по умолчанию из `appsettings.py` (админ может менять часть из них — так и написано).

## Бэкенд
Не нужно. (Сроки не отдаются в `/api/public/info`, поэтому в тексте — «voreingestellt».)

## Чего здесь НЕТ
- Push-уведомлений (часть 17) — когда появятся, дописать раздел.
- Отдельного «Impressum».

## Отличия от дизайна
- Короткие строки переписаны по фактам (макет устарел).
- Блок «Genauer» — новый, в стиле карточек версий из «Neuigkeiten» (дизайн 22b ок): заголовок «Genauer» как подписи групп, карточки `bg-card`, раскрытие с плавной высотой.

## Правило на будущее
Часть меняет данные (таблица, cookie, срок, внешний сервис) → поправить `src/shared/datenschutz.js` и `STAND`.

## Слова
- **Hash** — «отпечаток» пароля: по нему можно проверить ввод, но нельзя восстановить пароль.
- **TDDDG** — немецкий закон, § 25 разрешает без согласия cookie, без которых сайт не работает.
- **Art. 6 Abs. 1 lit. f DSGVO** — основание «законный интерес» для обработки данных.

## Открытые вопросы (решает владелец)
- [ ] Основание: «berechtigtes Interesse» (lit. f) — подходит? (это не юридическая консультация)
- [ ] «Der Server steht in Deutschland» и «Wir geben keine Daten weiter» — верно?
- [ ] Контакт «Verantwortlich» на демо/проде заполнен в админке?
