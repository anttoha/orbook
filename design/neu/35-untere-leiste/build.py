# Собирает index.html — страницу-обзор макетов части 35 со встроенными SVG (для артефакта «ок дизайн?»).
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
n = 0

def inline(name):
    """SVG без пересечения id: в одной странице много макетов, а у оригиналов одинаковые clipPath id."""
    global n
    n += 1
    s = open(os.path.join(HERE, name + ".svg"), encoding="utf-8").read()
    p = f"s{n}-"
    s = re.sub(r'id="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', s)
    s = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}{m.group(1)})', s)
    return s.replace("<svg ", '<svg role="img" ', 1)

def shot(name, caption, kind="phone"):
    return (f'<figure class="shot {kind}"><figcaption>{caption}</figcaption>'
            f'<div class="v v-hell">{inline(name + "-hell")}</div><div class="v v-dunkel">{inline(name + ("-dunkel" if os.path.exists(os.path.join(HERE, name + "-dunkel.svg")) else "-hell"))}</div></figure>')

SECTIONS = [
    ("gruppe", "1 · Вкладка-группа внизу",
     "Внизу теперь 4 вкладки: Start · Woche · Leistung · Mehr. «Leistung» — группа: нажал — над панелью всплывает меню с Tests и Noten "
     "(Noten появятся в части 36; пока их нет, в группе только Tests). Когда ты внутри группы, вкладка показывает, где ты: «Tests» и маленькую стрелку вверх — "
     "нажал ещё раз, меню снова открылось. Нажатие мимо меню закрывает его. Быстрый способ: зажать вкладку группы и провести палец вверх — раздел под пальцем подсвечивается, отпустил — он открылся. Меню по умолчанию компактное; в «Untere Leiste» можно выбрать «Gruppenmenü: Kompakt | Groß».",
     [("handy-01-gruppe-offen", "Меню группы · Kompakt (по умолчанию)"), ("handy-08-wischen", "Зажал «Leistung» и ведёшь вверх"), ("handy-01b-gruppe-gross", "Меню группы · Groß"), ("handy-02-in-der-gruppe", "Внутри группы: «Tests»")], []),
    ("leiste", "2 · Darstellung → «Untere Leiste»",
     "В «Darstellung → Anpassen» новая строка «Untere Leiste». Сверху — как панель выглядит сейчас. «Unten»: что стоит внизу и в каком порядке "
     "(тянуть за точки слева), минус — убрать вниз в «Mehr». Внизу максимум 5 мест вместе с «Mehr»; «Mehr» всегда последний (замок). "
     "«In „Mehr“» — всё остальное: плюс ставит раздел вниз, или его можно перетащить прямо в группу. «Zurücksetzen» возвращает Start · Woche · Leistung · Mehr.",
     [("handy-06-darstellung", "Darstellung · новая строка"), ("handy-03-untere-leiste", "Untere Leiste"), ("handy-04-ziehen", "Тянем «Statistik» в группу"),
      ("handy-07-voll", "Внизу уже 5 мест")], []),
    ("bearbeiten", "3 · Группа: имя, значок, что внутри",
     "Карандаш у группы открывает шторку: имя (например «Leistung» или «Schule»), значок из шести, что внутри (порядок, минус). "
     "«Gruppe auflösen» убирает группу, её разделы уходят в «Mehr» — ничего не удаляется. В группе от 2 до 6 разделов; группа в группе — нельзя.",
     [("handy-05-gruppe-bearbeiten", "Gruppe bearbeiten")], []),
    ("pc", "4 · Компьютер",
     "На ПК те же группы в боковом меню: «Leistung» раскрывается на месте, Tests и Noten — со сдвигом. Места больше, поэтому у ПК свой набор "
     "(по умолчанию ещё Heute и Materialien), а настраивается он на той же странице — переключатель «Computer | Handy». Оба набора входят в Sync (Darstellung).",
     [], [("pc-01-seitenleiste", "Computer · группа в меню"), ("pc-02-einstellen", "Computer · Mehr → Darstellung → Seitenleiste")]),
]

CSS = """
:root{--paper:#FBF7F2;--card:#FFFFFF;--ink:#2A2433;--muted:#6A6275;--faint:#978FA1;--accent:#6C4DF6;--accent-ink:#4A31C9;--tint:#EEE9FF;--sand:#F3EDE5;--rule:#EAE2D8;--stage:#F0EAE2;
--display:'Nunito',ui-rounded,system-ui,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#16131C;--card:#221E2A;--ink:#F4F0F8;--muted:#B5ACC1;--faint:#877E94;--accent:#A58BFF;--accent-ink:#CFC2FF;--tint:#2C2548;--sand:#2A2533;--rule:#352F40;--stage:#0F0D14;color-scheme:dark}}
:root[data-theme="dark"]{--paper:#16131C;--card:#221E2A;--ink:#F4F0F8;--muted:#B5ACC1;--faint:#877E94;--accent:#A58BFF;--accent-ink:#CFC2FF;--tint:#2C2548;--sand:#2A2533;--rule:#352F40;--stage:#0F0D14;color-scheme:dark}
body{background:var(--paper);color:var(--ink);font-family:var(--display);font-size:15px;line-height:1.55}
.wrap{max-width:1240px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 64px}
header{display:flex;flex-wrap:wrap;gap:16px 24px;align-items:end;justify-content:space-between;margin-bottom:8px}
.eyebrow{font-size:12.5px;font-weight:800;color:var(--accent-ink);letter-spacing:.02em}
h1{font-size:clamp(28px,4vw,40px);font-weight:900;letter-spacing:-.015em;margin:2px 0 0;text-wrap:balance}
h2{font-size:22px;font-weight:900;letter-spacing:-.01em;margin:44px 0 6px}
p{max-width:68ch;color:var(--muted);margin:0 0 14px}
.seg{display:inline-flex;background:var(--sand);border-radius:18px;padding:3px}
.seg button{font:800 12.5px var(--display);color:var(--muted);background:none;border:0;border-radius:15px;padding:8px 16px;cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--card);color:var(--ink)}
.seg button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.row{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start}
.shot{margin:0;background:var(--stage);border-radius:22px;padding:14px;min-width:0}
.shot figcaption{font-size:12.5px;font-weight:800;color:var(--faint);margin:0 4px 10px}
.shot svg{display:block;width:100%;height:auto;border-radius:14px}
.phone{flex:0 1 300px}
.pc{flex:1 1 100%}
.pc .v{overflow-x:auto}
.both .v{margin-bottom:12px}
.v-dunkel{display:none}
.show-dunkel .v-hell{display:none}.show-dunkel .v-dunkel{display:block}
.show-beide .v-dunkel{display:block}
.box{background:var(--card);border-radius:22px;padding:18px 22px;margin-top:44px;max-width:780px}
.box h2{margin-top:0}
.box ol{margin:0;padding-left:20px;color:var(--ink)}.box li{margin:6px 0}
.box li span{color:var(--muted)}
code{font-family:ui-monospace,monospace;font-size:13px;background:var(--sand);border-radius:6px;padding:1px 5px}
"""

JS = """
const root=document.getElementById('shots');const btns=[...document.querySelectorAll('.seg button')];
function show(v){root.classList.remove('show-hell','show-dunkel','show-beide');root.classList.add('show-'+v);
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb35-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb35-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Untere Leiste</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 35 · новые экраны ORBook Soft</div><h1>Untere Leiste</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Нижняя панель, вкладки, карточки и списки — те же, что в Start и Darstellung (часть 30). Где тёмной темы нет, показана светлая.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('</div>')
    out.append('''<div class="box"><h2>Решил сам (скажите, если не так)</h2><ul style="margin:0;padding-left:20px">
<li>внизу максимум 5 мест вместе с «Mehr» — шестая вкладка на телефоне уже не читается; лишнее — в группу;</li>
<li>что не стоит внизу, остаётся в «Mehr» — ни один раздел не теряется;</li>
<li>вкладка группы показывает раздел, где ты сейчас (иначе не понять, это Tests или Noten);</li>
<li>группа: 2–6 разделов, без вложенных групп, имя и значок свои;</li>
<li>на ПК свой набор (места больше), та же страница с переключателем Computer | Handy; оба — в Sync;</li>
<li>в «Glas» меню группы — такая же стеклянная карточка над панелью.</li>
</ul><p style="margin-top:12px">Ответ: «ок дизайн» или что поменять.</p></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
