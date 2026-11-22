# Собирает index.html — страницу-обзор макетов части 42 со встроенными SVG (для артефакта «ок дизайн?»).
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

SOFT = "/opt/orbook-be/design/ORBook Soft"

def soft(name, caption):
    """Похожий старый экран Soft для сравнения (светлый и тёмный)."""
    global n
    out = []
    for folder, cls in (("1 Handy Hell", "v-hell"), ("2 Handy Dunkel", "v-dunkel")):
        n += 1
        s = open(os.path.join(SOFT, folder, name + ".svg"), encoding="utf-8").read()
        p = f"s{n}-"
        s = re.sub(r'id="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', s)
        s = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}{m.group(1)})', s)
        out.append(f'<div class="v {cls}">{s.replace("<svg ", '<svg role="img" ', 1)}</div>')
    return f'<figure class="shot phone"><figcaption>{caption}</figcaption>{"".join(out)}</figure>'


def old(name, caption):
    """Экран части 36 для сравнения."""
    global n
    out = []
    for th, cls in (("hell", "v-hell"), ("dunkel", "v-dunkel")):
        n += 1
        s = open(os.path.join(HERE, "..", "36-noten", f"{name}-{th}.svg"), encoding="utf-8").read()
        p = f"s{n}-"
        s = re.sub(r'id="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', s)
        s = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}{m.group(1)})', s)
        out.append(f'<div class="v {cls}">{s.replace("<svg ", '<svg role="img" ', 1)}</div>')
    return f'<figure class="shot phone"><figcaption>{caption}</figcaption>{"".join(out)}</figure>'

SECTIONS = [
    ("noten", "1 · «Noten» — цели видно сразу",
     "У предмета с целью слева от среднего — значок «Ziel 2,0» цветом статуса: зелёный — erreichbar, бежевый — knapp, красный — schwer. "
     "На плитке «Schnitt» — маленький график и «Ziel 2,0»; плитка теперь нажимается (шеврон, как у «Fehlzeiten») и открывает экран «Schnitt».",
     [("handy-01-noten", "Noten")], []),
    ("fach", "2 · Предмет: график и цель",
     "Карточка «Schnitt» цвета предмета выросла: под числом — график, как менялся Schnitt за полугодие (точка — день, когда пришла оценка; 1 сверху), пунктир — цель. "
     "Вместо кнопки «Notenrechner» — карточка цели: «Ziel 2,0 · Nächste Note: 1,6 oder besser» и статус. Нажатие открывает шторку «Mein Ziel». "
     "Цели нет — кнопка «Ziel setzen»; оценка одна — вместо графика «Verlauf ab 2 Noten».",
     [("handy-02-fach", "Fach mit Ziel"), ("handy-05-fach-ohne-ziel", "Eine Note, kein Ziel")], []),
    ("ziel", "3 · Шторка «Mein Ziel» (бывший Notenrechner)",
     "Тот же расчёт, что в части 36b, плюс статус в углу результата. «Speichern» запоминает цель (на устройстве + Sync), «Ziel entfernen» — только если цель уже есть.",
     [("handy-03-ziel", "Mein Ziel")], []),
    ("schnitt", "4 · Экран «Schnitt»",
     "Открывается с плитки «Schnitt». Общий Schnitt по дням (среднее предметов, как на плитке) с пунктиром общей цели; «Mein Ziel» — та же шторка, только с одной строкой «Ziel». "
     "Ниже — все предметы с целью и статусом; нажатие открывает предмет.",
     [("handy-04-schnitt", "Schnitt")], []),
    ("pc", "5 · Компьютер",
     "Справа у выбранного предмета — карточка с графиком (все даты подписаны) и карточка цели; «Mein Ziel» открывается окном. Плитка «Schnitt» открывает «Schnitt» в правой колонке.",
     [], [("pc-01-noten", "Computer · Noten")]),
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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb42-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb42-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Notenziel</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 42 · новые экраны ORBook Soft</div><h1>Notenziel + Verlauf</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Всё собрано из экранов «Noten» части 36: карточка Schnitt цвета предмета, строки оценок, шторка Notenrechner, бейджи цветов оценок. Где тёмной темы нет, показана светлая.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('</div>')
    out.append('<section id="vergleich"><h2>Для сравнения · как было (часть 36)</h2><p>Предмет и Notenrechner до этой части.</p><div class="row">' + old("handy-02-fach", "36 · Fach") + old("handy-03-notenrechner", "36 · Notenrechner") + '</div></section>')
    out.append('''<div class="box"><h2>Что я решил сам (можно поменять)</h2><ul style="margin:0;padding-left:20px">
<li>цели хранятся только на устройстве и едут через Sync (как Noten-кеш) — сервер их не видит; Android-App берёт те же цели;</li>
<li>статус: <b>erreichbar</b> — нужная оценка не лучше твоего Schnitt; <b>knapp</b> — лучше, но не больше чем на 0,7; <b>schwer</b> — ещё лучше или одной оценкой не выйти;</li>
<li>цель своя на каждое полугодие; в «Zeugnis» целей и графиков нет;</li>
<li>общая цель — для общего Schnitt (среднее предметов, как на плитке).</li>
</ul></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
