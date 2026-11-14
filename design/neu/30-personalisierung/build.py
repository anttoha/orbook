# Собирает index.html — страницу-обзор макетов части 30 со встроенными SVG (для артефакта «ок дизайн?»).
# Кроме картинок здесь есть живое демо: настоящий эффект стекла (backdrop-filter) и анимации — их на картинке не показать.
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SOFT = "/opt/orbook-be/design/ORBook Soft"
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
    return (f'<figure class="shot {kind}"><figcaption>{caption}</figcaption>'
            f'<div class="v v-hell">{inline(name + "-hell")}</div><div class="v v-dunkel">{inline(name + "-dunkel")}</div></figure>')

def orig(path, caption, kind="phone"):
    out = []
    for folder, cls in ((path[0], "v-hell"), (path[1], "v-dunkel")):
        s = open(os.path.join(SOFT, folder, path[2] + ".svg"), encoding="utf-8").read()
        out.append(f'<div class="v {cls}">{unique(s)}</div>')
    return f'<figure class="shot {kind} old"><figcaption>{caption}</figcaption>{"".join(out)}</figure>'

SECTIONS = [
    ("start", "1 · «Start»: главный экран из блоков",
     "Новая вкладка «Start» слева в меню. На ней блоки: что идёт сейчас и что дальше, ближайшие тесты, домашки, неделя в миниатюре, изменения, заметки. "
     "Каждый блок открывает свой раздел. Значок с ползунками справа сверху включает режим «Anpassen».",
     [("handy-01-start", "Start"), ("handy-05-start-leer", "Все блоки убраны"), ("handy-06-start-laden", "Загрузка")],
     [("pc-01-start", "ПК · четыре колонки, блоков помещается больше")]),
    ("anpassen", "2 · «Anpassen»: перетащить, изменить размер, добавить, убрать",
     "В режиме «Anpassen» блок можно взять и перенести — остальные раздвигаются, пунктир показывает, куда он встанет. "
     "Красный минус убирает блок, стрелки в углу меняют размер: Klein (половина ширины), Breit (вся ширина), Groß (вся ширина и вдвое выше). "
     "Нажатие на блок открывает его настройки. «Block hinzufügen» показывает все одиннадцать блоков; галочка — уже стоит на Start. "
     "На ПК список блоков всегда справа, блок тянется прямо из него.",
     [("handy-02-start-anpassen", "Несём блок «Aufgaben»"), ("handy-03-block", "Настройки блока"), ("handy-04-block-hinzufuegen", "Block hinzufügen")],
     [("pc-02-start-anpassen", "ПК · «Notizen» тянем из списка на свободное место")]),
    ("design", "3 · Оформления: Soft, Glas, Klar",
     "В «Darstellung» появились «Design» и «Akzentfarbe». Тема (Hell / Dunkel / System) остаётся отдельно — каждое оформление есть и светлое, и тёмное. "
     "Soft — как сейчас. Glas — полупрозрачные карточки поверх цветного фона (Liquid Glass), фон выбирается из четырёх. "
     "Klar — белый фон, тонкие рамки, почти прямые углы, цвет предмета полоской слева: строго и контрастно. "
     "Акцентный цвет (кнопки, выбранный день, активная вкладка) — шесть вариантов.",
     [("handy-07-darstellung", "Darstellung · Soft"), ("handy-08-darstellung-glas", "Darstellung · Glas: фон и «Glas-Effekt»")],
     [("pc-04-darstellung", "ПК · Darstellung")]),
    ("glas", "4 · Glas на экранах",
     "«Glas-Effekt · Einfach» — запасной вид для слабых телефонов: те же цвета, но без размытия (карточки плотнее). "
     "Приложение включает его само, если браузер не умеет размытие или в системе включено «меньше прозрачности».",
     [("handy-09-start-glas", "Start · Glas"), ("handy-10-woche-glas", "Woche · Glas")],
     [("pc-03-start-glas", "ПК · Start · Glas")]),
    ("klar", "5 · Klar на экранах",
     "То же расписание и те же блоки, другое оформление.",
     [("handy-11-start-klar", "Start · Klar"), ("handy-12-woche-klar", "Woche · Klar")], []),
    ("plan", "6 · «Stundenplan»: что показывать в расписании",
     "Новая страница в «Darstellung». Сверху живой пример, ниже переключатели: Kürzel или полное название предмета, кабинет, учитель, время слева; "
     "цвет предмета — заливкой, полоской или без цвета; неделя (выходные, компактно, свободные уроки, выпавшие уроки зачёркивать или прятать); "
     "день (список или шкала времени, перемены). Сюда же переехали старые настройки недели и дня из «Darstellung».",
     [("handy-13-stundenplan", "Stundenplan")], []),
]
OLD = [(("1 Handy Hell", "2 Handy Dunkel", "04 Woche"), "Soft 04 · Woche", "phone"), (("1 Handy Hell", "2 Handy Dunkel", "24 Darstellung"), "Soft 24 · Darstellung", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "22 Mehr"), "Soft 22 · Mehr", "phone")]

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
/* ── живое демо ── */
.demos{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-top:6px}
.demo{background:var(--stage);border-radius:22px;padding:14px;min-width:0;display:flex;flex-direction:column;gap:12px}
.bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}
.play{font:800 12.5px var(--display);color:var(--on-accent);background:var(--accent);border:0;border-radius:18px;padding:9px 16px;cursor:pointer}
.scene{position:relative;height:300px;border-radius:16px;overflow:hidden;background:var(--paper)}
.scene.glassy{background:var(--glass-bg)}
.blob{position:absolute;width:62%;aspect-ratio:1;border-radius:50%;filter:blur(38px);opacity:.9}
.b1{background:var(--g1);left:-18%;top:-16%;animation:drift 9s ease-in-out infinite alternate}
.b2{background:var(--g2);right:-20%;top:22%;animation:drift 11s ease-in-out infinite alternate-reverse}
.b3{background:var(--g3);left:-10%;bottom:-26%;animation:drift 13s ease-in-out infinite alternate}
@keyframes drift{to{transform:translate(18%,12%) scale(1.12)}}
.gcard{position:absolute;left:14px;right:14px;border-radius:22px;padding:14px 16px;background:var(--glass);border:1px solid var(--glass-edge);
-webkit-backdrop-filter:blur(18px) saturate(1.6);backdrop-filter:blur(18px) saturate(1.6);box-shadow:inset 0 1px 0 var(--glass-edge),0 10px 28px rgba(40,24,110,.14)}
.flat .gcard{background:var(--glass-flat);-webkit-backdrop-filter:none;backdrop-filter:none}
.g-top{top:16px}.g-nav{bottom:16px;border-radius:29px;padding:7px;display:flex;align-items:center;gap:6px}
.lbl{font-size:10.5px;font-weight:800;letter-spacing:.05em;color:var(--accent-ink);display:flex;justify-content:space-between}
.lbl b{color:var(--ink);letter-spacing:0;font-size:12px}
.big{font-size:22px;font-weight:900;letter-spacing:-.3px;margin-top:6px}
.sub{font-size:12.5px;color:var(--muted)}.sub b{color:var(--accent-ink)}
.track{height:6px;border-radius:3px;background:var(--glass);margin-top:10px;overflow:hidden}.track i{display:block;height:100%;width:60%;border-radius:3px;background:var(--ma)}
.next{font-size:12px;font-weight:700;color:var(--danger);margin-top:8px}
.tab{flex:1;height:44px;border-radius:22px;display:grid;place-items:center;font-size:13px;font-weight:800;color:var(--muted)}
.tab.on{flex:1.6;background:var(--accent);color:var(--on-accent)}
/* блоки в режиме «Anpassen» */
.tiles{position:absolute;inset:14px;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:10px}
.tile{background:var(--card);border-radius:18px;padding:12px;font-size:10.5px;font-weight:800;letter-spacing:.05em;color:var(--faint);position:relative}
.tile.wide{grid-column:span 2}
.tile strong{display:block;font-size:17px;font-weight:900;letter-spacing:-.2px;color:var(--ink);margin-top:6px}
.tile::before{content:"";position:absolute;left:-6px;top:-6px;width:20px;height:20px;border-radius:50%;background:var(--danger);opacity:0;transition:opacity .2s}
.edit .tile::before{opacity:1}
.edit .tile{animation:wobble .34s ease-in-out infinite alternate}
.edit .tile:nth-child(2n){animation-delay:-.17s}
@keyframes wobble{from{rotate:-.9deg}to{rotate:.9deg}}
.tile.swap{transition:transform .45s cubic-bezier(.3,1.3,.5,1)}
/* переход между страницами и шторка */
.pg{position:absolute;inset:0;padding:16px;background:var(--paper)}
.pg h4{font-size:22px;font-weight:900;letter-spacing:-.3px;margin:14px 0 12px}
.pg .ey{font-size:12px;font-weight:800;color:var(--faint)}
.line{height:44px;border-radius:14px;background:var(--card);margin-bottom:8px}
.pg.two{transform:translateX(100%)}
.go .pg.one{animation:outL .42s cubic-bezier(.3,.9,.3,1) forwards}
.go .pg.two{animation:inR .42s cubic-bezier(.3,.9,.3,1) forwards}
@keyframes outL{to{transform:translateX(-24%);opacity:0}}
@keyframes inR{from{transform:translateX(100%)}to{transform:none}}
.sheet{position:absolute;left:0;right:0;bottom:0;height:56%;background:var(--card);border-radius:26px 26px 0 0;padding:26px 16px 0;transform:translateY(105%);box-shadow:0 -12px 40px rgba(0,0,0,.18)}
.sheet::before{content:"";position:absolute;left:50%;top:10px;width:38px;height:4px;margin-left:-19px;border-radius:2px;background:var(--rule)}
.sheet b{font-size:18px;font-weight:900}
.up .sheet{animation:rise .5s cubic-bezier(.25,1.25,.45,1) forwards}
@keyframes rise{to{transform:none}}
/* «Weniger»: только плавное появление; «Aus»: без движения */
.m-weniger .edit .tile,.m-aus .edit .tile,.m-weniger .blob,.m-aus .blob{animation:none}
.m-weniger .go .pg.one{animation:fadeOut .2s forwards}.m-weniger .go .pg.two{transform:none;animation:fadeIn .2s forwards}
.m-weniger .up .sheet{transform:none;animation:fadeIn .2s forwards}
.m-aus .go .pg.one{animation:none;opacity:0}.m-aus .go .pg.two,.m-aus .up .sheet{animation:none;transform:none}
.m-aus .tile.swap{transition:none}
@keyframes fadeOut{to{opacity:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.blob,.edit .tile{animation:none}}
"""

JS = """
const root=document.getElementById('shots');const btns=[...document.querySelectorAll('#themes button')];
function show(v){root.classList.remove('show-hell','show-dunkel','show-beide');root.classList.add('show-'+v);
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb30-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb30-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
// живое демо
function group(id,fn){const bs=[...document.querySelectorAll('#'+id+' button')];bs.forEach(b=>b.addEventListener('click',()=>{bs.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));fn(b.dataset.v)}))}
const live=document.getElementById('live');
group('motion',v=>{live.classList.remove('m-voll','m-weniger','m-aus');live.classList.add('m-'+v)});
group('glassmode',v=>document.getElementById('sc-glass').classList.toggle('flat',v==='einfach'));
const sc=document.getElementById('sc-edit');let swapped=false;
document.getElementById('b-edit').addEventListener('click',e=>{const on=sc.classList.toggle('edit');e.target.textContent=on?'Fertig':'Anpassen'});
document.getElementById('b-swap').addEventListener('click',()=>{const a=document.getElementById('t-a'),b=document.getElementById('t-b');
const dx=b.offsetLeft-a.offsetLeft;swapped=!swapped;a.style.transform=swapped?`translateX(${dx}px)`:'';b.style.transform=swapped?`translateX(${-dx}px)`:''});
const nav=document.getElementById('sc-nav');
document.getElementById('b-page').addEventListener('click',()=>{nav.classList.remove('up');nav.classList.toggle('go')});
document.getElementById('b-sheet').addEventListener('click',()=>{nav.classList.toggle('up')});
"""

LIVE = """<section id="live" class="m-voll"><h2>Живое демо: стекло и анимации</h2>
<p>На картинке стекло и движение не показать, поэтому здесь они настоящие. Переключатель «Animationen» тот же, что будет в «Darstellung»: Voll — всё движется, Weniger — только плавное появление, Aus — без движения.
Если в телефоне включено «уменьшить движение», приложение само начнёт с «Weniger».</p>
<div class="bar" style="margin-bottom:14px"><div class="seg" id="motion" role="group" aria-label="Animationen"><button id="mo-voll" data-v="voll" aria-pressed="true">Voll</button><button id="mo-weniger" data-v="weniger" aria-pressed="false">Weniger</button><button id="mo-aus" data-v="aus" aria-pressed="false">Aus</button></div></div>
<div class="demos">
<div class="demo"><div class="bar"><h3>Glas</h3><div class="seg" id="glassmode" role="group" aria-label="Glas-Effekt"><button id="gl-voll" data-v="voll" aria-pressed="true">Voll</button><button id="gl-einfach" data-v="einfach" aria-pressed="false">Einfach</button></div></div>
<div class="scene glassy" id="sc-glass"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
<div class="gcard g-top"><div class="lbl">JETZT · 2. STUNDE <b>noch 18 min</b></div><div class="big">Mathe</div><div class="sub"><b>Vertretung</b> · Kle · Raum 204</div><div class="track"><i></i></div><div class="next">09:25 · Englisch fällt aus</div></div>
<div class="gcard g-nav"><div class="tab on">Start</div><div class="tab">Woche</div><div class="tab">Tests</div><div class="tab">Mehr</div></div></div></div>
<div class="demo"><div class="bar"><h3>Start anpassen</h3><div><button class="play" id="b-edit" type="button">Anpassen</button> <button class="play" id="b-swap" type="button">Tauschen</button></div></div>
<div class="scene" id="sc-edit"><div class="tiles"><div class="tile wide">JETZT<strong>Mathe</strong></div><div class="tile swap" id="t-a">TESTS<strong>Fr · Mathe</strong></div><div class="tile swap" id="t-b">AUFGABEN<strong>3 offen</strong></div><div class="tile wide">WOCHE<strong>KW 38</strong></div></div></div></div>
<div class="demo"><div class="bar"><h3>Seitenwechsel und Blatt</h3><div><button class="play" id="b-page" type="button">Seite</button> <button class="play" id="b-sheet" type="button">Blatt</button></div></div>
<div class="scene" id="sc-nav"><div class="pg one"><div class="ey">KW 38</div><h4>Diese Woche</h4><div class="line"></div><div class="line"></div><div class="line"></div></div>
<div class="pg two"><div class="ey">Mittwoch · heute</div><h4>17. September</h4><div class="line"></div><div class="line"></div><div class="line"></div></div>
<div class="sheet"><b>Mathe</b><p style="margin-top:6px">2. Stunde · Kle · Raum 204</p></div></div></div>
</div></section>"""

def page():
    out = ['<title>ORBook Personalisierung</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 30 · персонализация и анимации</div><h1>Start, Design, Stundenplan</h1></div>',
           '<div class="seg" id="themes" role="group" aria-label="Тема макетов"><button id="t-hell" data-v="hell">Hell</button><button id="t-dunkel" data-v="dunkel">Dunkel</button><button id="t-beide" data-v="beide">Beide</button></div></header>',
           '<p>Четыре вещи: главный экран «Start» из блоков, три оформления с выбором акцентного цвета, настройка самого расписания и анимации. '
           'Всё хранится на устройстве и переносится через Sync-Code. Кто ничего не менял, видит приложение как сейчас.</p>',
           LIVE, '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('<section id="vergleich"><h2>Для сравнения: старые экраны Soft</h2><p>Откуда взяты шапка, клетки недели, карточки настроек и меню.</p><div class="row">')
    out += [orig(pth, cap, kind) for pth, cap, kind in OLD]
    out.append('</div></section></div>')
    out.append("""<div class="box"><h2>Вопросы к тебе</h2><ol>
<li><b>Что открывается при запуске</b> <span>Предлагаю: у новых — «Start», у тех, кто уже пользуется, остаётся как было (Woche или Heute), вкладка «Start» просто появляется в меню. Или сразу всем «Start»?</span></li>
<li><b>Оформления</b> <span>Soft, Glas и Klar — хватит трёх? Названия такие оставить?</span></li>
<li><b>Блоки</b> <span>Одиннадцать: Jetzt, Heute, Woche, Tests, Aufgaben, Änderungen, Termine, Notizen, Materialien, Statistik, Countdown. Что-то убрать или добавить?</span></li>
</ol></div>""")
    out.append("""<div class="box"><h2>План (коротко)</h2><ul>
<li><b>30a · Оформления и анимации</b> <span>Design, Akzentfarbe, фон для Glas, «Animationen». Свой CSS, без новых библиотек.</span></li>
<li><b>30b · Stundenplan</b> <span>страница настроек расписания, неделя и день слушаются этих настроек.</span></li>
<li><b>30c · Start</b> <span>вкладка, блоки, режим «Anpassen». Для перетаскивания пальцем нужна одна маленькая библиотека (dnd-kit) — объясню в части.</span></li>
<li><b>30d · Sync, Datenschutz, «Was ist neu»</b> <span>новые настройки едут через Sync-Code вместе с остальными.</span></li>
<li><b>Бэкенд</b> <span>не нужен: всё на устройстве и в шифрованном Sync-блоке.</span></li>
</ul></div>""")
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
