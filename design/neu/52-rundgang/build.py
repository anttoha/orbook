# Собирает index.html — обзор макетов части 52 (артефакт «ок дизайн?»).
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(HERE, "..", "31d-widget-design", "build.py"), encoding="utf-8").read()
CSS = _src.split('CSS = """', 1)[1].split('"""', 1)[0]
JS = _src.split('JS = """', 1)[1].split('"""', 1)[0].replace("orb31d-theme", "orb52-theme")
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
    ("start", "0 · Первый вход",
     "Сразу после первого входа (и после выбора класса) поверх Start — приветствие. «Los geht's» запускает тур, «Später» закрывает. "
     "Показывается один раз; повтор — в Mehr.",
     [("handy-00-willkommen", "Willkommen")], "phone"),
    ("tour1", "1–2 · Start: прожектор на настоящем блоке",
     "Экран затемнён, настоящий элемент вырезан «прожектором» с лиловой рамкой; прожектор плавно переезжает от шага к шагу. "
     "Пузырь: заголовок, одна строка, точки и «1/7», «Überspringen», «Weiter». "
     "<b>Шаг 2 — действие</b>: кнопки «Weiter» нет, вокруг вкладки пульсирует кольцо — человек сам открывает «Woche», и тур идёт дальше уже на настоящей неделе.",
     [("handy-01-fuer-dich", "1 · Für dich jetzt"), ("handy-02-woche-tippen", "2 · Woche öffnen")], "phone"),
    ("tour2", "3–5 · Неделя и день",
     "3 — ряд с выпавшей стрелкой «fällt aus»; 4 — действие: нажать сегодняшний день → открывается «Tag»; 5 — урок в дне (что внутри у урока). "
     "Нажатие на затемнение ничего не делает — только «Überspringen» выходит из тура.",
     [("handy-03-ausfall", "3 · Ausfall"), ("handy-04-heute-tippen", "4 · Heute öffnen"), ("handy-05-stunde", "5 · Eine Stunde")], "phone"),
    ("tour3", "6–7 · Нижняя панель и конец",
     "6 — «Tests», 7 — «Mehr» с кнопкой «Fertig». После «Fertig» или «Später» — один тост «Rundgang findest du in Mehr».",
     [("handy-06-tests", "6 · Tests"), ("handy-07-mehr-fertig", "7 · Mehr"), ("handy-08-ende-toast", "Toast")], "phone"),
    ("mehr", "8 · Повтор из Mehr",
     "В Mehr — строка «Rundgang» (рядом с «Was ist neu» и «Datenschutz»): запускает тур заново с шага 1.",
     [("handy-09-mehr-rundgang", "Mehr · Rundgang")], "phone"),
    ("pc", "9 · ПК",
     "Те же 7 шагов; пузырь встаёт сбоку от элемента. Вкладки нижней панели на ПК = пункты боковой панели (Woche, Tests, Mehr).",
     [("pc-01-fuer-dich", "1 · Für dich jetzt"), ("pc-02-woche-klicken", "2 · Woche öffnen")], "pc"),
]

def page():
    out = ['<title>ORBook Rundgang</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 52 · дизайн</div><h1>Rundgang für neue Nutzer</h1></div>',
           '<div class="seg" id="themes" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Интерактивный тур по настоящим экранам. Данные примера: среда 17.09., класс 9b. Тёмная тема — кнопкой Dunkel сверху.</p>',
           '<div id="shots">']
    for sid, h, text, shots, kind in SECTIONS:
        out.append(f'<section id="{sid}">' + (f'<h2>{h}</h2><p>{text}</p>' if h else "") + '<div class="row">')
        out += [shot(nm, cap, kind) for nm, cap in shots]
        out.append('</div></section>')
    out.append('</div>')
    out.append("""<div class="box"><h2>Решения, которые я принял (можно поменять)</h2><ul>
<li><b>7 шагов, ~1 минута</b> <span>Für dich jetzt → Woche → Ausfall → Heute → Stunde → Tests → Mehr. Остальное (Noten, Karteikarten, Lerntimer, виджеты) человек найдёт сам.</span></li>
<li><b>Два шага — действие</b> <span>человек сам открывает «Woche» и «Heute»: так запоминается лучше, чем «Weiter».</span></li>
<li><b>Без сервера</b> <span>«тур пройден» хранится на устройстве; бэкенд не нужен, в Datenschutz ничего не меняется.</span></li>
<li><b>Только своя логика, без библиотек</b> <span>затемнение с вырезом и пузырь — маленький свой компонент на токенах Soft; учитывает «меньше движения» в системе.</span></li>
<li><b>Если элемента нет</b> <span>(блок «Für dich jetzt» убран со Start, нет плана) — шаг пропускается сам.</span></li>
</ul></div>""")
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
