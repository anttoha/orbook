# Собирает index.html — страницу-обзор макетов части 14 со встроенными SVG (для артефакта «ок дизайн?»).
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

SECTIONS = [
    ("login", "Вход учителя", "На экране входа появилась тихая ссылка «Lehrkraft? Mit Lehrer-Code anmelden». Учитель вводит только свой код (ORB-L-…), пароль класса ему не нужен. К учителям обращаемся на «Sie». Неверный или заблокированный код — красная рамка и подсказка.",
     [("handy-01-zugang", "Zugang · ссылка для учителей"), ("handy-02-lehrer-code", "Lehrkraft · Code"), ("handy-03-lehrer-code-fehler", "Lehrkraft · Code falsch")],
     [("pc-01-zugang-lehrkraft", "Computer · Mit Code anmelden")]),
    ("hausaufgaben", "Hausaufgaben", "Hausaufgaben живут во вкладке «Klausuren»: сверху переключатель «Klausuren · Hausaufgaben», нижняя навигация остаётся из 4 кнопок. Список устроен как список Klausuren: дата сдачи цветом предмета, «Mathe · von Mü», текст. Окно задания показывает весь текст и автора. Форма учителя: предмет, «Abgabe bis» с подсказками «Nächste Stunde» и «In 1 Woche», текст до 300 знаков.",
     [("handy-04-hausaufgaben", "Hausaufgaben · Liste"), ("handy-05-hausaufgabe-details", "Hausaufgabe · Details (Blatt)"), ("handy-06-hausaufgabe-eintragen", "Neue Hausaufgabe (Lehrkraft)"), ("handy-09-hausaufgaben-leer", "Hausaufgaben · leer")],
     [("pc-02-hausaufgaben", "Computer · Liste + Panel (eigener Eintrag → Bearbeiten)"), ("pc-03-hausaufgabe-eintragen", "Computer · Neue Hausaufgabe (Fenster)")]),
    ("tag", "Hausaufgaben в дне, автор и «кто может менять»", "В каждой записи учителя (Klausur и Hausaufgabe) есть переключатель «Schüler dürfen ändern», по умолчанию выключен. Ученик может менять такую запись, только если включены обе галочки: этот переключатель у записи и право «Lehrer-Einträge ändern» у его Editor-Code. В окне записи всем видно, кто может её менять: «Ändern dürfen nur Mü und der Admin» или «Ändern: Mü, Admin und Schüler mit Freigabe». Внизу окна — «Verlauf»: когда и кто менял запись и что именно (ученик — без имени, учитель — с Kürzel). Удалять запись учителя ученик не может. В дне под уроками — блок «Hausaufgaben · fällig heute» (задания, которые сдают в этот день), над «Meine Notizen». В окне Klausur вместо «ohne Namen» стоит «Eingetragen von Mü · Lehrkraft». Записи с Editor-Code (в том числе Hausaufgaben старосты) остаются без автора, как сейчас — в списке просто «Englisch» без «von …».",
     [("handy-07-tag", "Tag · Liste mit Hausaufgaben"), ("handy-08-klausur-autor", "Klausur · Details mit Autor"), ("handy-14-klausur-lehrkraft", "Neue Klausur (Lehrkraft) · Schüler dürfen ändern"), ("handy-15-verlauf", "Verlauf · wer hat was geändert")], []),
    ("admin", "Админка", "Телефон: во вкладке «Codes» переключатель «Editor-Codes · Lehrer-Codes». Компьютер: отдельный пункт меню «Lehrer-Codes». Права теперь галочками: у Editor-Code две новые галочки, обе по умолчанию выключены: «Hausaufgaben eintragen» (включаете, например, старосте) и «Lehrer-Einträge ändern» (работает, только если учитель разрешил это в своей записи), у Lehrer-Code — «Klausuren und Tests» и «Hausaufgaben» (обе включены, можно снять). Менять и удалять учитель может только свои записи. Учителя выбираются по Kürzel из плана, без настоящих имён. В Einstellungen новый блок «Hausaufgaben»: срок автоудаления (по умолчанию 30 дней после сдачи) и кнопка «Alte löschen».",
     [("handy-10-admin-lehrer-codes", "Admin · Lehrer-Codes"), ("handy-11-admin-neuer-lehrer-code", "Admin · Neuer Lehrer-Code"), ("handy-13-admin-neuer-editor-code", "Admin · Neuer Editor-Code (neues Recht)"), ("handy-12-admin-einstellungen", "Admin · Einstellungen · Hausaufgaben")],
     [("pc-04-admin-lehrer-codes", "Computer · Admin · Lehrer-Codes"), ("pc-05-admin-neuer-editor-code", "Computer · Neuer Editor-Code (Fenster)")]),
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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb14-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb14-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Lehrkräfte</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 14 · новые экраны ORBook Soft</div><h1>Lehrkräfte и Hausaufgaben</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Макеты нарисованы поверх настоящих экранов Soft (01 Zugang, 05 Tag, 13/14 Klausuren, 41–45 Admin): шапки, меню и навигация взяты как есть, новое дорисовано теми же цветами, шрифтом и радиусами. Каждый экран есть в светлой и тёмной теме — переключатель справа вверху.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('</div>')
    out.append('''<div class="box"><h2>Решено</h2><ol>
<li>Hausaufgaben с Editor-Code — по галочке у кода, по умолчанию выключено.</li>
<li>Учитель входит только по своему коду, без пароля класса.</li>
<li>У Lehrer-Code обе галочки (Klausuren, Hausaufgaben) включены сразу, админ может снять.</li>
<li>Запись учителя ученик меняет только при двух галочках: «Lehrer-Einträge ändern» у кода и «Schüler dürfen ändern» в записи. Удалять — только учитель и админ.</li>
<li>Классу видно «geändert von Schüler» без имени, плюс «Verlauf» изменений. Кто именно — админ видит в Protokoll.</li>
</ol>
<p style="margin-top:14px"><b>Решил сам (скажите, если не так):</b></p><ul style="margin:0;padding-left:20px">
<li>один Lehrer-Code работает на нескольких устройствах учителя (телефон и ПК);</li>
<li>если код учителя заблокирован или истёк, его записи остаются с подписью «von Mü»;</li>
<li>учителя нет в плане (например, на замене) — админ вводит Kürzel вручную;</li>
<li>Hausaufgaben видят те же ученики, что и Klausuren по этому предмету (с учётом «Meine Kurse»);</li>
<li>админ видит и удаляет все Hausaufgaben в «Alle Klausuren» (там будет фильтр «Hausaufgaben»).</li>
</ul><p style="margin-top:12px">Ответ: «ок дизайн». План бэкенда — в чате, на него тоже нужно «ок».</p></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
