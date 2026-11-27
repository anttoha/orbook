# Собирает index.html — обзор макетов части 53 со встроенными SVG (для артефакта «ок дизайн?»).
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
n = 0
def inline(name):
    global n; n += 1
    s = open(os.path.join(HERE, name + ".svg"), encoding="utf-8").read()
    p = f"s{n}-"
    s = re.sub(r'id="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', s)
    s = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}{m.group(1)})', s)
    return s.replace("<svg ", '<svg role="img" ', 1)
def shot(name, cap, themes=("hell", "dunkel")):
    return "".join(f'<figure><figcaption>{cap} · {th}</figcaption>{inline(f"{name}-{th}")}</figure>' for th in themes)
SECTIONS = [
  ("Форма: вид «Frei»", "Выбираешь «Frei» — вместо «Uhrzeit» и «Ort» появляется «Unterricht»: <b>Ganzer Tag</b> или <b>Nur einzelne Stunden</b>. Во втором случае — кнопки-номера уроков (1–8, можно несколько). Без выбранного урока сохранить нельзя — ошибка под кнопками.",
   [("handy-01-frei-stunden", "Nur einzelne Stunden", ("hell", "dunkel")), ("handy-02-frei-ganzer-tag", "Ganzer Tag", ("hell",)), ("handy-03-keine-stunde", "Keine Stunde gewählt", ("hell",))]),
  ("Woche", "Уроки не исчезают. Над днём — зелёная полоска термина (как сейчас). Уроки, которые frei, — зелёные с пунктиром и словом «frei» вместо кабинета. Чт: frei только 5.–6. урок (Sportfest), Пт: весь день (Pädagogischer Tag).",
   [("handy-04-woche", "Woche", ("hell", "dunkel"))]),
  ("Tag", "Сверху зелёная плашка «Frei: …» (нажатие — окно термина). Уроки остаются в списке, но зачёркнуты зелёным и с меткой FREI — как «fällt aus», только зелёным. На ПК — то же в сетке и панели дня.",
   [("handy-05-tag-ganz", "Ganzer Tag frei", ("hell", "dunkel")), ("handy-06-tag-teil", "Nur 5.–6. Stunde frei", ("hell",))]),
]
body = []
for h, txt, shots in SECTIONS:
    body.append(f'<section><h2>{h}</h2><p>{txt}</p><div class="row">' + "".join(shot(a, b, t) for a, b, t in shots) + "</div></section>")
html = f'''<title>Frei nach Stunden</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap">
<style>
:root{{--bg:#FAF6F1;--card:#FFFFFF;--ink:#221B2E;--muted:#6F6879;--accent:#6C4DF6;--ok:#1F9D6B}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#15121C;--card:#211D2A;--ink:#F3F0F8;--muted:#A9A2B5;--accent:#A893FF;--ok:#5FD3A2;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#15121C;--card:#211D2A;--ink:#F3F0F8;--muted:#A9A2B5;--accent:#A893FF;--ok:#5FD3A2;color-scheme:dark}}
body{{background:var(--bg);color:var(--ink);font-family:Nunito,system-ui,sans-serif;padding-block:24px 48px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}}
header,section{{max-width:1240px;margin:0 auto 40px}}
h1{{font-size:30px;font-weight:900;margin:0 0 6px;text-wrap:balance}} h2{{font-size:21px;font-weight:900;margin:0 0 6px}}
header p,section>p{{color:var(--muted);font-size:15px;line-height:1.5;max-width:70ch;margin:0 0 16px}}
.eyebrow{{color:var(--accent);font-weight:800;font-size:13px;letter-spacing:.04em;text-transform:uppercase}}
.row{{display:flex;flex-wrap:wrap;gap:20px}}
figure{{margin:0;width:300px;max-width:100%}} figcaption{{font-size:13px;font-weight:800;color:var(--muted);margin-bottom:6px}}
figure svg{{width:100%;height:auto;display:block;border-radius:22px;box-shadow:0 2px 14px rgba(0,0,0,.08)}}
</style>
<header><div class="eyebrow">Часть 53 · дизайн</div><h1>Frei: весь день или отдельные уроки</h1>
<p>Термин «Frei» теперь знает, какие уроки не состоятся. Уроки плана мы не прячем, а помечаем зелёным — сразу видно, что день (или его часть) свободный.</p></header>
{"".join(body)}'''
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("ok", n)
