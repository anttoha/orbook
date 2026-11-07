# Собирает index.html — страницу-обзор макетов части 16 «Einladen» со встроенными SVG (для артефакта «ок дизайн?»).
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

def inline_soft(path):
    """Оригинал из ORBook Soft — для сравнения рядом с новым экраном."""
    global n
    n += 1
    s = open(os.path.join(SOFT, path), encoding="utf-8").read()
    p = f"s{n}-"
    s = re.sub(r'id="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', s)
    s = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}{m.group(1)})', s)
    return s.replace("<svg ", '<svg role="img" ', 1)

def old(name, caption, kind="phone"):
    a, b = ("1 Handy Hell", "2 Handy Dunkel") if kind == "phone" else ("3 PC Hell", "4 PC Dunkel")
    return (f'<figure class="shot {kind} old"><figcaption>Soft (было) · {caption}</figcaption>'
            f'<div class="v v-hell">{inline_soft(a + "/" + name + ".svg")}</div><div class="v v-dunkel">{inline_soft(b + "/" + name + ".svg")}</div></figure>')

# (id, заголовок, текст, телефон, ПК, старые экраны Soft для сравнения)
SECTIONS = [
    ("admin", "Админ: «Einladen» у группового кода", "Zugangscodes → ⋮ у группового кода (например «Klasse 9b») → первая строка «Einladen». Открывается шторка (телефон) или окно (ПК): QR, короткая ссылка, «Kopieren» и «WhatsApp» — как в «Teilen». Ниже: «QR groß zeigen» (для проектора на Elternabend), «Link aktiv», «Mitschüler dürfen teilen», «Neuen Link erzeugen». У кода с работающей ссылкой — метка LINK.",
     [("handy-01-aktionen", "Code-Aktionen + Einladen"), ("handy-02-einladen", "Einladen"), ("handy-03-kopiert", "Kopiert · Toast"), ("handy-07-laden", "Laden")],
     [("pc-01-menue", "Computer · Menü"), ("pc-02-einladen", "Computer · Fenster"), ("pc-03-kopiert", "Computer · Toast")],
     [("43 Admin · Code-Aktionen (Blatt)", "Code-Aktionen", "phone"), ("12 Teilen (Blatt)", "Teilen", "phone")]),
    ("gross", "QR на весь экран", "Для класса, проектора или соседа по парте: большой QR, ссылка крупно, «Link kopieren». QR всегда тёмный на белом — так его читает любая камера, и в тёмной теме тоже.",
     [("handy-04-gross", "QR groß")], [("pc-04-gross", "Computer · QR groß")], []),
    ("aendern", "Новая ссылка и выключение", "«Neuen Link erzeugen» — сначала вопрос: старая ссылка и старый QR перестают работать, вошедшие остаются. «Link aktiv» выкл. — QR бледный с плашкой «Link ist aus», кнопки неактивны.",
     [("handy-05-neuer-link-fragen", "Neuer Link?"), ("handy-06-link-aus", "Link aus")],
     [("pc-05-neuer-link-fragen", "Computer · Neuer Link?"), ("pc-06-link-aus", "Computer · Link aus")], []),
    ("schueler", "Ученик: «Klasse einladen»", "Если админ разрешил («Mitschüler dürfen teilen»): Mehr → новая строка «Klasse einladen» между «Datenschutz» и «Klasse verlassen». ПК: Einstellungen → новая карточка и пункт меню. Если выключено — объяснение и путь через Zugangscode.",
     [("handy-08-mehr", "Mehr · neue Zeile"), ("handy-09-schueler-einladen", "Klasse einladen"), ("handy-10-schueler-aus", "Einladen aus")],
     [("pc-07-schueler", "Computer · Einstellungen"), ("pc-08-schueler-einladen", "Computer · Fenster")],
     [("22 Mehr", "Mehr", "phone")]),
    ("beitreten", "Кто открыл ссылку", "Экран входа Soft, внизу вместо поля пароля — карточка «Klasse 9b» и одна кнопка «Beitreten». Дальше — как после входа (выбор курсов). Ссылка старая/выключена — красная плашка и обычное поле кода. Лимит устройств полон — понятная ошибка.",
     [("handy-11-beitreten", "Beitreten"), ("handy-12-beitreten-laden", "Laden"), ("handy-13-link-ungueltig", "Link ungültig"), ("handy-14-klasse-voll", "Limit voll")],
     [("pc-09-beitreten", "Computer · Beitreten"), ("pc-10-link-ungueltig", "Computer · Link ungültig")],
     [("01 Zugang", "Zugang", "phone")]),
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
.old{opacity:.85;outline:1px dashed var(--rule)}
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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb16-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb16-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Einladen</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 16 · новые экраны ORBook Soft</div><h1>Einladen · Link und QR</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Нарисовано поверх настоящих экранов Soft (12/13 Teilen, 22 Mehr, 22 Einstellungen, 01 Zugang, 43/45 Code-Aktionen, 48 Fenster) и экранов части 14c. Серые карточки «Soft (было)» — старые экраны для сравнения. QR настоящий: можно навести камеру.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs, olds in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [old(nm, cap, k) for nm, cap, k in olds]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('</div>')
    out.append('''<div class="box"><h2>Решил сам (скажите, если не так)</h2><ul style="margin:0;padding-left:20px">
<li>ссылка приглашения — у <b>группового</b> Zugangscode (например «Klasse 9b»); кто вошёл по ней, считается устройством этого кода (лимит, «Sperren», «Geräte abmelden» работают как раньше);</li>
<li>ссылка короткая <code>orbook.orbitium.net/i/K7MQ-2XPA</code> — это отдельный токен, не сам код: её можно показывать снова, а код по-прежнему виден один раз;</li>
<li>«Neuen Link erzeugen» гасит старую ссылку и QR, но никого не выкидывает; «Link aktiv» выкл. — по ссылке больше не войти;</li>
<li>ученики видят «Klasse einladen» только если админ включил «Mitschüler dürfen teilen» (по умолчанию вкл.);</li>
<li>QR всегда тёмный на белом (новые токены <code>--color-qr-bg</code>/<code>--color-qr-ink</code>, одинаковые в обеих темах); для QR во фронте понадобится маленькая библиотека.</li>
</ul><p style="margin-top:12px">Ответ: «ок дизайн» или что поменять.</p></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
