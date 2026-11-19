# Собирает index.html — обзор макетов части 31d со встроенными SVG (для артефакта «ок дизайн?»).
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
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
    """Есть тёмный вариант — переключается кнопкой сверху; нет — всегда светлый."""
    if not os.path.exists(os.path.join(HERE, name + "-dunkel.svg")):
        return f'<figure class="shot {kind}"><figcaption>{caption}</figcaption><div>{inline(name + "-hell")}</div></figure>'
    return (f'<figure class="shot {kind}"><figcaption>{caption}</figcaption>'
            f'<div class="v v-hell">{inline(name + "-hell")}</div><div class="v v-dunkel">{inline(name + "-dunkel")}</div></figure>')

SECTIONS = [
    ("regel", "1 · Правило: «что нужно», а не «что влезло»",
     "Одно правило для всех видов и любого размера. Сначала — идущий или ближайший урок, потом отмены и замены, потом остальное, последним — то, что уже прошло. "
     "Не влезает — строки становятся плотнее (две строки → одна → мельче). Всё равно не влезает — внизу «+ 3 weitere», ничего не обрезается молча. "
     "В узком виджете длинное имя превращается в Kürzel («Ge»), а «Vertretung»/«fällt aus» уходит второй строкой, а не налезает. "
     "Урок всегда с кабинетом; учитель — когда есть место.",
     [("handy-02-heute", "Heute · 2×2, 2×4, 4×2, 4×3, 4×5"), ("handy-01-jetzt", "Jetzt · 2×1 … 4×4 (снизу «Danach»)")], "wide"),
    ("arten", "2 · Остальные виды во всех размерах",
     "Размеры — как на рабочем столе Android в 4 колонки: от 2×1 до 4×5 (растянуть можно и иначе — правило то же). "
     "«Woche» на маленьком размере — только Kürzel, на большом добавляются кабинет и учитель. Countdown на 4×3 показывает, что ещё до каникул.",
     [("handy-03-woche", "Woche"), ("handy-04-tests", "Tests"), ("handy-05-aufgaben", "Aufgaben"), ("handy-06-aenderungen", "Änderungen"),
      ("handy-07-termine", "Termine"), ("handy-08-notizen", "Notizen"), ("handy-09-ferien", "Countdown")], "wide"),
    ("design", "3 · Оформление как в приложении",
     "Виджет берёт Design (Soft / Glas / Klar), светлую/тёмную тему и акцент из приложения — поменял в приложении, виджеты на рабочем столе перерисовываются сами. "
     "Glas: настоящего размытия в виджетах Android нет (его рисует лаунчер), поэтому стекло — полупрозрачная карточка со светлой кромкой и бликом; обои просвечивают. "
     "Ниже — шесть акцентов и прозрачность фона (100 % … «Aus», только текст на обоях).",
     [("handy-10-designs", "Soft · Glas · Klar на рабочем столе")], "pc"),
    ("akzent", "", "", [("handy-11-akzent", "Akzent и Hintergrund")], "wide"),
    ("einstellen", "4 · «Widget einstellen» — больше настроек",
     "Сверху живое превью. Inhalt — плитки девяти видов. Почти всё по умолчанию «Wie App»: виджет повторяет «Stundenplan» и «Darstellung» приложения, "
     "пока ты не выберешь для него своё. Новое: «Nur Änderungen», «Abends schon morgen», Schrift S/M/L, прозрачность фона ползунком, Akzent, как часто обновлять и что открывать по нажатию. "
     "Справа — блок «Anzeige» у других видов: у каждого свои 1–2 настройки.",
     [("handy-12-einstellen", "Einstellen · Heute"), ("handy-13-einstellen-inhalt", "Anzeige у других видов")], "phone"),
]

CSS = """
/* Раскладка: одна колонка разделов; в каждом — ряд телефонов, под ним экраны ПК во всю ширину. Цвета и шрифт — токены ORBook Soft. */
:root{--paper:#FBF7F2;--card:#FFFFFF;--ink:#2A2433;--muted:#6A6275;--faint:#978FA1;--accent:#6C4DF6;--on-accent:#FFFFFF;--accent-ink:#4A31C9;--tint:#EEE9FF;--sand:#F3EDE5;--rule:#EAE2D8;--stage:#F0EAE2;
--g1:#C9B8FF;--g2:#FFC2D4;--g3:#A9D4FF;--glass:rgba(255,255,255,.42);--glass-flat:rgba(255,255,255,.86);--glass-edge:rgba(255,255,255,.85);--glass-bg:#F3EEFB;--ma:#4C82EC;--danger:#D6455D;
--display:'Nunito',ui-rounded,system-ui,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#16131C;--card:#221E2A;--ink:#F4F0F8;--muted:#B5ACC1;--faint:#877E94;--accent:#A58BFF;--on-accent:#1A1333;--accent-ink:#CFC2FF;--tint:#2C2548;--sand:#2A2533;--rule:#352F40;--stage:#0F0D14;
--g1:#5B3FE0;--g2:#B03C82;--g3:#1E7FA8;--glass:rgba(255,255,255,.1);--glass-flat:rgba(48,42,66,.94);--glass-edge:rgba(255,255,255,.2);--glass-bg:#120F1C;--ma:#6191EE;--danger:#FF8AA0;color-scheme:dark}}
:root[data-theme="dark"]{--paper:#16131C;--card:#221E2A;--ink:#F4F0F8;--muted:#B5ACC1;--faint:#877E94;--accent:#A58BFF;--on-accent:#1A1333;--accent-ink:#CFC2FF;--tint:#2C2548;--sand:#2A2533;--rule:#352F40;--stage:#0F0D14;
--g1:#5B3FE0;--g2:#B03C82;--g3:#1E7FA8;--glass:rgba(255,255,255,.1);--glass-flat:rgba(48,42,66,.94);--glass-edge:rgba(255,255,255,.2);--glass-bg:#120F1C;--ma:#6191EE;--danger:#FF8AA0;color-scheme:dark}
body{background:var(--paper);color:var(--ink);font-family:var(--display);font-size:15px;line-height:1.55}
.wrap{max-width:1240px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 64px}
header{display:flex;flex-wrap:wrap;gap:16px 24px;align-items:end;justify-content:space-between;margin-bottom:8px}
.eyebrow{font-size:12.5px;font-weight:800;color:var(--accent-ink);letter-spacing:.02em}
h1{font-size:clamp(28px,4vw,40px);font-weight:900;letter-spacing:-.015em;margin:2px 0 0;text-wrap:balance}
h2{font-size:22px;font-weight:900;letter-spacing:-.01em;margin:44px 0 6px;text-wrap:balance}
h3{font-size:14px;font-weight:800;margin:0 0 10px}
p{max-width:68ch;color:var(--muted);margin:0 0 14px}
.seg{display:inline-flex;background:var(--sand);border-radius:18px;padding:3px}
.seg button{font:800 12.5px var(--display);color:var(--muted);background:none;border:0;border-radius:15px;padding:8px 16px;cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--card);color:var(--ink)}
.seg button:focus-visible,.play:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.row{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start}
.shot{margin:0;background:var(--stage);border-radius:22px;padding:14px;min-width:0}
.shot figcaption{font-size:12.5px;font-weight:800;color:var(--faint);margin:0 4px 10px}
.shot svg{display:block;width:100%;height:auto;border-radius:14px}
.phone{flex:0 1 300px}
.wide{flex:0 1 420px}
.pc{flex:1 1 100%}
.pc .v{overflow-x:auto}
.v-dunkel{display:none}
.old figcaption{color:var(--accent-ink)}
.show-dunkel .v-hell{display:none}.show-dunkel .v-dunkel{display:block}
.show-beide .v-dunkel{display:block;margin-top:12px}
.box{background:var(--card);border-radius:22px;padding:18px 22px;margin-top:44px;max-width:780px}
.box h2{margin-top:0}
.box ol,.box ul{margin:0;padding-left:20px;color:var(--ink)}.box li{margin:6px 0}
.box li span{color:var(--muted)}
"""

JS = """
const root=document.getElementById('shots');const btns=[...document.querySelectorAll('#themes button')];
function show(v){root.classList.remove('show-hell','show-dunkel','show-beide');root.classList.add('show-'+v);
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb31d-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb31d-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Widgets</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 31d · виджеты</div><h1>Дизайн, содержание, настройки</h1></div>',
           '<div class="seg" id="themes" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>По твоим замечаниям 19.11.: все 9 видов, все размеры, оформление и акцент как в приложении, больше настроек, и ничего не обрезается молча. '
           'Листы размеров — в светлой теме; тёмная — на «Soft · Glas · Klar» и «Einstellen» (кнопка Dunkel сверху).</p>',
           '<div id="shots">']
    for sid, h, text, shots, kind in SECTIONS:
        out.append(f'<section id="{sid}">' + (f'<h2>{h}</h2><p>{text}</p>' if h else '') + f'<div class="row"{" style=\"margin-top:20px\"" if not h else ""}>')
        out += [shot(nm, cap, kind) for nm, cap in shots]
        out.append('</div></section>')
    out.append('</div>')
    out.append("""<div class="box"><h2>Что будет в коде после «ок»</h2><ul>
<li><b>Правило содержания</b> <span>одно на все виды (Kotlin, рядом тесты): порядок важности → плотность → «+ N weitere».</span></li>
<li><b>Снимок для виджета</b> <span>добавить Design, акцент, фон Glas, настройки «Stundenplan», Wochenende; тест: каждая настройка, влияющая на Start, есть в снимке.</span></li>
<li><b>«Widget einstellen»</b> <span>страница сайта с новыми полями; «Wie App» по умолчанию.</span></li>
<li><b>Сборка</b> <span>демо-APK по твоему слову «собирай демо», прод — по «на прод».</span></li>
</ul></div>""")
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
