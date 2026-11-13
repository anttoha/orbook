# Макеты части 28 «Sprachen»: карточка «Sprache» в Darstellung (Deutsch / English / Українська).
# Основа — часть 22 «Darstellung» (те же токены, segmented, карточки).
import importlib.util, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_s = importlib.util.spec_from_file_location("g22", os.path.join(HERE, "..", "22-kleinigkeiten", "gen.py"))
m22 = importlib.util.module_from_spec(_s); _s.loader.exec_module(m22)
g, T, R, label, segmented, page = m22.g, m22.T, m22.R, m22.label, m22.segmented, m22.page
LANGS = ["Deutsch", "English", "Українська"]
CHEV_D, CHECK, ICON, P = g.CHEV_D, g.CHECK, g.ICON, g.P
_n = [0]

def flag(cx, cy, r, code):
    """Runde Flagge (vereinfacht): de, en (Union Jack), uk."""
    _n[0] += 1; cid = f"fl{_n[0]}"; d = 2 * r; x, y = cx - r, cy - r
    if code == 0:
        body = (f'<rect x="{x}" y="{y}" width="{d}" height="{d / 3}" fill="#222"/><rect x="{x}" y="{y + d / 3}" width="{d}" height="{d / 3}" fill="#D8281F"/>'
                f'<rect x="{x}" y="{y + 2 * d / 3}" width="{d}" height="{d / 3}" fill="#F5C518"/>')
    elif code == 1:
        body = (f'<rect x="{x}" y="{y}" width="{d}" height="{d}" fill="#1F3A8A"/>'
                f'<path d="M{x} {y}L{x + d} {y + d}M{x + d} {y}L{x} {y + d}" stroke="#fff" stroke-width="{d * .2}"/>'
                f'<path d="M{x} {y}L{x + d} {y + d}M{x + d} {y}L{x} {y + d}" stroke="#D8281F" stroke-width="{d * .07}"/>'
                f'<path d="M{cx} {y}V{y + d}M{x} {cy}H{x + d}" stroke="#fff" stroke-width="{d * .34}"/>'
                f'<path d="M{cx} {y}V{y + d}M{x} {cy}H{x + d}" stroke="#D8281F" stroke-width="{d * .2}"/>')
    else:
        body = (f'<rect x="{x}" y="{y}" width="{d}" height="{d / 2}" fill="#2F6FD0"/><rect x="{x}" y="{cy}" width="{d}" height="{d / 2}" fill="#F5D000"/>')
    return (f'<clipPath id="{cid}"><circle cx="{cx}" cy="{cy}" r="{r}"/></clipPath><g clip-path="url(#{cid})">{body}</g>'
            f'<circle cx="{cx}" cy="{cy}" r="{r - .5}" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1"/>')

TITLE = {0: ("Sprache", "Gilt für die ganze App."), 1: ("Language", "Applies to the whole app."), 2: ("Мова", "Діє для всього застосунку.")}

def lang_row(x, y, w, c, sel, text, pw=164):
    """Karte mit einer Zeile: links Titel, rechts ein Auswahlfeld (Flagge · Name · ⌄)."""
    h = 70
    px, py, ph = x + w - 14 - pw, y + 17, 36
    out = [R(x, y, w, h, 22, c["card"]), T(x + 16, y + 31, text[0], 14.5, 400, c["ink"]), T(x + 16, y + 50, text[1], 12, 400, c["faint"]),
           R(px, py, pw, ph, 18, c["sand"]), R(px + .5, py + .5, pw - 1, ph - 1, 18, "none", c["hair"]),
           flag(px + 20, py + 18, 10, sel), T(px + 38, py + 23.5, LANGS[sel], 13.5, 700, c["ink"]),
           ICON(px + pw - 26, py + 9.5, 0.7, c["faint"], CHEV_D, 2.2)]
    return "".join(out), h, (px, py + ph + 6)

def lang_menu(x, y, c, sel, w=210, rh=48):
    """Aufgeklappte Liste direkt unter dem Feld (wie das Menü «Woche ⋮»): Flagge, Name, Haken bei der Auswahl."""
    h = rh * 3 + 10
    out = [R(x + w - 210 + 0, y, w, h, 22, c["card"], extra=' filter="url(#nsh0)"'), R(x + .5, y + .5, w - 1, h - 1, 22, "none", c["hair"])]
    for i, name in enumerate(LANGS):
        ry = y + 5 + i * rh
        if i == sel: out.append(R(x + 6, ry + 2, w - 12, rh - 4, 16, c["sand"]))
        out.append(flag(x + 30, ry + rh / 2, 11, i) + T(x + 52, ry + rh / 2 + 5, name, 14.5, 700 if i == sel else 500, c["ink"]))
        if i == sel: out.append(ICON(x + w - 36, ry + rh / 2 - 9, 0.75, c["accink"], CHECK, 2.4))
    return "".join(out)

def phone(sel, opened=False):
    def f(c, theme, sub):
        inner, w, h = g.base("24 Darstellung", theme)
        b = [inner, label(18, 620, TITLE[sel][0], c)]
        card, ch, (mx, my) = lang_row(18, 632, 354, c, sel, TITLE[sel]); b.append(card)
        b.append(label(18, 632 + ch + 26, "Plan", c))
        card2, ch2 = m22.stand_card(18, 632 + ch + 38, 354, c, 1); b.append(card2)
        if opened: b.append(lang_menu(mx + 164 - 210, my, c, sel))
        return page(w, max(h, 632 + ch + 38 + ch2 + 24), c, "".join(b))
    return f

def pc(sel, opened=False):
    def f(c, theme, sub):
        inner = m22.pc_base("24 Einstellungen · Darstellung", theme)
        b = [inner, R(250, 0, 306, 900, 0, c["paper"]), m22.pc_sidebar(inner, c, True)]
        b.append(R(270, 20, 330, 80, 0, c["paper"]) + g.eyebrow(284, 39, "9b · Meine Schule", c) + g.title(284, 80, "Mehr", c, 38))
        b.append(m22.pc_subnav(c, "Darstellung"))
        b.append(label(576, 692, TITLE[sel][0], c))
        card, ch, (mx, my) = lang_row(576, 704, 644, c, sel, TITLE[sel]); b.append(card)
        b.append(label(576, 704 + ch + 26, "Plan", c))
        card2, _ = m22.stand_card(576, 704 + ch + 38, 644, c, 1, True); b.append(card2)
        if opened: b.append(lang_menu(mx + 164 - 210, my, c, sel))
        return page(1440, 1050, c, "".join(b))
    return f

SCREENS = {"handy-01-sprache-zu": phone(0), "handy-02-sprache-offen": phone(0, True), "handy-03-sprache-uk": phone(2), "pc-01-sprache-offen": pc(1, True)}
if __name__ == "__main__":
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
