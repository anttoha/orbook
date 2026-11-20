# Макеты части 35 «Untere Leiste»:
#   • вкладка внизу может быть группой: нажал «Leistung» — над панелью всплывает меню (Tests, Noten);
#   • внутри группы вкладка показывает раздел, где ты сейчас («Tests»), с маленькой стрелкой вверх;
#   • Darstellung → «Untere Leiste»: что внизу, порядок, группы (перетаскивание); остальное — в «Mehr»;
#   • ПК: те же группы в боковом меню, раскрываются на месте.
# Кирпичики и оформление (St, nav, карточки) — из генератора части 30.
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g30", os.path.join(HERE, "..", "30-personalisierung", "gen.py"))
m = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(m)
g = m.g
T, S, R, ICON, P, HL, DOT = g.T, g.S, g.R, g.ICON, g.P, m.HL, m.DOT
St, eyebrow, title, label, dots_icon = m.St, m.eyebrow, m.title, m.label, m.dots_icon
HOME, WEEK_I, FLAG, LIST, FOLDER, BARS, CAL, FILE, LIST_CHECK = m.HOME, m.WEEK_I, m.FLAG, m.LIST, m.FOLDER, m.BARS, m.CAL, m.FILE, m.LIST_CHECK
CHECK, CHEV_R, BACK, CLOSE, PLUS, UNDO, MINUS, PEN = m.CHECK, m.CHEV_R, m.BACK, m.CLOSE, m.PLUS, m.UNDO, m.MINUS, g.PEN
g.LIGHT.setdefault("toastbg", "#2A2433"); g.LIGHT.setdefault("toastfg", "#FBF7F2")
g.DARK.setdefault("toastbg", "#F4F0F8"); g.DARK.setdefault("toastfg", "#16131C")

# Новые иконки (контур, как lucide): Leistung — медаль, Noten — листок с галочкой, Fehlzeiten — календарь с крестиком
AWARD = '<circle cx="12" cy="8.5" r="5.5"/>' + P("M15.2 13l1.3 8-4.5-2.6L7.5 21l1.3-8")
NOTEN = '<rect x="5" y="4" width="14" height="17" rx="2.5"/>' + P("M9 2.8h6v3H9zM9 13l2 2 4-4")
FEHLZ = '<rect x="3" y="5" width="18" height="16" rx="3"/>' + P("M8 3v4M16 3v4M3 10h18M10 13.5l4 4M14 13.5l-4 4")
LOCK = g.LOCK
CHEV_U = P("M6 15l6-6 6 6")
GRIP = "".join(f'<circle cx="{x}" cy="{y}" r="1.4" fill="currentColor"/>' for x in (9, 15) for y in (6, 12, 18))
# Иконки, которые можно выбрать для группы
GROUP_ICONS = [AWARD, '<circle cx="12" cy="12" r="9"/>' + P("M12 7v5l3 2"), FOLDER, BARS, P("M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"), g.BOOK]

SEC = {   # раздел: (иконка, имя)
    "start": (HOME, "Start"), "woche": (WEEK_I, "Woche"), "heute": (LIST, "Heute"), "tests": (FLAG, "Tests"), "noten": (NOTEN, "Noten"),
    "fehlzeiten": (FEHLZ, "Fehlzeiten"), "materialien": (FOLDER, "Materialien"), "statistik": (BARS, "Statistik"),
    "aufgaben": (LIST_CHECK, "Aufgaben"), "termine": (CAL, "Termine"), "leistung": (AWARD, "Leistung"), "mehr": (None, "Mehr"),
}

def grip(x, y, col): return f'<g transform="translate({x} {y}) scale(0.75)" color="{col}">{GRIP}</g>'
def ico(x, y, scale, col, icon, sw=2): return ICON(x, y, scale, col, icon, sw) if icon else dots_icon(x, y, scale, col)

# ════════════════ Нижняя панель с группой ════════════════
def bar(st, tabs, active, y=764, pressed=None, here=None):
    """tabs — список ключей SEC. active — индекс выбранной вкладки; here — имя раздела внутри группы («Tests»);
    pressed — индекс вкладки, у которой открыто меню группы."""
    c = st.c
    out = [st.card(16, y, 358, 58, 29 if st.style != "klar" else 14, lift=True)]
    if st.style == "soft": out.append(R(16.5, y + .5, 357, 57, 28.5, "none", c["hair"]))
    aw = 118
    ow = (358 - 14 - aw) / (len(tabs) - 1)
    x = 23
    for i, key in enumerate(tabs):
        ic, name = SEC[key]
        if here and i == active: ic, name = SEC[here]
        w = aw if i == active else ow
        if i == active:
            out.append(R(x, y + 7, w, 44, st.pill(44), c["accent"]))
            extra = 14 if here else 0
            tx = x + (w - (m.est(name, 13) * 1.15 + 26 + extra)) / 2
            out.append(ico(tx, y + 20, 0.75, c["on"], ic, 2.2) + T(tx + 25, y + 33.5, name, 13, 800, c["on"]))
            if here: out.append(ICON(tx + 25 + m.est(name, 13) * 1.15 + 3, y + 23.5, 0.46, c["on"], CHEV_U, 3))
        else:
            if i == pressed: out.append(R(x + 4, y + 7, w - 8, 44, 22, c["tint"]))
            col = c["accink"] if i == pressed else c["muted"]
            out.append(ico(x + w / 2 - 10, y + 19, 0.83, col, ic, 2))
        x += w
    return "".join(out)

def group_menu(st, x_center, items, y_bottom=752, w=212, current=None):
    """Меню группы над панелью: заголовок группы и разделы. items — [(ключ, число справа)]."""
    c = st.c
    rh = 50
    h = 40 + rh * len(items) + 8
    x = min(max(16, x_center - w / 2), 374 - w)
    y = y_bottom - h
    out = [R(x, y, w, h, 22, c["card"], extra=' filter="url(#nsh0)"'), R(x, y, w, h, 22, c["card"]), R(x + .5, y + .5, w - 1, h - 1, 21.5, "none", c["hair"])]
    out.append(T(x + 18, y + 27, "LEISTUNG", 10.5, 800, c["faint"], ls=0.6))
    for i, (key, n) in enumerate(items):
        ic, name = SEC[key]
        ry = y + 38 + i * rh
        on = key == current
        if on: out.append(R(x + 6, ry, w - 12, rh - 4, 16, c["tint"]))
        out.append(DOT(x + 30, ry + 23, 15, c["tint"] if not on else c["card"]) + ICON(x + 21, ry + 14, 0.75, c["accink"], ic, 2))
        out.append(T(x + 56, ry + 28, name, 14.5, 800 if on else 700, c["ink"]))
        if n: out.append(R(x + w - 44, ry + 13, 28, 20, 10, c["sand"]) + T(x + w - 30, ry + 27, n, 11.5, 800, c["muted"], "middle"))
    # «хвостик» к вкладке
    out.append(f'<path d="M{x_center - 8} {y + h - .5} L{x_center} {y + h + 7} L{x_center + 8} {y + h - .5} Z" fill="{c["card"]}"/>')
    return "".join(out)

TABS = ["start", "woche", "leistung", "mehr"]

def tab_center(tabs, i, active):
    aw = 118; ow = (358 - 14 - aw) / (len(tabs) - 1)
    x = 23
    for k in range(i): x += aw if k == active else ow
    return x + (aw if i == active else ow) / 2

# 01 · Start, нажали «Leistung» — меню группы
def p_menu(st):
    c = st.c
    s = m.p_start(st)
    inner = s[s.index("</defs>") + 7:s.rindex("</svg>")]
    inner = inner[:inner.rindex(f'<rect x="16" y="764"')] if st.style == "soft" else inner
    col, op = c["overlay"]
    b = [inner, f'<rect x="0" y="0" width="390" height="844" fill="{col}" fill-opacity="{op * 0.45}"/>']
    b.append(bar(st, TABS, 0, pressed=2))
    b.append(group_menu(st, tab_center(TABS, 2, 0), [("tests", "5"), ("noten", None)]))
    return st.page(390, 844, "".join(b))

# 02 · Tests открыт через группу: вкладка показывает «Tests» и стрелку вверх
def p_tests(st):
    inner, _, _ = g.base("13 Klausuren", st.theme)
    i = inner.find('<rect x="16" y="764"')
    inner = inner[:i] + "</g>" if i > 0 else inner
    return g.svg(390, 844, st.c, inner + bar(st, TABS, 2, here="tests"))

# ════════════════ Darstellung → Untere Leiste ════════════════
def row(st, x, y, w, key, first=False, indent=0, right=None, sub_text=None, dim=False, handle=True, lock=False):
    c = st.c
    ic, name = SEC[key]
    out = [] if first else [HL(x + 14 + indent, x + w - 14, y, c)]
    gx = x + 10 + indent
    if handle: out.append(grip(gx, y + 19, c["faint2"]))
    if lock: out.append(ICON(gx + 1, y + 20, 0.67, c["faint2"], LOCK, 2))
    tx = gx + 26
    out.append(DOT(tx + 16, y + 28, 16, c["tint"] if not dim else c["sand"]) + ico(tx + 7, y + 19, 0.75, c["accink"] if not dim else c["muted"], ic, 2))
    nx = tx + 42
    if sub_text:
        out.append(T(nx, y + 25, name, 14.5, 800, c["ink"]) + T(nx, y + 43, sub_text, 12, 400, c["faint"]))
    else:
        out.append(T(nx, y + 33.5, name, 14.5, 600, c["ink"]))
    if right == "minus":
        out.append(DOT(x + w - 30, y + 28, 12, c["dtint"]) + ICON(x + w - 37, y + 21, 0.58, c["danger"], MINUS, 2.8))
    elif right == "plus":
        out.append(R(x + w - 44, y + 14, 28, 28, st.pill(28), c["accent"]) + ICON(x + w - 38, y + 20, 0.67, c["on"], PLUS, 2.6))
    elif right == "plus-off":
        out.append(R(x + w - 44, y + 14, 28, 28, st.pill(28), c["sand"]) + ICON(x + w - 38, y + 20, 0.67, c["faint2"], PLUS, 2.6))
    elif right == "edit":
        out.append(R(x + w - 44, y + 14, 28, 28, 14, c["sand"]) + ICON(x + w - 37.5, y + 20.5, 0.62, c["ink"], PEN, 2.2))
    return "".join(out)

UNTEN = [("start", 0), ("woche", 0), ("leistung", 0), ("tests", 1), ("noten", 1), ("mehr", 0)]
REST = ["heute", "fehlzeiten", "materialien", "statistik", "aufgaben", "termine"]

def leiste_list(st, x, y, w, unten=UNTEN, rest=REST, full=False, ghost_after=None, used="4 von 5", head="Unten"):
    """Список «Unten» и список «In „Mehr“». ghost_after — после какого раздела пунктир (куда встанет перетаскиваемый)."""
    c = st.c
    rh = 56
    out = [label(x, y, head, c), T(x + w, y, used, 12.5, 800, c["faint"], "end")]
    y += 12
    n = len(unten) + (1 if ghost_after else 0)
    out.append(st.card(x, y, w, rh * n))
    ry = y
    for i, (key, lvl) in enumerate(unten):
        if key == "leistung":
            out.append(row(st, x, ry, w, key, i == 0, right="edit", sub_text="Gruppe · Tests, Noten"))
        elif key == "mehr":
            out.append(row(st, x, ry, w, key, i == 0, handle=False, lock=True))
        else:
            out.append(row(st, x, ry, w, key, i == 0, indent=26 * lvl, right="minus"))
        ry += rh
        if ghost_after == key:
            out.append(R(x + 36, ry + 6, w - 50, rh - 12, 14, c["tint"], c["accent"], 2, ' stroke-dasharray="6 5"')); ry += rh
    y = ry + 14
    out.append(st.button(x, y, w, "Gruppe hinzufügen", "sand", PLUS, h=46)); y += 46 + 30
    out.append(label(x, y, "In „Mehr“", c)); y += 12
    out.append(st.card(x, y, w, rh * len(rest)))
    for i, key in enumerate(rest):
        out.append(row(st, x, y + i * rh, w, key, i == 0, right="plus-off" if full else "plus"))
    y += rh * len(rest)
    return "".join(out), y

def preview(st, x, y, w, tabs=TABS):
    """Превью панели — та же панель в серой карточке."""
    c = st.c
    out = R(x, y, w, 88, st.rc, c["sand"])
    s = bar(st, tabs, 0, y=0)
    k = (w - 24) / 358   # панель чуть меньше, чтобы поместилась в карточку
    return out + f'<g transform="translate({x + 12 - 16 * k} {y + (88 - 58 * k) / 2}) scale({k:.4f})">{s}</g>'

def head_leiste(st):
    c = st.c
    return st.rbtn(18, 33.31, BACK) + eyebrow(66, 33, "Darstellung", c) + title(66, 65, "Untere Leiste", c)

# 03 · Untere Leiste
def p_leiste(st):
    c = st.c
    x, w = 18, 354
    b = [head_leiste(st), preview(st, x, 96, w)]
    body, y = leiste_list(st, x, 216, w); b.append(body)
    y += 18
    b.append(st.button(x, y, w, "Zurücksetzen", "sand", UNDO)); y += 48 + 28
    return st.page(390, y, "".join(b))

# 04 · Перетаскиваем «Statistik» в группу «Leistung»
def p_ziehen(st):
    c = st.c
    x, w = 18, 354
    b = [head_leiste(st), preview(st, x, 96, w)]
    body, y = leiste_list(st, x, 216, w, rest=[r for r in REST if r != "statistik"], ghost_after="noten"); b.append(body)
    lift = (R(0, 0, w, 56, st.rc, c["card"], extra=' filter="url(#nsh0)"') + R(0, 0, w, 56, st.rc, c["card"])
            + row(st, 0, 0, w, "statistik", True, right=None) + R(1, 1, w - 2, 54, st.rc - 1, "none", c["accent"], 2))
    b.append(f'<g transform="translate(40 548) rotate(-2.5 177 28)">{lift}</g>')
    return st.page(390, 844, "".join(b))

# 05 · Шторка группы: имя, значок, что внутри, убрать группу
def p_gruppe(st):
    c = st.c
    under = p_leiste(st)
    inner = under[under.index("</defs>") + 7:under.rindex("</svg>")]
    top = 250
    b = [inner, m.sheet(st, top, "Gruppe", "Leistung", H=844)]
    x, w, y = 18, 354, top + 100
    b.append(label(x, y, "Name", c) + R(x, y + 12, w, 50, 16, c["field"], c["rule"]) + T(x + 16, y + 43, "Leistung", 15.5, 600, c["ink"]))
    y += 12 + 50 + 28
    b.append(label(x, y, "Symbol", c)); y += 12
    sz = 46; gap = (w - sz * len(GROUP_ICONS)) / (len(GROUP_ICONS) - 1)
    for i, ic in enumerate(GROUP_ICONS):
        bx = x + i * (sz + gap)
        on = i == 0
        b.append(R(bx, y, sz, sz, 16, c["tint"] if on else c["card"]) + R(bx + 1, y + 1, sz - 2, sz - 2, 15, "none", c["accent"] if on else c["rule"], 2 if on else 1)
                 + ICON(bx + 12, y + 12, 0.92, c["accink"] if on else c["muted"], ic, 2))
    y += sz + 28
    b.append(label(x, y, "Drin", c)); y += 12
    b.append(st.card(x, y, w, 112) + row(st, x, y, w, "tests", True, right="minus") + row(st, x, y + 56, w, "noten", right="minus"))
    y += 112 + 16
    b.append(st.button(x, y, w, "Gruppe auflösen", "danger", None, h=46))
    return st.page(390, 844, "".join(b))

# 06 · Darstellung: новая строка «Untere Leiste» в «Anpassen» (страница — как в части 30)
def p_darstellung(st):
    c = st.c
    x, w = 18, 354
    b = [st.rbtn(18, 33.31, BACK), eyebrow(66, 33, "Mehr", c), title(66, 65, "Darstellung", c)]
    b.append(label(x, 106, "Thema", c))
    tw = (w - 16) / 3
    for i in range(3): b.append(m.theme_tile(st, x + i * (tw + 8), 120, tw, i, i == (0 if st.light else 1)))
    y = 240
    b.append(label(x, y, "Design", c)); y += 14
    for i, sname in enumerate(["soft", "glas", "klar"]): b.append(m.design_tile(st, x + i * (tw + 8), y, tw, sname, sname == st.style))
    y += 118 + 58
    b.append(label(x, y, "Akzentfarbe", c)); y += 12
    b.append(m.accent_row(st, x, y, w)); y += 64 + 30
    b.append(label(x, y, "Anpassen", c)); y += 12
    b.append(st.card(x, y, w, 174) + m.link_row(st, x, y, w, m.GRID, "Start", "6 Blöcke", True) + m.link_row(st, x, y + 58, w, WEEK_I, "Stundenplan", "Raum · Uhrzeit")
             + m.link_row(st, x, y + 116, w, AWARD, "Untere Leiste", "4 Plätze"))
    y += 174 + 30
    b.append(label(x, y, "Ansicht", c)); y += 12
    b.append(st.card(x, y, w, 58 * 2))
    b.append(m.set_row(st, x, y, w, "Startansicht", st.seg(x + w - 14 - 196, y + 11, 196, ["Start", "Woche", "Heute"], 0), True))
    b.append(m.set_row(st, x, y + 58, w, "Animationen", st.seg(x + w - 14 - 196, y + 69, 196, ["Voll", "Weniger", "Aus"], 0)))
    y += 116 + 18
    b.append(st.button(x, y, w, "Darstellung zurücksetzen", "sand", UNDO)); y += 48 + 28
    return st.page(390, y, "".join(b))

# 07 · Внизу уже 5 мест: плюсы в «Mehr» серые, тост
def p_voll(st):
    c = st.c
    x, w = 18, 354
    unten = [("start", 0), ("woche", 0), ("heute", 0), ("leistung", 0), ("tests", 1), ("noten", 1), ("mehr", 0)]
    tabs = ["start", "woche", "heute", "leistung", "mehr"]
    b = [head_leiste(st), preview(st, x, 96, w, tabs)]
    body, y = leiste_list(st, x, 216, w, unten=unten, rest=[r for r in REST if r != "heute"], full=True, used="5 von 5"); b.append(body)
    b.append(R(18, 770, 354, 46, 16, c["toastbg"]) + ICON(32, 785, 0.67, c["toastfg"], g.P("M12 8v5M12 16.5v.01") + '<circle cx="12" cy="12" r="9"/>')
             + T(58, 798, "Unten ist voll – zieh es in eine Gruppe", 13.5, 600, c["toastfg"]))
    return st.page(390, 844, "".join(b))

# ════════════════ ПК: группа в боковом меню ════════════════
def pc_side_groups(st, open_=True, active="Tests"):
    """Боковое меню как в части 30, но «Tests» и «Noten» — внутри группы «Leistung»."""
    c = st.c
    s = m.pc_side(st, active="—")
    # убираем старые пункты меню (они нарисованы между поиском и «Bald») и рисуем свои
    a = s.index('>Suchen<'); a = s.index('</text>', s.index('>⌘K<')) + 7
    z = s.index('>Bald<'); z = s.rfind('<text', 0, z)
    out = [s[:a]]
    items = [("start", 0), ("woche", 0), ("heute", 0), ("leistung", 0)] + ([("tests", 1), ("noten", 1)] if open_ else []) + [("materialien", 0)]
    by = 146
    for key, lvl in items:
        ic, name = SEC[key]
        on = name == active
        ix = 42 + 22 * lvl
        if on: out.append(R(30 + 22 * lvl, by, 204 - 22 * lvl, 42, st.pill(42), c["accent"]))
        col = c["on"] if on else c["muted"]
        out.append(ICON(ix, by + 11.5, 0.79, col, ic, 2) + T(ix + 31, by + 26, name, 14.5, 800 if on else 700, col))
        if key == "leistung": out.append(ICON(212, by + 13, 0.67, c["faint"], CHEV_U if open_ else m.CHEV_D, 2.2))
        if key == "tests": out.append(R(200, by + 11, 22, 20, 10, c["tint"] if on else c["sand"]) + T(211, by + 25, "5", 11, 700, c["accink"] if on else c["muted"], "middle"))
        if lvl == 0 and key == "leistung" and open_:
            out.append(f'<line x1="53" y1="{by + 44}" x2="53" y2="{by + 44 + 92}" stroke="{c["rule"]}" stroke-width="1.5" stroke-linecap="round"/>')
        by += 46
    # «Bald» сдвигаем вниз под удлинившееся меню; низ сайдбара (Mehr, статус, тема) остаётся на месте
    mehr = s.index('<g transform="translate(44 754)')
    shift = by + 30 - 417
    out.append(f'<g transform="translate(0 {shift})">{s[z:mehr]}</g>' + s[mehr:])
    return "".join(out), shift

def pc_tests(st):
    c = st.c
    side, _ = pc_side_groups(st)
    inner, _, _ = g.base("14 Klausuren", st.theme, "PC")
    # основная часть оригинала (справа от сайдбара) — сдвигаем ничего, просто кладём поверх сайдбар
    return g.svg(1440, 900, c, inner + R(0, 0, 264, 900, 0, c["paper"]) + side)

def pc_leiste(st):
    c = st.c
    side, _ = pc_side_groups(st, active="—")
    b = [side, R(30, 741, 204, 42, st.pill(42), c["accent"]), R(30, 741, 204, 42, st.pill(42), c["accent"]), dots_icon(44, 754, 0.83, c["on"]), T(73, 767, "Mehr", 14.5, 800, c["on"])]
    b.append(eyebrow(284, 39, "Mehr · Darstellung", c) + title(284, 80, "Seitenleiste", c, 38))
    X = 284
    # на ПК свой набор (места больше), переключатель — чтобы поправить и телефон
    b.append(st.seg(X, 104, 240, ["Computer", "Handy"], 0))
    pc_unten = [("start", 0), ("woche", 0), ("heute", 0), ("leistung", 0), ("tests", 1), ("noten", 1), ("materialien", 0), ("mehr", 0)]
    body, y = leiste_list(st, X, 172, 520, unten=pc_unten, rest=["fehlzeiten", "statistik", "aufgaben", "termine"], used="", head="Im Menü")
    b.append(body)
    return st.page(1440, max(900, y + 40), "".join(b))

SCREENS = {   # имя: (функция, темы)
    "handy-01-gruppe-offen": (p_menu, ("hell", "dunkel")),
    "handy-02-in-der-gruppe": (p_tests, ("hell", "dunkel")),
    "handy-03-untere-leiste": (p_leiste, ("hell", "dunkel")),
    "handy-04-ziehen": (p_ziehen, ("hell",)),
    "handy-05-gruppe-bearbeiten": (p_gruppe, ("hell", "dunkel")),
    "handy-06-darstellung": (p_darstellung, ("hell",)),
    "handy-07-voll": (p_voll, ("hell",)),
    "pc-01-seitenleiste": (pc_tests, ("hell", "dunkel")),
    "pc-02-einstellen": (pc_leiste, ("hell",)),
}

if __name__ == "__main__":
    n = 0
    for name, (fn, themes) in SCREENS.items():
        for theme in themes:
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(St("soft", theme)))
            n += 1
    print(n, "files")
