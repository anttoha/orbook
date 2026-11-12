# Собирает index.html — страницу-обзор макетов части 26 со встроенными SVG (для артефакта «ок дизайн?»).
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SOFT = "/opt/orbook-be/design/ORBook Soft"
n = 0

def unique(s):
    """SVG без пересечения id: в одной странице много макетов, а у оригиналов одинаковые clipPath id."""
    global n
    n += 1
    p = f"s{n}-"
    s = re.sub(r'id="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', s)
    s = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}{m.group(1)})', s)
    return s.replace("<svg ", '<svg role="img" ', 1)

def inline(name):
    return unique(open(os.path.join(HERE, name + ".svg"), encoding="utf-8").read())

def shot(name, caption, kind="phone"):
    return (f'<figure class="shot {kind}"><figcaption>{caption}</figcaption>'
            f'<div class="v v-hell">{inline(name + "-hell")}</div><div class="v v-dunkel">{inline(name + "-dunkel")}</div></figure>')

def orig(path, caption, kind="phone"):
    """Старый экран Soft (светлая/тёмная) — для сравнения рядом с новыми."""
    out = []
    for folder, cls in ((path[0], "v-hell"), (path[1], "v-dunkel")):
        s = open(os.path.join(SOFT, folder, path[2] + ".svg"), encoding="utf-8").read()
        out.append(f'<div class="v {cls}">{unique(s)}</div>')
    return f'<figure class="shot {kind} old"><figcaption>{caption}</figcaption>{"".join(out)}</figure>'

SECTIONS = [
    ("verlauf", "1 · «Verlauf des Tages»: какие версии плана были",
     "В окне «Info zum Tag» появилась строка «Verlauf des Tages». Нажал — видишь ленту: когда план этого дня менялся и что именно "
     "(новые сверху). У старой версии есть «Ansehen»: день показывается таким, каким он был тогда, а то, что сейчас иначе, помечено "
     "«Jetzt anders». Кнопками «Ältere / Neuere» листаешь версии. Версии хранятся 30 дней. В ленте видны изменения твоих курсов; "
     "если включено «Alle Kurse» — всех.",
     [("handy-01-info", "Info zum Tag (новая карточка)"), ("handy-02-verlauf", "Verlauf des Tages"), ("handy-03-fassung", "Старая версия"),
      ("handy-04-verlauf-eine", "Ничего не менялось")],
     [("pc-01-verlauf", "Computer · лента сразу в панели «Info zum Tag»"), ("pc-02-fassung", "Computer · старая версия")]),
    ("zustaende", "2 · Загрузка и ошибка",
     "Пока лента грузится — серые полоски. Без интернета ленты нет (она не хранится на телефоне), но сам план остаётся.",
     [("handy-05-verlauf-laden", "Lädt"), ("handy-06-verlauf-fehler", "Kommt nicht an")], []),
    ("live", "3 · «Live»: новый план приходит сам",
     "Под заголовком недели вместо «aktualisiert vor 3 Min.» — зелёная точка «Live». Пока приложение открыто, сервер сам сообщает ему "
     "о новом плане: баннер «Neuer Plan · gerade eben» появляется за несколько секунд, как сообщение в мессенджере, ничего нажимать не надо. "
     "«Neu laden» остаётся на месте.",
     [("handy-07-woche-live", "Woche · Live"), ("handy-08-neuer-plan", "Новый план пришёл сам")], []),
    ("status", "4 · «Plan-Status»: что проверено по каждому дню",
     "Нажатие на строку «Live» открывает «Plan-Status». По каждому дню недели видно: план есть (и когда менялся), плана ещё нет "
     "(и когда это проверяли) или день ещё не проверяли вовсе. Кнопка «Diese Woche jetzt prüfen» проверяет именно ту неделю, которая "
     "открыта, — так закрывается старый баг 20c. Если связи «Live» нет, приложение само спрашивает раз в минуту. "
     "В дне без плана видно, что его только что проверили и плана правда ещё нет.",
     [("handy-09-plan-status", "Plan-Status"), ("handy-10-status-fern", "Неделя, которую ещё не проверяли"),
      ("handy-11-nicht-live", "Связи «Live» нет"), ("handy-12-plan-fehlt", "Tag · плана ещё нет")],
     [("pc-03-plan-status", "Computer · окошко над строкой «Live» в левом меню")]),
]
OLD = [(("1 Handy Hell", "2 Handy Dunkel", "08 Info zum Tag (Blatt)"), "Soft 08 · Info zum Tag (было)", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "33 Neuer Plan da (Hinweis)"), "Soft 33 · Neuer Plan da (было)", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "35 Tag · Plan fehlt noch"), "Soft 35 · Plan fehlt noch (было)", "phone"),
       (("3 PC Hell", "4 PC Dunkel", "09 Info zum Tag (Panel rechts)"), "Soft PC 09 · Info zum Tag (было)", "pc")]

CSS = """
/* Раскладка: одна колонка разделов; в каждом — ряд телефонов, под ним экраны ПК во всю ширину. Цвета и шрифт — токены ORBook Soft. */
:root{--paper:#FBF7F2;--card:#FFFFFF;--ink:#2A2433;--muted:#6A6275;--faint:#978FA1;--accent:#6C4DF6;--accent-ink:#4A31C9;--tint:#EEE9FF;--sand:#F3EDE5;--rule:#EAE2D8;--stage:#F0EAE2;
--display:'Nunito',ui-rounded,system-ui,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#16131C;--card:#221E2A;--ink:#F4F0F8;--muted:#B5ACC1;--faint:#877E94;--accent:#A58BFF;--accent-ink:#CFC2FF;--tint:#2C2548;--sand:#2A2533;--rule:#352F40;--stage:#0F0D14;color-scheme:dark}}
:root[data-theme="dark"]{--paper:#16131C;--card:#221E2A;--ink:#F4F0F8;--muted:#B5ACC1;--faint:#877E94;--accent:#A58BFF;--accent-ink:#CFC2FF;--tint:#2C2548;--sand:#2A2533;--rule:#352F40;--stage:#0F0D14;color-scheme:dark}
body{background:var(--paper);color:var(--ink);font-family:var(--display);font-size:15px;line-height:1.55}
.wrap{max-width:1240px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 64px}
header{display:flex;flex-wrap:wrap;gap:16px 24px;align-items:end;justify-content:space-between;margin-bottom:8px}
.eyebrow{font-size:12.5px;font-weight:800;color:var(--accent-ink);letter-spacing:.02em}
h1{font-size:clamp(28px,4vw,40px);font-weight:900;letter-spacing:-.015em;margin:2px 0 0;text-wrap:balance}
h2{font-size:22px;font-weight:900;letter-spacing:-.01em;margin:44px 0 6px;text-wrap:balance}
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
const root=document.getElementById('shots');const btns=[...document.querySelectorAll('.seg button')];
function show(v){root.classList.remove('show-hell','show-dunkel','show-beide');root.classList.add('show-'+v);
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb26-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb26-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Live und Verlauf</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 26 · быстрое обновление и история дня</div><h1>Live und Verlauf</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button id="t-hell" data-v="hell">Hell</button><button id="t-dunkel" data-v="dunkel">Dunkel</button><button id="t-beide" data-v="beide">Beide</button></div></header>',
           '<p>Новый план доходит до открытого приложения сам, за секунды. У каждого дня есть история версий. По каждому дню видно, когда его проверяли. '
           'Всё нарисовано токенами Soft; в конце — старые экраны для сравнения.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('<section id="vergleich"><h2>Для сравнения: старые экраны Soft</h2><p>Какие экраны менялись.</p><div class="row">')
    out += [orig(pth, cap, kind) for pth, cap, kind in OLD]
    out.append('</div></section></div>')
    out.append('''<div class="box"><h2>Что изменится на сервере</h2><ul>
<li><b>Сразу вся неделя.</b> <span>Как только сервер замечает новый план хотя бы у одного дня, он тут же проверяет все дни до конца следующей недели. Школа обычно публикует несколько дней разом.</span></li>
<li><b>Сообщение приложению.</b> <span>Открытое приложение держит с сервером одно тихое соединение. Изменился план — сервер пишет в него «план новый», приложение перезагружает неделю. Опрос раз в 10 секунд больше не нужен.</span></li>
<li><b>Проверка по дням.</b> <span>Сервер отдаёт для каждого дня время последней проверки, в том числе для дней без плана.</span></li>
<li><b>«Jetzt prüfen» для открытой недели.</b> <span>Кнопка проверяет ту неделю, на которую смотришь. Лимит прежний: раз в минуту на весь класс.</span></li>
<li><b>История.</b> <span>Версии дня сервер уже хранит 30 дней; добавится запрос, который их отдаёт.</span></li>
</ul></div>''')
    out.append('''<div class="box"><h2>Что нужно решить</h2><ol>
<li><b>Как часто спрашивать школу.</b> <span>Сейчас сегодня и завтра проверяются раз в 60 секунд (06:00–16:00). Предлагаю оставить 60 секунд: вместе с пунктами выше новый план будет в приложении примерно за минуту. Можно 30 секунд, но это вдвое больше запросов к серверу школы, и он может нас ограничить.</span></li>
<li><b>История 30 дней.</b> <span>Так уже написано в правилах сервера. Оставить 30 дней?</span></li>
</ol></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
