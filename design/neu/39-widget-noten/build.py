# Собирает index.html — обзор макетов части 39 со встроенными SVG (для артефакта «ок дизайн?»).
# Оформление страницы — то же, что у обзора 31d (CSS и JS берём оттуда).
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(HERE, "..", "31d-widget-design", "build.py"), encoding="utf-8").read()
CSS = _src.split('CSS = """', 1)[1].split('"""', 1)[0]
JS = _src.split('JS = """', 1)[1].split('"""', 1)[0].replace("orb31d-theme", "orb39-theme")
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
    ("noten", "1 · Noten — средний балл и предметы",
     "Сверху «Schnitt» за полугодие, ниже предметы со средним; предмет с новой оценкой — первым и с «neu». "
     "На широком виджете предметы в две колонки, не влезло — «+ N weitere», как у остальных виджетов. "
     "<b>По умолчанию оценки скрыты</b> («•••»): виджет видит любой, кто смотрит на телефон. Слева — как по умолчанию, справа — с «Noten anzeigen».",
     [("handy-01-noten", "Standard: verborgen"), ("handy-01-noten-sichtbar", "Noten anzeigen: an")], "wide"),
    ("neue", "2 · Neue Noten — последние оценки",
     "Fach · Art · когда · Note, новые сверху. Самая свежая непросмотренная — с «neu». Справа в шапке — сколько оценок за полугодие.",
     [("handy-02-neue", "Standard: verborgen"), ("handy-02-neue-sichtbar", "Noten anzeigen: an")], "wide"),
    ("fehl", "3 · Fehlzeiten",
     "Fehltage, Fehlstunden и unentschuldigt за текущее полугодие (unentschuldigt — красным, как на экране «Fehlzeiten»). "
     "На 4×3 снизу — последние пропуски. Скрыто — числа и что было («Ganzer Tag») заменены на «•••».",
     [("handy-03-fehl", "Standard: verborgen"), ("handy-03-fehl-sichtbar", "Noten anzeigen: an")], "wide"),
    ("zustaende", "4 · Не вошёл в Noten, пусто",
     "Без входа в InfoPoint (или после «Abmelden») виджет пишет «In ORBook bei Noten anmelden»; нажатие открывает «Noten» в приложении. "
     "Новое полугодие без оценок — «Noch keine Noten», без пропусков — «Keine Fehlzeiten». Данные старые — видно по «Stand 16.09.» в шапке.",
     [("handy-04-ohne-anmeldung", "Zustände")], "wide"),
    ("design", "5 · Soft / Glas / Klar, светлая и тёмная",
     "Новые виды берут оформление, тему и акцент из приложения — как все виджеты из 31d.",
     [("handy-05-designs", "Auf dem Startbildschirm")], "pc"),
    ("einstellen", "6 · «Widget einstellen»",
     "В «Inhalt» теперь двенадцать видов (три новых — нижний ряд). У новых видов в «Anzeige» одна строка — «Noten anzeigen», по умолчанию выключена; "
     "включается для каждого виджета отдельно. «Klasse» и «Nur meine Kurse» у них не показываются — оценки свои, не класса.",
     [("handy-06-einstellen", "Einstellen · Noten")], "phone"),
]

def page():
    out = ['<title>ORBook Noten-Widgets</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 39 · виджеты</div><h1>Noten, Neue Noten, Fehlzeiten</h1></div>',
           '<div class="seg" id="themes" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Три новых вида виджета рядом с девятью из 31d. Данные — те, что приложение уже держит на телефоне (оценки из InfoPoint), сервер не участвует. '
           'Листы размеров — в светлой теме; тёмная — на «Soft · Glas · Klar» и «Einstellen» (кнопка Dunkel сверху).</p>',
           '<div id="shots">']
    for sid, h, text, shots, kind in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap, kind) for nm, cap in shots]
        out.append('</div></section>')
    out.append('</div>')
    out.append("""<div class="box"><h2>Что будет в коде после «ок»</h2><ul>
<li><b>Android</b> <span>три вида в WidgetKinds.kt, оценки читаются из NotenStore (уже зашифрованы на телефоне); после новой загрузки оценок виджеты перерисовываются.</span></li>
<li><b>«Widget einstellen»</b> <span>двенадцать плиток, строка «Noten anzeigen» (по умолчанию выкл.), нажатие открывает «Noten».</span></li>
<li><b>Datenschutz</b> <span>строка: виджет показывает оценки на рабочем столе только если включить «Noten anzeigen».</span></li>
<li><b>Сборка</b> <span>новый демо-APK; прод — по «на прод».</span></li>
</ul></div>""")
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
