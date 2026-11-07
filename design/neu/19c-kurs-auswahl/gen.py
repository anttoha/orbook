# Макеты «Kurs wählen» (19c): поле + список с поиском вместо стены чипов. Помощники — из 19b (токены Soft).
# Основа: Soft 51 «Suche ⌘K» (строки с кружком предмета), 16 «Klausur eintragen» (форма), 19b «Stunde bearbeiten».
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g19b", os.path.join(HERE, "..", "19b-muster-editor", "gen.py"))
m = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(m)
g = m.g
T, S, R, ICON, P, label, eyebrow, title, button, round_btn = g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn
CHECK, CHEV_D, CLOSE, PLUS, TRASH, SEARCH = g.CHECK, g.CHEV_D, g.CLOSE, g.PLUS, g.TRASH, g.SEARCH
page, sheet_bg, overlay = m.page, m.sheet_bg, g.overlay

# (код для цвета, кружок, назва, вчитель, курс) — як у справжньому класі 8a (fixtures), назви без дублів-загадок
COURSES = [("Ku", "AG", "AG Tanz", "T02", "301"), ("Bio", "Bi", "Biologie", "T17", "134"), ("Ph", "Ch", "Chemie", "T19", "135"),
           ("De", "De", "Deutsch", "T25", "132"), ("En", "En", "Englisch", "T25", "133"), ("Ma", "Et", "Ethik", "T01", "140"),
           ("De", "Fr", "Französisch", "T13", "145"), ("De", "Fr", "Französisch", "T13", "167"), ("Ge", "Ge", "Geschichte", "T18", "138"),
           ("Ph", "Gg", "Geografie", "T22", "137"), ("Ku", "Ku", "Kunst", "T09", "143"), ("Ma", "Ma", "Mathe", "T03", "131"),
           ("Sp", "SpJu", "Sport · SpJu", "T18", "141"), ("Sp", "SpMä", "Sport · SpMä", "T02", "142")]
SUGGEST = [("Ma", "Ma", "Mathe", "T03", "131")]

def circle(x, y, color, code, sub, r=16):
    solid, tint, text = sub[color]
    size = 11 if len(code) <= 2 else 9
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{tint}"/>' + T(x, y + size * 0.36, code, size, 900, text, "middle")

def row(x, y, w, item, c, sub, sel=False, active=False, h=54):
    color, code, name, who, nr = item
    out = []
    if active: out.append(R(x, y, w, h, 14, c["tint"]))
    out.append(circle(x + 26, y + h / 2, color, code, sub))
    out.append(T(x + 52, y + 23, name, 14.5, 800, c["ink"]) + T(x + 52, y + 41, f"{who} · Kurs {nr}", 12, 400, c["faint"]))
    if sel: out.append(ICON(x + w - 34, y + h / 2 - 9, 0.75, c["accink"], CHECK, 2.4))
    return "".join(out)

def picker_field(x, y, w, c, sub, item=None, open_=False, h=56, fill="card"):
    out = [R(x, y, w, h, 16, c[fill])]
    if open_: out.append(R(x + 1, y + 1, w - 2, h - 2, 15, "none", c["accent"], 2))
    if item:
        color, code, name, who, nr = item
        out.append(circle(x + 28, y + h / 2, color, code, sub) + T(x + 54, y + 25, name, 15, 800, c["ink"]) + T(x + 54, y + 43, f"{who} · Kurs {nr}", 12, 400, c["faint"]))
    else:
        out.append(T(x + 16, y + h / 2 + 5.5, "Kurs wählen", 16, 400, c["faint2"]))
    out.append(ICON(x + w - 34, y + h / 2 - 9, 0.75, c["faint"], CHEV_D, 2.2))
    return "".join(out)

def search_box(x, y, w, text, c, fill="card", h=46):
    out = R(x, y, w, h, 23, c[fill]) + ICON(x + 14, y + h / 2 - 9, 0.75, c["faint"], SEARCH)
    if text: out += T(x + 42, y + h / 2 + 5.5, text, 15, 400, c["ink"]) + R(x + 42 + g.tw(text, 15, 400) * 0.9 + 3, y + 13, 1.5, h - 26, 0, c["accent"])
    else: out += T(x + 42, y + h / 2 + 5.5, "Fach, Kürzel oder Lehrer", 15, 400, c["faint2"])
    return out

def course_list(x, y, w, c, sub, query=None, sel_nr="131", active_i=0, max_h=900):
    out, i = [], 0
    if query:
        hits = [it for it in COURSES if query.lower() in it[2].lower()]
        out.append(T(x + 8, y + 14, f"{len(hits)} Kurse", 12, 800, c["faint"])); y += 26
        for it in hits:
            out.append(row(x, y, w, it, c, sub, it[4] == sel_nr, i == active_i)); y += 56; i += 1
        return "".join(out), y
    out.append(T(x + 8, y + 14, "Vorschlag · stand hier im Plan", 12, 800, c["faint"])); y += 24
    for it in SUGGEST:
        out.append(row(x, y, w, it, c, sub, it[4] == sel_nr, i == active_i)); y += 56; i += 1
    out.append(T(x + 8, y + 18, "Alle Kurse", 12, 800, c["faint"])); y += 28
    for it in COURSES:
        if y + 56 > max_h: break
        out.append(row(x, y, w, it, c, sub, it[4] == sel_nr, False)); y += 56
    return "".join(out), y

# ════════ Telefon ════════
def lesson_sheet(c, sub, top=300, item=SUGGEST[0]):
    b = [sheet_bg(c, top, 390, 844)]
    b.append(eyebrow(18, top + 42, "Woche A · Montag · 2. Stunde", c, accent=True) + title(18, top + 74, "Stunde bearbeiten", c, 26) + round_btn(334, top + 32, c, CLOSE, size=38))
    b.append(label(18, top + 110, "Kurs", c) + picker_field(18, top + 122, 354, c, sub, item))
    y = top + 122 + 56 + 24
    b.append(label(18, y, "Lehrer", c) + label(199, y, "Raum", c) + m.field_box(18, y + 12, 173, "T03", c) + m.field_box(199, y + 12, 173, "305", c))
    y += 12 + 48 + 26
    b.append(ICON(18, y - 12, 0.67, c["accink"], PLUS, 2.2) + T(40, y + 1, "Parallelkurs in dieser Stunde", 13.5, 700, c["accink"]))
    b.append(T(18, y + 26, "Automatisch war: Mathe · T03 · Raum 204", 12, 400, c["faint"]))
    b.append(button(18, y + 46, 128, "Leeren", c, "danger", TRASH) + button(154, y + 46, 218, "Übernehmen", c, icon=CHECK))
    return "".join(b)

def base_admin(c, theme, sub):
    inner = m.p_admin(c, theme, sub, sel=(0, 1))
    return inner[inner.index("</defs>") + 7: inner.rindex("</svg>")]

def p_feld(c, theme, sub):
    return page(390, 844, c, base_admin(c, theme, sub) + lesson_sheet(c, sub))

def picker_sheet(c, sub, query=None, top=96):
    b = [sheet_bg(c, top, 390, 844)]
    b.append(eyebrow(18, top + 42, "Montag · 2. Stunde", c, accent=True) + title(18, top + 74, "Kurs wählen", c, 26) + round_btn(334, top + 32, c, CLOSE, size=38))
    b.append(search_box(18, top + 94, 354, query, c))
    lst, _ = course_list(18, top + 156, 354, c, sub, query, max_h=844)
    b.append(lst)
    return "".join(b)

def p_liste(c, theme, sub):
    return page(390, 844, c, base_admin(c, theme, sub) + picker_sheet(c, sub))

def p_suche(c, theme, sub):
    return page(390, 844, c, base_admin(c, theme, sub) + picker_sheet(c, sub, "fran"))

def p_klausur(c, theme, sub):
    """16 «Klausur eintragen»: «Fach» — то же поле; список — сначала «Deine Fächer», потом все."""
    inner, w, h = g.base("16 Klausur eintragen (Editor)", theme)
    b = [inner, R(0, 150, 390, 130, 0, c["paper"])]
    b.append(label(18, 172, "Fach", c) + picker_field(18, 184, 354, c, sub, ("Ma", "Ma", "Mathe", "T03", "131")).replace("T03 · Kurs 131", "dein Kurs · T03"))
    b.append(T(18, 262, "Antippen: Liste mit Suche — deine Fächer zuerst.", 12, 400, c["faint"]))
    return page(w, h, c, "".join(b))

# ════════ Computer ════════
def pc_popover(c, sub, query=None):
    x, y, w, h = 1004, 470, 384, 410
    out = [R(x, y, w, h, 22, c["card"], extra=' filter="url(#nsh0)"'), R(x, y, w, h, 22, c["card"], c["hair"])]
    out.append(search_box(x + 12, y + 12, w - 24, query, c, fill="paper", h=42))
    out.append(f'<clipPath id="pl"><rect x="{x}" y="{y + 62}" width="{w}" height="{h - 108}"/></clipPath>')
    lst, _ = course_list(x + 6, y + 64, w - 12, c, sub, query, max_h=y + h - 46)
    out.append(f'<g clip-path="url(#pl)">{lst}</g>')
    fy = y + h - 34
    out.append(f'<line x1="{x}" y1="{fy - 12}" x2="{x + w}" y2="{fy - 12}" stroke="{c["hair"]}" stroke-width="1"/>')
    for i, (k, t) in enumerate((("↑↓", "wählen"), ("↵", "übernehmen"), ("Esc", "schließen"))):
        kx = x + 16 + i * 126
        out.append(R(kx, fy, 30, 20, 6, c["paper"], c["rule"]) + T(kx + 15, fy + 14, k, 10.5, 700, c["muted"], "middle") + T(kx + 38, fy + 14, t, 12, 400, c["faint"]))
    return "".join(out)

def pc_base(c, theme, sub):
    inner = m.pc_admin(c, theme, sub)
    inner = inner[inner.index("</defs>") + 7: inner.rindex("</svg>")]
    # Панель справа: вместо чипов — поле «Kurs»
    x, y = 984, 282
    patch = R(x + 1, y + 92, 418, 200, 0, c["card"]) + label(x + 20, y + 102, "Kurs", c) + picker_field(x + 20, y + 114, 380, c, sub, SUGGEST[0], fill="paper")
    patch += R(x + 1, y + 186, 418, 130, 0, c["card"])
    patch += label(x + 20, y + 204, "Lehrer", c) + label(x + 214, y + 204, "Raum", c)
    patch += R(x + 20, y + 216, 186, 48, 16, c["paper"]) + T(x + 36, y + 245.5, "T03", 16, 400, c["ink"]) + R(x + 214, y + 216, 186, 48, 16, c["paper"]) + T(x + 230, y + 245.5, "305", 16, 400, c["ink"])
    patch += R(x + 1, y + 268, 418, 60, 0, c["card"]) + ICON(x + 20, y + 280, 0.67, c["accink"], PLUS, 2.2) + T(x + 42, y + 293, "Parallelkurs in dieser Stunde", 13.5, 700, c["accink"])
    patch += T(x + 20, y + 320, "Automatisch war: Mathe · T03 · Raum 204", 12, 400, c["faint"])
    return inner + patch

def pc_offen(c, theme, sub):
    b = pc_base(c, theme, sub).replace(picker_field(1004, 396, 380, c, sub, SUGGEST[0], fill="paper"), picker_field(1004, 396, 380, c, sub, SUGGEST[0], open_=True, fill="paper"))
    return page(1440, 900, c, b + pc_popover(c, sub))

def pc_suche(c, theme, sub):
    return page(1440, 900, c, pc_base(c, theme, sub) + pc_popover(c, sub, "fran"))

SCREENS = {"handy-01-feld": p_feld, "handy-02-liste": p_liste, "handy-03-suche": p_suche, "handy-04-klausur": p_klausur,
           "pc-01-offen": pc_offen, "pc-02-suche": pc_suche}
if __name__ == "__main__":
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
    print("ok")
