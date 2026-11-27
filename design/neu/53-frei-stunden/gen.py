# Макеты части 53 «Frei: ganzer Tag oder nur bestimmte Stunden».
#   • форма Termin вида «Frei»: новое поле «Unterricht» — «Ganzer Tag» или «Nur einzelne Stunden» (номера уроков);
#     время и место для «Frei» не нужны — вместо них этот выбор;
#   • Woche: уроки в свободный день не прячем — клетка зелёная, пунктир, «frei» вместо кабинета;
#   • Tag: зелёная плашка «Frei: …» сверху, уроки с меткой FREI (как «fällt aus», только зелёным).
# Кирпичики: 50 (неделя/день с погодой) → 19 (строки дня), 18 (кнопки-выбор и поля формы Termin). Цвета — токены Soft.
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE

def _load(name, folder):
    sp = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", folder, "gen.py"))
    mod = importlib.util.module_from_spec(sp)
    argv, sys.argv = sys.argv, [sys.argv[0]]   # чужой генератор не должен писать файлы
    try: sp.loader.exec_module(mod)
    finally: sys.argv = argv
    return mod

W50 = _load("g50", "50-wetter")
m18 = _load("g18", "18-termine")
W, p30, g, m19 = W50.W, W50.p30, W50.g, W50.m19
T, S, R, ICON, P, DOT = g.T, g.S, g.R, g.ICON, g.P, p30.DOT
eyebrow, title, label = p30.eyebrow, p30.title, p30.label
BACK, CHEV_R, DOTS_V, CAL, CHECK = g.BACK, g.CHEV_R, g.DOTS_V, g.CAL, g.CHECK
SUN = m18.SUN
tw = W50.tw

# Неделя KW 38: Do 18 — «Sportfest», frei ab der 5. Stunde; Fr 19 — «Pädagogischer Tag», ganzer Tag frei
FREE = {3: {4, 5}, 4: {0, 1, 2, 3, 4, 5}}     # столбец → строки (0 = 1. Stunde)
PILLS = {3: "Sportfest", 4: "Pädagogischer Tag"}

# ════════════════ Кирпичики ════════════════
def frei_cell(st, x, y, w, h, code):
    """Клетка урока, который в этот день frei: зелёная, пунктир, «frei» вместо кабинета."""
    c = st.c
    return (R(x + .5, y + .5, w - 1, h - 1, st.rz, c["oktint"], c["ok"], 1, ' stroke-dasharray="3 2"')
            + T(x + 8, y + 20, code, 12.5, 900, c["ok"]) + T(x + 8, y + 42, "frei", 8.5, 800, c["ok"]))

def green_pill(st, x, y, w, text, h=20, size=9.5):
    """Полоска термина над днём (как в 18), у «Frei» — зелёная."""
    c = st.c
    return R(x, y, w, h, h / 2, c["oktint"]) + T(x + 7, y + h / 2 + size * 0.36, m18.fit(text, w - 12, size), size, 800, c["ok"])

def frei_box(st, x, y, w, head, rest, h=59.69):
    """Плашка дня «Frei: …» — как «Termin: …» из 18, только зелёная. Нажатие — окно термина."""
    c = st.c
    out = [R(x, y, w, h, 16, c["oktint"]), ICON(x + 13, y + 12, 0.67, c["ok"], SUN)]
    out.append(T(x + 39, y + 24, S("Frei: ", 700, c["ok"]) + S(head, 400, c["muted"]), 13, 400, c["muted"], raw=True))
    out.append(T(x + 39, y + 42.85, rest, 13, 400, c["muted"]))
    out.append(ICON(x + w - 28, y + h / 2 - 8, 0.67, c["faint2"], CHEV_R))
    return "".join(out)

def frei_row(st, y, p, code, x=18, w=354):
    """Строка «Tag · Liste» для урока, который frei: зелёная, предмет зачёркнут, метка FREI пунктиром."""
    c = st.c
    h = 64
    a, b = m19.TIMES[p - 1]
    name = m19.NAMES[code]
    nw = g.tw(name, 15, 800) * 0.86
    out = [R(x, y, w, h, 20, c["oktint"]), T(x + 14, y + 26, a, 13, 700, c["ink"]), T(x + 14, y + 43, b, 11, 400, c["faint"])]
    out.append(T(x + 68, y + 27, name, 15, 800, c["ok"]) + R(x + 68, y + 22.5, nw, 1, 0, c["ok"]))
    bw = 42
    out.append(R(x + w - 14.5 - bw, y + 13, bw, 18, 9, "none", c["ok"], 1, ' stroke-dasharray="3 2"')
               + T(x + w - 14.5 - bw / 2, y + 25.5, "FREI", 9.5, 800, c["ok"], "middle", 0.57))
    out.append(T(x + 68, y + 48, f"{m19.TEACH[code]} · Raum {m19.ROOM[code]}", 12.5, 400, c["muted"]))
    return "".join(out), h

def day_rows(st, y, rows):
    """rows: (Stunde, Fach, frei?). Паузы после 2., 3. и 4. урока — как в 05."""
    out = []
    for p, code, free in rows:
        if free: r, h = frei_row(st, y, p, code)
        else: r, h = m19.lesson_row(y, p, code, st.c, st.sub, False)
        out.append(r); y += h
        if p in (2, 3, 4) and p != rows[-1][0]:
            out.append(m19.pause(y + 18.5, st.c)); y += 37
        else:
            y += 8
    return "".join(out)

# ════════════════ Woche ════════════════
def p_woche(st):
    c = st.c
    b = [W50.week_head(st), st.rbtn(246, 33.31, BACK), st.rbtn(290, 33.31, DOTS_V), st.rbtn(334, 33.31, CHEV_R)]
    y0 = 114
    COLS, CW = m19.COLS, m19.CW
    for i, (wd, d, stand, icon, temp) in enumerate(W50.WEEKWX):
        b.append(W50.day_pill(st, COLS[i], y0, CW, wd, d, stand, icon, temp, i == 2))
    for col, text in PILLS.items():
        b.append(green_pill(st, COLS[col], y0 + 80, CW, text))
    gy = y0 + 108
    for r in range(6):
        y = gy + r * 56
        b.append(T(27, y + 24, str(r + 1), 12.5, 700, c["ink"], "middle") + T(27, y + 38, p30.TIMES[r][0], 8.5, 400, c["faint"], "middle"))
        for i in range(5):
            code = p30.WEEK[i][r]
            x = COLS[i]
            if code and r in FREE.get(i, ()):
                b.append(frei_cell(st, x, y, CW, 52, code)); continue
            aus = (i, r) == (2, 2)
            b.append(st.cell(x, y, CW, 52, code, state="aus" if aus else None))
            if not code: continue
            col = c["danger"] if aus else st.ctext(code)
            b.append(T(x + 8, y + 20, p30.struck(code) if aus else code, 12.5, 900, col, raw=True))
            b.append(T(x + 8, y + 42, "fällt aus", 8.5, 800, col) if aus else f'<g opacity="0.85">{T(x + 8, y + 42, p30.ROOM[code], 9.5, 600, col)}</g>')
    ly = gy + 6 * 56 + 12
    b.append(st.card(18, ly, 354, 68.88) + ICON(32, ly + 25.69, 0.79, c["muted"], p30.FLAG, 1.9) + T(63, ly + 29, "Fr · Mathe", 14.5, 500, c["ink"])
             + T(63, ly + 48, "Nächste Klausur", 12, 400, c["faint"]) + T(334, ly + 39.19, "in 2 Tagen", 13, 400, c["faint"], "end") + ICON(342, ly + 27.19, 0.67, c["faint2"], CHEV_R))
    b.append(R(0, 744, 390, 100, 0, c["paper"]) + p30.nav(st, 1))
    return st.page(390, 844, "".join(b))

# ════════════════ Tag ════════════════
def tag_head(st, wd, date):
    c = st.c
    return (st.rbtn(18, 33.31, BACK) + eyebrow(66, 33, wd, c, True) + title(66, 65, date, c)
            + st.rbtn(290, 33.31, BACK) + st.rbtn(334, 33.31, CHEV_R) + st.seg(18, 88, 354, ["Liste", "Zeitleiste"], 0, h=38, fs=13.5))

def p_tag_ganz(st):
    c = st.c
    b = [tag_head(st, "Freitag", "19. September"), frei_box(st, 18, 138, 354, "Pädagogischer Tag · ganzer", "Tag. Eingetragen von der Schule.")]
    rows = [(p + 1, code, True) for p, code in enumerate(p30.WEEK[4])]
    b.append(day_rows(st, 210, rows[:5]))
    b.append(R(0, 744, 390, 100, 0, c["paper"]) + p30.nav(st, 1))
    return st.page(390, 844, "".join(b))

def p_tag_teil(st):
    c = st.c
    b = [tag_head(st, "Donnerstag", "18. September"), frei_box(st, 18, 138, 354, "Sportfest · 5.–6. Stunde.", "Eingetragen von Ric.")]
    rows = [(p + 1, code, p >= 4) for p, code in enumerate(p30.WEEK[3]) if p >= 2]
    b.append(day_rows(st, 210, rows))
    b.append(R(0, 744, 390, 100, 0, c["paper"]) + p30.nav(st, 1))
    return st.page(390, 844, "".join(b))

# ════════════════ Formular «Frei» ════════════════
def num_chip(st, x, y, n, on, s=38):
    """Кнопка-номер урока: круглая, выбранная — tint и рамка 2 px (как выбор в форме 18)."""
    c = st.c
    if on: out = R(x, y, s, s, s / 2, c["tint"]) + R(x + 1, y + 1, s - 2, s - 2, s / 2 - 1, "none", c["accent"], 2)
    else: out = R(x + .5, y + .5, s - 1, s - 1, s / 2 - .5, "none", c["rule"])
    return out + T(x + s / 2, y + s / 2 + 4.5, str(n), 13, 800, c["accink"] if on else c["ink"], "middle")

def p_form(st, teil=True, fehler=False):
    c = st.c
    H = 844
    b = [st.rbtn(18, 33.31, BACK), eyebrow(66, 33, "Lehrkraft · Ric", c, True), title(66, 65, "Neuer Termin", c)]
    y = 105
    b.append(label(18, y, "Art", c))
    x = 18
    for k in ("Ausflug", "Elternabend", "Frei", "Sonstiges"):
        ch, w = m18.plain_chip(x, y + 12, k, c, on=k == "Frei")
        if x + w > 372: x, y = 18, y + 46; ch, w = m18.plain_chip(x, y + 12, k, c, on=k == "Frei")
        b.append(ch); x += w + 8
    y += 78
    b.append(label(18, y, "Unterricht", c))
    ch, w = m18.plain_chip(18, y + 12, "Ganzer Tag", c, on=not teil); b.append(ch)
    ch, _ = m18.plain_chip(18 + w + 8, y + 12, "Nur einzelne Stunden", c, on=teil); b.append(ch)
    y += 58
    if teil:
        picked = set() if fehler else {5, 6}
        for n in range(1, 9):
            b.append(num_chip(st, 18 + (n - 1) * 45, y + 4, n, n in picked))
        if fehler: b.append(T(18, y + 62, "Bitte mindestens eine Stunde wählen.", 12.5, 400, c["danger"]))
        y += 72 if fehler else 56
    y += 14
    b.append(label(18, y, "Für", c))
    ch, _ = m18.plain_chip(18, y + 12, "Ganze Klasse", c, on=True); b.append(ch)
    y += 72
    b.append(label(18, y, "Titel", c))
    b.append(m18.field(18, y + 10, 354, "Sportfest" if teil else "Pädagogischer Tag", c))
    y += 82
    b.append(label(18, y, "Von", c) + label(199, y, "Bis · optional", c))
    b.append(m18.field(18, y + 10, 173, "18.09.2026" if teil else "19.09.2026", c, icon=CAL))
    b.append(m18.field(199, y + 10, 173, "", c, placeholder=True, icon=CAL))
    b.append(T(18, y + 82, "Donnerstag · morgen" if teil else "Freitag · in 2 Tagen", 12, 400, c["faint"]))
    y += 112
    b.append(label(18, y, "Hinweis · optional", c))
    b.append(m18.field(18, y + 10, 354, "z. B. Sportzeug mitbringen", c, placeholder=True))
    b.append(st.button(18, H - 80, 354, "Speichern", "primary", CHECK))
    return st.page(390, H, "".join(b))

# ════════════════ Список экранов ════════════════
def soft(fn): return lambda th: fn(W.style("soft", th))

SCREENS = {
    "handy-01-frei-stunden": (soft(p_form), ("hell", "dunkel")),
    "handy-02-frei-ganzer-tag": (soft(lambda st: p_form(st, teil=False)), ("hell",)),
    "handy-03-keine-stunde": (soft(lambda st: p_form(st, fehler=True)), ("hell",)),
    "handy-04-woche": (soft(p_woche), ("hell", "dunkel")),
    "handy-05-tag-ganz": (soft(p_tag_ganz), ("hell", "dunkel")),
    "handy-06-tag-teil": (soft(p_tag_teil), ("hell",)),
}

if __name__ == "__main__":
    n = 0
    for name, (fn, themes) in SCREENS.items():
        for th in themes:
            open(os.path.join(OUT, f"{name}-{th}.svg"), "w", encoding="utf-8").write(fn(th))
            n += 1
    print(n, "files")
