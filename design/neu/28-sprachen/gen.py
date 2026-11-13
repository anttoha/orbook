# Макеты части 28 «Sprachen»: карточка «Sprache» в Darstellung (Deutsch / English / Українська).
# Основа — часть 22 «Darstellung» (те же токены, segmented, карточки).
import importlib.util, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_s = importlib.util.spec_from_file_location("g22", os.path.join(HERE, "..", "22-kleinigkeiten", "gen.py"))
m22 = importlib.util.module_from_spec(_s); _s.loader.exec_module(m22)
g, T, R, label, segmented, page = m22.g, m22.T, m22.R, m22.label, m22.segmented, m22.page
LANGS = ["Deutsch", "English", "Українська"]

def lang_card(x, y, w, c, sel, texts, wide=False):
    """Karte «Sprache»: ein Schalter mit drei Sprachen; Namen bleiben immer in der eigenen Sprache."""
    title, hint = texts
    h = 92 if wide else 118
    out = [R(x, y, w, h, 22, c["card"]), T(x + 14, y + 30, title, 14.5, 400, c["ink"]), T(x + 14, y + 49, hint, 12, 400, c["faint"])]
    if wide: out.append(segmented(x + w - 14 - 330, y + 26, 330, LANGS, sel, c))
    else: out.append(segmented(x + 14, y + 62, w - 28, LANGS, sel, c, h=38))
    return "".join(out), h

TXT = {0: ("Sprache", "Gilt für die ganze App."),
       1: ("Language", "Applies to the whole app."),
       2: ("Мова", "Діє для всього застосунку.")}
PLAN = {0: "Plan", 1: "Plan", 2: "Plan"}  # Rest der Seite bleibt im Mock deutsch; in der App wird alles übersetzt

def phone(sel):
    def f(c, theme, sub):
        inner, w, h = g.base("24 Darstellung", theme)
        b = [inner, label(18, 620, TXT[sel][0], c)]
        card, ch = lang_card(18, 632, 354, c, sel, TXT[sel]); b.append(card)
        b.append(label(18, 632 + ch + 28, PLAN[sel], c))
        card2, ch2 = m22.stand_card(18, 632 + ch + 40, 354, c, 1); b.append(card2)
        return page(w, max(h, 632 + ch + 40 + ch2 + 24), c, "".join(b))
    return f

def pc(c, theme, sub, sel=0):
    inner = m22.pc_base("24 Einstellungen · Darstellung", theme)
    b = [inner, R(250, 0, 306, 900, 0, c["paper"]), m22.pc_sidebar(inner, c, True)]
    b.append(R(270, 20, 330, 80, 0, c["paper"]) + g.eyebrow(284, 39, "9b · Meine Schule", c) + g.title(284, 80, "Mehr", c, 38))
    b.append(m22.pc_subnav(c, "Darstellung"))
    b.append(label(576, 692, TXT[sel][0], c))
    card, ch = lang_card(576, 704, 644, c, sel, TXT[sel], True); b.append(card)
    b.append(label(576, 704 + ch + 28, PLAN[sel], c))
    card2, _ = m22.stand_card(576, 704 + ch + 40, 644, c, 1, True); b.append(card2)
    return page(1440, 1070, c, "".join(b))

SCREENS = {"handy-01-sprache-de": phone(0), "handy-02-sprache-en": phone(1), "handy-03-sprache-uk": phone(2), "pc-01-sprache": pc}
if __name__ == "__main__":
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
