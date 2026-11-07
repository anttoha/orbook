# Собирает index.html — страницу-обзор макетов части 19 со встроенными SVG (для артефакта «ок дизайн?»).
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
    ("woche", "Неделя по Muster", "Листаете неделю вперёд, а плана школы ещё нет — видно обычное расписание этой недели (по A/B-неделе), без отмен и замен. Muster-уроки заштрихованы, у заголовка метка MUSTER, сверху объяснение. В текущей неделе заштрихованы только дни, на которые план ещё не вышел (здесь — пятница, заголовок дня тоже заштрихован). Test/Klausur и заметки в Muster-уроках видны как обычно.",
     [("handy-01-muster-woche", "Woche in 3 Wochen · alles Muster"), ("handy-02-diese-woche", "Diese Woche · Freitag noch Muster")],
     [("pc-01-muster-woche", "Computer · Muster-Woche + Tag rechts")]),
    ("tag", "День и урок из Muster", "День из Muster — как обычный список уроков, только заштрихован и с плашкой «Muster». Нажатие на урок открывает окно урока: метка MUSTER, «aus dem Muster – kann sich ändern», заметка и кнопка «Test oder Klausur eintragen» (только у тех, у кого есть право: Editor-Code, учитель). Форма Klausur открывается уже с датой и номером урока.",
     [("handy-03-muster-tag", "Tag · Muster"), ("handy-04-stunde", "Stunde · Muster (Blatt)"), ("handy-05-test-eintragen", "Test eintragen aus Muster-Stunde")],
     [("pc-02-stunde", "Computer · Stunde · Muster (Panel)")]),
    ("abgleich", "Пришёл настоящий план — сверка", "Когда школа опубликовала план на этот день, Muster исчезает. Если заметка или Test висели на уроке, который теперь отменён или перенесён, — в дне плашка «Plan ist da · 2 Einträge prüfen», а у урока красная строка «prüfen». Окно «Einträge prüfen»: что было в Muster и что говорит настоящий план. Заметку можно одним нажатием перенести на новый урок (или оставить). Test сам не переносится: «Test ändern» есть у учителя и Editor-Codes. Ничего не меняется без человека.",
     [("handy-06-plan-da", "Plan ist da · Einträge prüfen"), ("handy-07-pruefen", "Einträge prüfen (Blatt)"), ("handy-08-verschoben", "Notiz verschoben (Toast)")],
     [("pc-03-pruefen", "Computer · Einträge prüfen (Fenster)")]),
    ("kalender", "Выбор недели и «Muster ещё нет»", "В «Woche wählen» недели без настоящего плана заштрихованы, в легенде — «Muster». В начале учебного года, пока у школы нет двух недель плана, Muster не из чего собрать — тогда пустой экран с объяснением. Загрузка — те же серые полоски, что и сейчас (Soft 29).",
     [("handy-09-woche-waehlen", "Woche wählen · Muster-Wochen"), ("handy-10-kein-muster", "Noch kein Muster")],
     [("pc-04-woche-waehlen", "Computer · Woche wählen")]),
    ("admin", "Неделя A/B и настройка админа", "Буква недели теперь видна везде: в шапке недели и дня («KW 38 · 15.–19. Sept · WOCHE A»), в календаре рядом с номером KW. Берётся из плана школы (неделя 1 = A, 2 = B). В админке (Einstellungen) новая карточка: «Muster zeigen bis» — по умолчанию «Schuljahresende», можно 2/4/8 недель или выключить; там же видно, какая сейчас неделя и из каких недель собран Muster.",
     [("handy-11-admin", "Admin · Einstellungen · Muster")], []),
]
OLD = [(("1 Handy Hell", "2 Handy Dunkel", "04 Woche"), "Soft 04 · Woche", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "05 Tag · Liste"), "Soft 05 · Tag · Liste", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "07 Stunde · Details (Blatt)"), "Soft 07 · Stunde · Details", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "33 Neuer Plan da (Hinweis)"), "Soft 33 · Neuer Plan da", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "35 Tag · Plan fehlt noch"), "Soft 35 · Plan fehlt noch (so ist es heute)", "phone"),
       (("3 PC Hell", "4 PC Dunkel", "05 Woche · Stunden + gewählter Tag"), "Soft PC 05 · Woche", "pc")]

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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb19-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb19-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Muster</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 19 · новые экраны ORBook Soft</div><h1>Muster-Stundenplan</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Будущие недели по обычному расписанию: можно заранее смотреть уроки, писать заметки и вносить Tests/Klausuren на конкретный урок. Всё, что из Muster, заштриховано и подписано MUSTER. Когда школа публикует настоящий план — Muster пропадает, а записи, которые больше не подходят, ORBook предлагает проверить. Нарисовано поверх экранов Soft (04, 05, 07, 11, 16, 33, PC 05, PC 08, PC 12), в светлой и тёмной теме.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('<section id="vergleich"><h2>Для сравнения: старые экраны Soft</h2><p>Откуда взяты шторка, строки меню, список и левое меню.</p><div class="row">')
    out += [orig(pth, cap, kind) for pth, cap, kind in OLD]
    out.append('</div></section></div>')
    out.append('''<div class="box"><h2>Ваши ответы (учтены)</h2><ol>
<li><b>Как далеко:</b> <span>по умолчанию до конца учебного года, админ меняет в Einstellungen (2/4/8 недель, выкл.).</span></li>
<li><b>Кто вносит:</b> <span>те же, что сейчас (Editor-Codes, учителя).</span></li>
<li><b>Если план изменился:</b> <span>Test сам не переносится, заметки ученик переносит сам.</span></li>
<li><b>Откуда Muster:</b> <span>только автоматически, отдельно для недель A и B; буква недели видна везде.</span></li>
</ol><p style="margin-top:12px">Осталось: «ок дизайн» для буквы недели и карточки в админке — и «ок» плана бэкенда.</p></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
