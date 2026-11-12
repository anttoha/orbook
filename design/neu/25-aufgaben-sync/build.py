# Собирает index.html — страницу-обзор макетов части 25 со встроенными SVG (для артефакта «ок дизайн?»).
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
            f'<div class="v v-hell">{inline(name + "-hell")}</div><div class="v v-dunkel">{inline(name + "-dunkel")}</div></figure>')

SOFT = "/opt/orbook-be/design/ORBook Soft"

def orig(path, caption, kind="phone"):
    """Старый экран Soft (светлая/тёмная) — для сравнения рядом с новыми."""
    global n
    out = []
    for folder, cls in ((path[0], "v-hell"), (path[1], "v-dunkel")):
        n += 1
        s = open(os.path.join(SOFT, folder, path[2] + ".svg"), encoding="utf-8").read()
        p = f"s{n}-"
        s = re.sub(r'id="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', s)
        s = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}{m.group(1)})', s)
        out.append(f'<div class="v {cls}">{s.replace("<svg ", '<svg role="img" ', 1)}</div>')
    return f'<figure class="shot {kind} old"><figcaption>{caption}</figcaption>{"".join(out)}</figure>'


def paper(name, caption):
    """Лист A4 — только светлый (печать всегда на белом)."""
    return f'<figure class="shot a4"><figcaption>{caption}</figcaption>{inline(name)}</figure>'

SECTIONS = [
    ("aufgaben", "1 · «Aufgaben»: что сделать и что уже сделал",
     "Во вкладке Tests вместо «Hausaufgaben» теперь «Aufgaben»: домашки класса и твои собственные дела в одном списке. Справа кружок — нажал, и задача уезжает вниз в «Erledigt» (с «Rückgängig»). «+» — своя задача: текст, когда (Morgen / дата / без даты), предмет по желанию. Галочки и свои задачи видишь только ты — класс их не видит. Нажатие на саму строку открывает детали, как раньше.",
     [("handy-01-aufgaben", "Aufgaben"), ("handy-02-abgehakt", "Abgehakt + Rückgängig"), ("handy-03-eigene-aufgabe", "Eigene Aufgabe"), ("handy-04-aufgaben-leer", "Alles erledigt")],
     [("pc-01-aufgaben", "Computer · Aufgaben")]),
    ("tag", "2 · В дне — тоже с галочками",
     "Блок «Hausaufgaben · fällig …» под уроками стал «Aufgaben · fällig an diesem Tag»: те же кружки, и свои задачи на этот день тоже там.",
     [("handy-05-tag", "Tag · Aufgaben")], []),
    ("sync", "3 · Sync-Code синхронизирует всё",
     "«Notizen synchronisieren» → «Synchronisieren». Под одним кодом — заметки, Aufgaben (галочки и свои), Meine Kurse, Darstellung и Fachfarben; каждую часть можно выключить. Рядом с кодом — кнопка QR: второй телефон сканирует его камерой, ORBook открывается и спрашивает «Gerät verbinden?». Код в QR стоит после «#» — на сервер он не уходит, как и раньше. На ПК QR виден сразу: главный путь «ПК → телефон».",
     [("handy-06-mehr", "Mehr (Synchronisieren, Kurz erklärt)"), ("handy-07-sync", "Synchronisieren"), ("handy-08-sync-qr", "Sync-Code als QR"), ("handy-09-verbinden", "Neues Gerät: verbinden?")],
     [("pc-02-sync", "Computer · Synchronisieren mit QR")]),
    ("drucken", "4 · Лист A4 для класса",
     "В «Klasse einladen» (и у админа в «Einladen») — новая строка «Blatt für die Klasse drucken». Два вида: «Aushang» — один большой QR с тремя шагами для доски, и «Kärtchen» — 8 карточек на листе, разрезать и раздать. Открывается обычное окно печати браузера (можно и «Als PDF speichern»). На листе только ссылка-приглашение, никаких имён; выключил ссылку — лист перестаёт работать.",
     [("handy-10-einladen", "Klasse einladen + Drucken"), ("handy-11-drucken", "Blatt drucken")], [("pc-03-drucken", "Computer · Blatt drucken")]),
    ("codes", "5 · QR у кодов учителей",
     "Когда админ создаёт Lehrer-Code или Editor-Code, код показывается один раз — теперь вместе с QR и кнопкой «Drucken» (личный лист для учителя: QR, код, 3 шага, что он может). Отсканировал — код уже вписан, остаётся «Anmelden».",
     [("handy-12-lehrer-code-qr", "Admin · Code erstellt")], []),
    ("tipps", "6 · «Kurz erklärt» при первом входе",
     "После выбора курсов — три коротких карточки: тап по дню, долгое нажатие на урок, Aufgaben + Sync. «Überspringen» в любой момент, показываются один раз. Потом их можно открыть снова: Mehr → «Kurz erklärt».",
     [("handy-13-tipp-1", "Tipp 1"), ("handy-14-tipp-2", "Tipp 2"), ("handy-15-tipp-3", "Tipp 3")], [("pc-04-tipp", "Computer · Tipp (Rechtsklick)")]),
]
PAPERS = [("a4-01-aushang", "A4 · Aushang"), ("a4-02-kaertchen", "A4 · Kärtchen"), ("a4-03-lehrer-code", "A4 · Lehrer-Code")]
OLD = [(("1 Handy Hell", "2 Handy Dunkel", "21 Notizen synchronisieren"), "Soft 21 · Notizen synchronisieren (было)", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "13 Klausuren"), "Soft 13 · Klausuren (было)", "phone"),
       (("3 PC Hell", "4 PC Dunkel", "27 Einstellungen · Notizen-Sync"), "Soft PC 27 · Notizen-Sync (было)", "pc")]

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
.a4{flex:0 1 380px}.a4 svg{box-shadow:0 2px 8px rgba(0,0,0,.08)}
.pc{flex:1 1 100%}
.pc .v{overflow-x:auto}
.both .v{margin-bottom:12px}
.v-dunkel{display:none}
.old figcaption{color:var(--accent-ink)}
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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb25-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb25-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Aufgaben und Sync</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 25 · Aufgaben, Sync, QR</div><h1>Aufgaben und Sync</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Список «что сделать / сделал», Sync всего одним кодом с QR, печатный лист для класса и учителя, три подсказки при первом входе. Всё — токены Soft; в конце — старые экраны для сравнения.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        if sid == "drucken": out += [paper(nm, cap) for nm, cap in PAPERS[:2]]
        if sid == "codes": out += [paper(nm, cap) for nm, cap in PAPERS[2:]]
        out.append('</div></section>')
    out.append('<section id="vergleich"><h2>Для сравнения: старые экраны Soft</h2><p>Какие экраны менялись.</p><div class="row">')
    out += [orig(pth, cap, kind) for pth, cap, kind in OLD]
    out.append('</div></section></div>')
    out.append('''<div class="box"><h2>Что нужно решить</h2><ol>
<li><b>Где «Aufgaben»:</b> <span>вместо «Hausaufgaben» во вкладке Tests (Tests · Aufgaben · Termine). Другой вариант — отдельная 4-я вкладка внизу.</span></li>
<li><b>Что синхронизировать:</b> <span>Notizen, Aufgaben, Meine Kurse, Darstellung+Fachfarben — всё включено, каждое можно выключить. При подключении нового устройства курсы и оформление берутся с кода, заметки и галочки сливаются.</span></li>
<li><b>Лист A4:</b> <span>печатать может любой, у кого есть «Klasse einladen» (ученик, учитель, админ) — на листе только ссылка-приглашение. Или только админ и учителя?</span></li>
<li><b>Lehrer-/Editor-Code в QR:</b> <span>код только вписывается в поле, «Anmelden» нажимает человек сам.</span></li>
</ol></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
