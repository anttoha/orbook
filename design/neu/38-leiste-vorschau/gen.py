# Макеты части 38 «Untere Leiste: живое превью вместо дубля»:
#   • телефон: серого превью сверху больше нет — настоящая нижняя панель и есть превью;
#     после правки изменённая вкладка коротко подсвечивается; нажатие на группу открывает её меню, как везде;
#   • ПК, «Handy»: справа от списка — телефон (sticky) с панелью; «Computer»: превью — само боковое меню.
# Кирпичики (bar, group_menu, leiste_list, боковое меню) — из генератора части 35.
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g35", os.path.join(HERE, "..", "35-untere-leiste", "gen.py"))
n = importlib.util.module_from_spec(_spec); sys.argv = sys.argv[:1] + [HERE]; _spec.loader.exec_module(n)
m, g = n.m, n.g
T, R, ICON, St, label, eyebrow, title = n.T, n.R, n.ICON, n.St, n.label, n.eyebrow, n.title
SEC, UNTEN, REST, TABS = n.SEC, n.UNTEN, n.REST, n.TABS

def flash(st, tabs, i, active, y=764):
    """Подсветка вкладки сразу после правки: кольцо акцента и мягкое свечение (держится ~1 с, потом гаснет)."""
    c = st.c
    aw = 118; ow = (358 - 14 - aw) / (len(tabs) - 1)
    x = 23 + sum(aw if k == active else ow for k in range(i))
    w = aw if i == active else ow
    return (R(x + 1, y + 4, w - 2, 50, 25, c["accent"], extra=' fill-opacity="0.12"')
            + R(x + 4, y + 7, w - 8, 44, 22, "none", c["accent"], 2))

def phone_page(st, tabs=TABS, unten=UNTEN, rest=REST, used="4 von 5", full=False, changed=None):
    """Страница «Untere Leiste» без превью сверху; внизу — настоящая панель (выбрана «Mehr», мы в Mehr → Darstellung)."""
    x, w = 18, 354
    b = [n.head_leiste(st)]
    body, _ = n.leiste_list(st, x, 108, w, unten=unten, rest=rest, used=used, full=full); b.append(body)
    active = len(tabs) - 1
    b.append(n.bar(st, tabs, active, pressed=changed))
    if changed is not None: b.append(flash(st, tabs, changed, active))
    return b

# 01 · Обычное состояние
def p_live(st):
    return st.page(390, 844, "".join(phone_page(st)))

# 02 · Нажали «+» у Statistik: вкладка сразу появилась внизу и коротко подсвечена; места кончились — плюсы серые
def p_changed(st):
    unten = [("start", 0), ("woche", 0), ("leistung", 0), ("tests", 1), ("noten", 1), ("statistik", 0), ("mehr", 0)]
    tabs = ["start", "woche", "leistung", "statistik", "mehr"]
    return st.page(390, 844, "".join(phone_page(st, tabs, unten, [r for r in REST if r != "statistik"], "5 von 5", True, changed=3)))

# 03 · Нажали на группу в настоящей панели — её меню, как на любом экране
def p_gruppe(st):
    c = st.c
    b = phone_page(st)
    bar = b.pop()
    col, op = c["overlay"]
    b.append(f'<rect x="0" y="0" width="390" height="844" fill="{col}" fill-opacity="{op * 0.45}"/>')
    b.append(n.bar(st, TABS, 3, pressed=2))
    b.append(n.group_menu(st, n.tab_center(TABS, 2, 3), [("tests", "5"), ("noten", None)]))
    return st.page(390, 844, "".join(b))

# ════════════════ ПК ════════════════
def side(st, items, active="—", changed=None):
    """Боковое меню части 35, но с любым набором пунктов; changed — пункт, который только что добавили (подсветка)."""
    c = st.c
    s = m.pc_side(st, active="—")
    a = s.index('</text>', s.index('>⌘K<')) + 7
    z = s.index('>Bald<'); z = s.rfind('<text', 0, z)
    out = [s[:a]]
    by = 146
    for key, lvl in items:
        ic, name = SEC[key]
        ix = 42 + 22 * lvl
        if key == changed:
            out.append(R(28, by - 2, 208, 46, 23, c["accent"], extra=' fill-opacity="0.12"') + R(31, by + 1, 202, 40, 20, "none", c["accent"], 2))
        col = c["muted"] if key != changed else c["accink"]
        out.append(ICON(ix, by + 11.5, 0.79, col, ic, 2) + T(ix + 31, by + 26, name, 14.5, 700 if key != changed else 800, col if key != changed else c["ink"]))
        if key == "leistung": out.append(ICON(212, by + 13, 0.67, c["faint"], n.CHEV_U, 2.2))
        if key == "tests": out.append(R(200, by + 11, 22, 20, 10, c["sand"]) + T(211, by + 25, "5", 11, 700, c["muted"], "middle"))
        if key == "leistung":
            out.append(f'<line x1="53" y1="{by + 44}" x2="53" y2="{by + 44 + 92}" stroke="{c["rule"]}" stroke-width="1.5" stroke-linecap="round"/>')
        by += 46
    mehr = s.index('<g transform="translate(44 754)')
    out.append(f'<g transform="translate(0 {by + 30 - 417})">{s[z:mehr]}</g>' + s[mehr:])
    out.append(R(30, 741, 204, 42, st.pill(42), c["accent"]) + n.dots_icon(44, 754, 0.83, c["on"]) + T(73, 767, "Mehr", 14.5, 800, c["on"]))
    return "".join(out)

PC_ITEMS = [("start", 0), ("woche", 0), ("heute", 0), ("leistung", 0), ("tests", 1), ("noten", 1), ("materialien", 0)]

def phone_frame(st, x, y, w):
    """Телефон справа (sticky): экран Start с текущей нижней панелью, в масштабе."""
    c = st.c
    k = w / 390
    s = m.p_start(st)
    inner = s[s.index("</defs>") + 7:s.rindex("</svg>")]
    inner = inner[:inner.rindex('<rect x="16" y="764"')]
    defs = s[s.index("<defs>") + 6:s.index("</defs>")]
    h = 844 * k
    return (f'<defs>{defs}<clipPath id="pf"><rect x="0" y="0" width="390" height="844" rx="44"/></clipPath></defs>'
            + R(x - 8, y - 8, w + 16, h + 16, 50 * k + 8, c["card"], extra=' filter="url(#nsh0)"')
            + R(x - 8, y - 8, w + 16, h + 16, 50 * k + 8, c["sand"]) + R(x - 7.5, y - 7.5, w + 15, h + 15, 50 * k + 7.5, "none", c["rule"])
            + f'<g transform="translate({x} {y}) scale({k:.4f})"><g clip-path="url(#pf)"><rect width="390" height="844" fill="{c["paper"]}"/>{inner}'
            + n.bar(st, TABS, 0) + '</g></g>')

def pc_head(st, t, seg):
    c = st.c
    return eyebrow(284, 39, "Mehr · Darstellung", c) + title(284, 80, t, c, 38) + st.seg(284, 104, 240, ["Computer", "Handy"], seg)

# pc-01 · «Handy»: список слева, телефон справа
def pc_handy(st):
    b = [side(st, PC_ITEMS), pc_head(st, "Untere Leiste", 1)]
    body, y = n.leiste_list(st, 284, 172, 520); b.append(body)
    b.append(phone_frame(st, 868, 160, 300))
    return st.page(1440, max(900, y + 40), "".join(b))

# pc-02 · «Computer»: превью — само боковое меню; только что добавленная «Statistik» подсвечена
def pc_computer(st):
    items = PC_ITEMS + [("statistik", 0)]
    b = [side(st, items, changed="statistik"), pc_head(st, "Seitenleiste", 0)]
    unten = [(k, l) for k, l in items] + [("mehr", 0)]
    body, y = n.leiste_list(st, 284, 172, 520, unten=unten, rest=["fehlzeiten", "aufgaben", "termine"], used="", head="Im Menü"); b.append(body)
    return st.page(1440, max(900, y + 40), "".join(b))

SCREENS = {
    "handy-01-live": (p_live, ("hell", "dunkel")),
    "handy-02-geaendert": (p_changed, ("hell", "dunkel")),
    "handy-03-gruppe": (p_gruppe, ("hell",)),
    "pc-01-handy": (pc_handy, ("hell", "dunkel")),
    "pc-02-computer": (pc_computer, ("hell",)),
}

if __name__ == "__main__":
    k = 0
    for name, (fn, themes) in SCREENS.items():
        for theme in themes:
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(St("soft", theme)))
            k += 1
    print(k, "files")
