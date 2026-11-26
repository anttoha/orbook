# Собирает index.html — обзор макетов части 50 со встроенными SVG (для артефакта «ок дизайн?»).
# Оформление страницы — то же, что у обзора 31d (CSS и JS берём оттуда).
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(HERE, "..", "31d-widget-design", "build.py"), encoding="utf-8").read()
CSS = _src.split('CSS = """', 1)[1].split('"""', 1)[0]
JS = _src.split('JS = """', 1)[1].split('"""', 1)[0].replace("orb31d-theme", "orb50-theme")
n = 0

def unique(s):
    """SVG без пересечения id: в одной странице много макетов с одинаковыми id фильтров и градиентов."""
    global n
    n += 1
    p = f"s{n}-"
    s = re.sub(r'id="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', s)
    s = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}{m.group(1)})', s)
    return s.replace("<svg ", '<svg role="img" ', 1)

def inline(name):
    return unique(open(os.path.join(HERE, name + ".svg"), encoding="utf-8").read())

def shot(name, caption, kind="phone"):
    if not os.path.exists(os.path.join(HERE, name + "-dunkel.svg")):
        return f'<figure class="shot {kind}"><figcaption>{caption}</figcaption><div>{inline(name + "-hell")}</div></figure>'
    return (f'<figure class="shot {kind}"><figcaption>{caption}</figcaption>'
            f'<div class="v v-hell">{inline(name + "-hell")}</div><div class="v v-dunkel">{inline(name + "-dunkel")}</div></figure>')

SECTIONS = [
    ("start", "1 · Start: блок «Für dich jetzt»",
     "Первый блок на Start (размер «Groß», можно Breit/Klein). Утром: погода <b>к выходу</b> (07:05 = первый урок минус 45 мин), "
     "что взять — по погоде (фиолетовые плашки) и по расписанию (Sport → «Sportsachen»), первые уроки с Vertretung/Ausfall. "
     "Нажатие на блок ведёт в нужное место: утром — в «Tag», вечером — в следующий учебный день.",
     [("handy-01-start", "Start · 06:40")], "phone"),
    ("zeiten", "2 · Блок меняется по времени дня",
     "Одна чистая функция <code>nowFocus</code> выбирает, что показать: до выхода, во время урока (сколько осталось и что дальше), "
     "в перемену (куда идти — кабинет крупно), после уроков (Hausaufgaben на завтра, что завтра иначе, погода на завтра), "
     "вечером/в выходные (следующий учебный день), в каникулы (сколько осталось). Внизу — маленькие размеры и отдельный блок «Wetter».",
     [("handy-02-tageszeiten", "Über den Tag")], "pc"),
    ("einstellen", "3 · Настройки блока",
     "В шторке блока — только то, что касается самого блока: размер и «Vom Start entfernen». Всё содержимое настраивается в одном месте — "
     "строка «Einstellungen · Start und Widget» ведёт на страницу «Für dich jetzt» (3b). Та же строка есть в «Widget einstellen» (раздел 9).",
     [("handy-03-block-einstellen", "Block · Für dich jetzt")], "phone"),
    ("alles", "3b · НОВОЕ: все личные настройки (после «ок дизайн», 26.11.)",
     "Одна страница для блока на Start и для виджета (сверху «Start · Widget»): Mehr → «Für dich jetzt», из шторки блока и из «Widget einstellen». Всё, что у каждого своё: за сколько минут до первого урока выходить, "
     "с какого часа вечером показывать завтра, что показывать, <b>пороги Wetter-Tipps</b> (минус до «Aus» — выключить), "
     "«Am Testtag erinnern» и <b>Mitnehmen pro Fach</b>: свои вещи на каждый предмет (Sport → Sportsachen по умолчанию, остальное добавляешь сам; "
     "«Oft gebraucht» — подсказки одним нажатием). Хранится на устройстве + Sync, виджет берёт те же настройки.",
     [("handy-13-einstellungen", "Einstellungen"), ("handy-14-mitnehmen", "Mitnehmen pro Fach"), ("handy-15-mitnehmen-neu", "Neu bei Kunst")], "phone"),
    ("alles-pc", "", "", [("pc-03-einstellungen", "ПК · Einstellungen")], "pc"),
    ("woche", "4 · Погода в неделе и в дне",
     "В плашке дня недели — третьей строкой маленький значок и максимум °C (на ПК — справа в шапке колонки). "
     "В «Tag» сверху карточка: макс/мин, дождь, ветер, главная плашка «что надеть»; нажатие — шторка «Wetter».",
     [("handy-04-woche", "Woche"), ("handy-05-tag", "Tag")], "phone"),
    ("wetter", "5 · Шторка «Wetter»",
     "День целиком, «Losgehen 07:05» с температурой и что надеть, часы школьного дня (дождь от 30 % — синим). "
     "Внизу «Stand …» и источник — Open-Meteo требует указать его (лицензия CC BY).",
     [("handy-06-wetter", "Wetter")], "phone"),
    ("admin", "6 · Admin: место школы",
     "Админ ищет город школы — наш сервер спрашивает Open-Meteo и сохраняет координаты. Погоду потом получает только сервер "
     "(кеш ~30 мин) и раздаёт всем — место и IP учеников никуда не уходят. Выключатель «Wetter anzeigen» убирает погоду у всех.",
     [("handy-07-admin-ort", "Admin · Wetter")], "phone"),
    ("zustaende", "7 · Состояния",
     "Загрузка — серые плашки. Офлайн — последний прогноз с «Stand gestern 21:30». Место школы не задано или сервис недоступен — "
     "погоды просто нет (без пояснений), остальное в блоке работает.",
     [("handy-08-zustaende", "Zustände")], "pc"),
    ("widgets", "8 · Виджеты Android",
     "Два новых вида рядом с двенадцатью: «Für dich jetzt» (то же правило, что блок) и «Wetter». Все размеры по правилу fit() из 31d: "
     "не влезает — плотнее или «+ N», без обрезки посередине. Заодно при сборке проверю скриншотами все 12 старых видов во всех размерах.",
     [("handy-09-widget-fuer-dich", "Für dich jetzt"), ("handy-10-widget-wetter", "Wetter")], "wide"),
    ("designs", "9 · Soft / Glas / Klar и «Widget einstellen»",
     "Оформление, тема и акцент — как у всех виджетов. В «Einstellen» у «Für dich jetzt» своих переключателей нет — строка «Einstellungen · Start und Widget» открывает приложение на общей странице настроек.",
     [("handy-11-widget-designs", "Auf dem Startbildschirm")], "pc"),
    ("config", "", "", [("handy-12-widget-einstellen", "Einstellen · Für dich jetzt")], "phone"),
    ("pc", "10 · ПК",
     "Start: блок «Für dich jetzt» 2×2 и маленький «Wetter». Неделя: погода справа в шапке каждого дня.",
     [("pc-01-start", "Start"), ("pc-02-woche", "Woche")], "pc"),
]

def page():
    out = ['<title>ORBook Wetter</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 50 · дизайн</div><h1>Wetter + Für dich jetzt</h1></div>',
           '<div class="seg" id="themes" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Открыл — и сразу видно, что нужно сейчас. Данные примера: среда 17.09., Hannover. Тёмная тема — кнопкой Dunkel сверху '
           '(листы размеров виджетов и состояния — только светлые).</p>',
           '<div id="shots">']
    for sid, h, text, shots, kind in SECTIONS:
        out.append(f'<section id="{sid}">' + (f'<h2>{h}</h2><p>{text}</p>' if h else "") + '<div class="row">')
        out += [shot(nm, cap, kind) for nm, cap in shots]
        out.append('</div></section>')
    out.append('</div>')
    out.append("""<div class="box"><h2>Решения, которые я принял (можно поменять)</h2><ul>
<li><b>Погода через наш сервер</b> <span>Open-Meteo без ключа, один запрос на школу раз в ~30 мин; ученик ничего не отправляет наружу. В Datenschutz — строка про внешний сервис.</span></li>
<li><b>Место — город, не адрес</b> <span>Open-Meteo ищет по названию города; для погоды точности города хватает.</span></li>
<li><b>Что надеть</b> <span>правила: дождь ≥ 50 % в школьные часы → «Regenjacke», при выходе ≤ 12° → «Jacke», ≤ 3° → «Mütze &amp; Schal», UV ≥ 6 → «Sonnencreme»; Sport → «Sportsachen», тест сегодня → «Test: Fach».</span></li>
<li><b>Losgehen</b> <span>по умолчанию 45 мин до первого своего урока; меняется в блоке и в виджете.</span></li>
<li><b>Части</b> <span>50a погода (бэкенд + Woche/Tag/шторка/админ), 50b блок, 50c виджеты и новый APK.</span></li>
</ul></div>""")
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
