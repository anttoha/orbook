# Собирает index.html — страницу-обзор макетов части 19b со встроенными SVG (для артефакта «ок дизайн?»).
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

SECTIONS = [
    ("start", "Откуда открыть", "В Admin · Einstellungen карточка «Muster-Stundenplan» из части 19 получает две строки: «Muster bearbeiten» (открывает редактор, видно источник) и «Wochen A und B» (буква этой недели и как она считается). На ПК — новый пункт «Muster» в левом меню админки. На телефоне редактор — отдельная страница с «назад».",
     [("handy-01-einstellungen", "Admin · Einstellungen · Muster")], []),
    ("auto", "Источник «Automatisch» — как сейчас", "Сверху выбор «Woher kommt das Muster?»: Automatisch (из настоящих планов последних недель, как сейчас) или Vom Admin. В режиме «Automatisch» сетка только для просмотра и заштрихована, как Muster в приложении; вкладки «Woche A / Woche B» показывают обе недели. Внизу — из каких недель собрано.",
     [("handy-02-automatisch", "Muster · Automatisch (nur ansehen)")],
     [("pc-01-automatisch", "Computer · Muster · Automatisch")]),
    ("admin", "Источник «Vom Admin» — своя сетка", "Админ переключает на «Vom Admin» — сетка копируется из автоматики, дальше её можно править: нажать на урок → шторка (на ПК — панель справа) «Stunde bearbeiten»: предмет/курс, учитель, кабинет, «Parallelkurs» (два курса в одном уроке, как Kunst | Bio), «Leeren». Видно, что было автоматически. Точка на уроке — своя правка. Пустой урок — «+». «Aus dem Plan übernehmen» заново заполняет неделю из автоматики (с подтверждением, своя правка пропадает). Сохранение — одной кнопкой «Speichern · N Änderungen», действует сразу для всего класса. Настоящий план школы всё равно всегда важнее Muster.",
     [("handy-03-vom-admin", "Muster · Vom Admin"), ("handy-04-stunde", "Stunde bearbeiten (Blatt)"), ("handy-06-uebernehmen", "Aus dem Plan übernehmen? (Dialog)"), ("handy-07-gespeichert", "Gespeichert (Toast)")],
     [("pc-03-vom-admin", "Computer · Vom Admin + Stunde bearbeiten"), ("pc-04-uebernehmen", "Computer · Übernehmen bestätigen"), ("pc-05-gespeichert", "Computer · Gespeichert")]),
    ("ab", "Неделя A или B — поправка", "Если школа (или автоматика) считает недели неправильно, админ выбирает: «Laut Plan der Schule» (как сейчас), «A und B tauschen» (эта неделя — B, дальше чередуются) или «Keine Wochen A und B» (у школы нет цикла — одна неделя для всех, вкладки A/B пропадают). Ниже видно, как ORBook посчитает следующие недели. Буква в неделе, дне и выбор Muster везде следуют этой настройке.",
     [("handy-05-wochen-ab", "Woche A oder B? (Blatt)")],
     [("pc-02-wochen-ab", "Computer · Wochen A und B (Dropdown)")]),
    ("zustaende", "Состояния", "Пусто (начало года, автоматике не из чего собрать — заполняете сами), загрузка (серые полоски как Soft 29), не сохранилось (нет связи — правки остаются, «Nochmal»).",
     [("handy-09-leer", "Woche A ist noch leer"), ("handy-10-laden", "Lädt"), ("handy-08-fehler", "Nicht gespeichert")], []),
]
OLD = [(("1 Handy Hell", "2 Handy Dunkel", "04 Woche"), "Soft 04 · Woche (сетка)", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "16 Klausur eintragen (Editor)"), "Soft 16 · выбор предмета", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "45 Admin · Einstellungen"), "Soft 45 · Admin · Einstellungen", "phone"),
       (("3 PC Hell", "4 PC Dunkel", "47 Admin · Einstellungen"), "Soft PC 47 · Admin · Einstellungen", "pc")]

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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb19b-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb19b-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Muster-Editor</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 19b · новые экраны ORBook Soft</div><h1>Muster-Editor</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Админ сам задаёт Muster для недель A и B — или оставляет автоматику, как сейчас. И может поправить, какая сейчас неделя (A/B), если школа считает неправильно. Нарисовано по экранам Soft (04 сетка, 16 выбор предмета, 45/47 Einstellungen, 48 окно, 38 тосты), в светлой и тёмной теме.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('<section id="vergleich"><h2>Для сравнения: старые экраны Soft</h2><p>Откуда взяты шторка, строки меню, список и левое меню.</p><div class="row">')
    out += [orig(pth, cap, kind) for pth, cap, kind in OLD]
    out.append('</div></section></div>')
    out.append('''<div class="box"><h2>Что решить вам</h2><ol>
<li><b>Источник:</b> <span>переключатель «Automatisch / Vom Admin»; при переходе на «Vom Admin» сетка копируется из автоматики. При возврате на «Automatisch» своя сетка не удаляется — просто не показывается. Так ок?</span></li>
<li><b>Неделя A/B:</b> <span>три варианта — по плану школы, «A und B tauschen», «Keine Wochen A und B». Третий нужен?</span></li>
<li><b>Кто правит:</b> <span>только админ (учителя и Editor-Codes — нет).</span></li>
</ol><p style="margin-top:12px">Для учеников ничего нового на экранах: Muster и буква недели просто становятся правильными.</p></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
