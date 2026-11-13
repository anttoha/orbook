# Макеты 29d «Schule → Klassen»: на старте классы сгруппированы по школам, у школы своя страница
# со своими классами и «Klasse hinzufügen»; код можно ввести где угодно — класс встаёт в свою школу.
# Всё из помощников части 29 (design/neu/29-klassen/gen.py).
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g29", os.path.join(HERE, "..", "29-klassen", "gen.py"))
k = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(k)
g, T, R, ICON, eyebrow, title, round_btn, segmented, overlay, label = k.g, k.T, k.R, k.ICON, k.eyebrow, k.title, k.round_btn, k.segmented, k.overlay, k.label
page, strip, toast, HLINE, CHEV_R, PLUS, CHECK, BACK, SCHOOL, GRID = k.page, k.strip, k.toast, k.HLINE, k.CHEV_R, k.PLUS, k.CHECK, k.BACK, k.SCHOOL, k.GRID
SCHOOLS = [("Goethe-Gymnasium", [0, 1]), ("Schiller-Schule", [2])]

def school_head(x, y, w, name, n, c, tap=True):
    """Строка школы над её классами: значок, имя, сколько классов; нажатие — страница школы."""
    out = f'<circle cx="{x + 16}" cy="{y + 16}" r="16" fill="{c["sand"]}"/>' + ICON(x + 7, y + 7, 0.75, c["muted"], SCHOOL, 1.9)
    out += T(x + 42, y + 21, name, 15, 800, c["ink"]) + T(x + 42 + k.est(name, 15) * 1.12 + 8, y + 21, f'· {n} {"Klasse" if n == 1 else "Klassen"}', 12.5, 400, c["faint"])
    if tap: out += ICON(x + w - 22, y + 8, 0.67, c["faint2"], CHEV_R)
    return out

def mini_card(x, y, w, ki, c, sub):
    """Класс внутри школы: как карточка части 29, только без школы в подписи (она уже над карточкой)."""
    cl = k.CLASSES[ki]
    h = 128
    out = [R(x, y, w, h, 22, c["card"]), k.cbadge(x + 14, y + 14, cl["name"], cl["col"], c, sub, 40),
           T(x + 66, y + 32, cl["label"], 15, 800, c["ink"]), T(x + 66, y + 49, f'Klasse {cl["name"]}', 12, 400, c["faint"]), k.gear(x + w - 48, y + 17, c),
           k.day_strip(x + 14, y + 66, w - 28, cl["day"], c, sub, h=30),
           T(x + 14, y + 115, "".join(k.S(t, wt, c[col]) for t, wt, col in cl["status"]), 12.5, 400, c["muted"], raw=True)]
    return "".join(out), h

def p_start(c, theme, sub):
    b = [eyebrow(18, 33, "Mittwoch · 17. September", c), title(18, 65, "Meine Klassen", c), round_btn(334, 33.31, c, PLUS),
         segmented(18, 86, 354, ["Karten", "Nebeneinander"], 0, c)]
    y = 140
    for name, ks in SCHOOLS:
        b.append(school_head(18, y, 354, name, len(ks), c)); y += 42
        for ki in ks:
            card, h = mini_card(18, y, 354, ki, c, sub); b.append(card); y += h + 10
        y += 8
    b.append(T(195, 806, "Schule antippen: ihre Klassen und „Klasse hinzufügen“", 11.5, 400, c["faint"], "middle"))
    return page(390, 844, c, "".join(b))

def p_school(c, theme, sub, toast_text=None):
    b = [round_btn(18, 22, c, BACK), eyebrow(64, 33, "Meine Klassen · Schule", c), title(18, 92, "Goethe-Gymnasium", c),
         T(18, 116, "2 Klassen auf diesem Gerät", 13, 400, c["muted"])]
    y = 140
    for ki in (0, 1):
        card, h = mini_card(18, y, 354, ki, c, sub); b.append(card); y += h + 10
    card, h = k.add_card(18, y + 4, 354, c, "Klasse hinzufügen", "Zugangscode einer Klasse dieser Schule"); b.append(card)
    b.append(T(18, y + 96, "Code einer anderen Schule? Geht auch – die Klasse", 12, 400, c["faint"]) + T(18, y + 114, "landet dann bei ihrer Schule.", 12, 400, c["faint"]))
    if toast_text: b.append(toast(18, 770, 354, toast_text, c))
    return page(390, 844, c, "".join(b))

def p_other_school(c, theme, sub):
    top = 368
    b = [strip(p_school(c, theme, sub)), k.sheet_head(c, top, "Goethe-Gymnasium", "Klasse hinzufügen"), label(18, top + 108, "Zugangscode", c),
         k.field(18, top + 118, 354, "ORB-A-9KXW-2P", c, state="ok", ls=1, icon=CHECK)]
    y = top + 182
    b.append(R(18, y, 354, 92, 18, c["oktint"]) + k.cbadge(30, y + 12, "7c", 2, c, sub) + T(86, y + 30, "Schiller-Schule · 7c", 14.5, 800, c["ink"])
             + T(86, y + 49, "Gefunden – gehört zu einer anderen Schule.", 12, 400, c["muted"]) + T(86, y + 67, "Die Klasse kommt zur Schiller-Schule.", 12, 400, c["muted"]))
    b.append(label(18, y + 120, "Name auf diesem Gerät", c) + k.field(18, y + 130, 354, "Nachhilfe", c))
    b.append(k.button(18, y + 200, 354, "Hinzufügen und Kurse wählen", c, icon=CHEV_R))
    return page(390, 844, c, "".join(b))

def p_switch(c, theme, sub):
    """Чип класса в шапке: классы по школам, школа — маленькой строкой над своими классами."""
    chip, w = k.class_chip(18, 18.5, "9b", c)
    b = [strip(k.m22.p_woche(c, theme, sub)), R(0, 12, 240, 30, 0, c["paper"]), chip, eyebrow(18 + w + 8, 33, "KW 38 · 15.–19. Sept", c), overlay(c, 390, 844), chip]
    x, y, mw, rh, fh = 18, 48, 300, 56, 48
    h = 8 + 3 * rh + 2 * 30 + 9 + 2 * fh + 6
    b.append(R(x, y, mw, h, 22, c["card"]) + R(x + .5, y + .5, mw - 1, h - 1, 21.5, "none", c["hair"]))
    ry = y + 8
    for name, ks in SCHOOLS:
        b.append(T(x + 18, ry + 21, name.upper(), 10.5, 800, c["faint"], ls=0.5)); ry += 30
        for ki in ks:
            cl = k.CLASSES[ki]
            if ki == 0: b.append(R(x + 6, ry + 2, mw - 12, rh - 4, 16, c["sand"]) + ICON(x + mw - 38, ry + 18, 0.83, c["accink"], CHECK, 2.4))
            b.append(k.cbadge(x + 16, ry + 10, cl["name"], cl["col"], c, sub, 36) + T(x + 64, ry + 25, cl["label"], 14.5, 800, c["ink"]) + T(x + 64, ry + 43, f'Klasse {cl["name"]}', 12, 400, c["faint"]))
            ry += rh
    ry += 4
    b.append(HLINE(x + 14, x + mw - 14, ry, c))
    for i, (ic, text) in enumerate([(GRID, "Alle Klassen"), (PLUS, "Klasse hinzufügen")]):
        fy = ry + 5 + i * fh
        b.append(ICON(x + 22, fy + 14, 0.8, c["muted"], ic, 1.9) + T(x + 64, fy + 29.5, text, 14, 600, c["ink"]))
    return page(390, 844, c, "".join(b))

SCREENS = {
    "handy-20-schulen": p_start,
    "handy-21-schule": p_school,
    "handy-22-code-andere-schule": p_other_school,
    "handy-23-wechsler-schulen": p_switch,
}
if __name__ == "__main__":
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
    print("ok")
