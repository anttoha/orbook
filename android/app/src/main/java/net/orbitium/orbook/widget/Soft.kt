package net.orbitium.orbook.widget

import androidx.compose.ui.graphics.Color
import androidx.glance.color.ColorProvider
import androidx.glance.unit.ColorProvider

/**
 * Цвета Soft для виджета — те же значения, что токены в src/index.css (светлая тема и .dark).
 * Виджет рисует Android, а не браузер, поэтому значения переписаны сюда.
 */
/** Цвет в светлой и тёмной теме. */
data class Tone(val light: Long, val dark: Long)

object Soft {
    val paper = Tone(0xFFFBF7F2, 0xFF16131C)
    val card = Tone(0xFFFFFFFF, 0xFF221E2A)
    val ink = Tone(0xFF2A2433, 0xFFF4F0F8)
    val muted = Tone(0xFF6A6275, 0xFFB5ACC1)
    val faint = Tone(0xFF978FA1, 0xFF877E94)
    val hair = Tone(0xFFF0EAE2, 0xFF2B2634)
    val sand = Tone(0xFFF3EDE5, 0xFF2A2533)
    val skeleton = Tone(0xFFEEE7DE, 0xFF27222F)
    val accent = Tone(0xFF6C4DF6, 0xFFA58BFF)
    val accentInk = Tone(0xFF4A31C9, 0xFFCFC2FF)
    val tint = Tone(0xFFEEE9FF, 0xFF2C2548)
    val onAccent = Tone(0xFFFFFFFF, 0xFF1A1333)
    val danger = Tone(0xFFD6455D, 0xFFFF8AA0)
    val dangerTint = Tone(0xFFFCE7EB, 0xFF3A1D25)
    val ok = Tone(0xFF1F9D6B, 0xFF5FD3A2)

    /** Палитры предметов: светлая плашка, текст на ней и «точка» (--color-<fach>-tint/-text/-solid). */
    class Fach(val tint: Tone, val text: Tone, val solid: Tone)

    val palettes = linkedMapOf(
        "deutsch" to Fach(Tone(0xFFF6D7DA, 0xFF482836), Tone(0xFF8D364C, 0xFFF3B5C4), Tone(0xFFE4577A, 0xFFE76B8A)),
        "mathe" to Fach(Tone(0xFFD8E0F1, 0xFF28314E), Tone(0xFF2F5192, 0xFFB0C8F6), Tone(0xFF4C82EC, 0xFF6191EE)),
        "englisch" to Fach(Tone(0xFFF8E1CA, 0xFF4A3326), Tone(0xFF94561B, 0xFFF8CCA2), Tone(0xFFEE8A2C, 0xFFF09845)),
        "physik" to Fach(Tone(0xFFD2E9E9, 0xFF223B47), Tone(0xFF1D6C7B, 0xFFA4DCE6), Tone(0xFF2FAFC7, 0xFF48B9CE)),
        "geschichte" to Fach(Tone(0xFFEFE3C8, 0xFF403523), Tone(0xFF765C14, 0xFFE3D09D), Tone(0xFFBF9420, 0xFFC7A13B)),
        "kunst" to Fach(Tone(0xFFF1D8EA, 0xFF422947), Tone(0xFF7B397E, 0xFFE6B8E8), Tone(0xFFC75CCB, 0xFFCE70D1)),
        "sport" to Fach(Tone(0xFFDFDFE2, 0xFF2F313E), Tone(0xFF444F63, 0xFFBFC7D5), Tone(0xFF6E80A0, 0xFF7F8FAB)),
        "biologie" to Fach(Tone(0xFFD5E9D9, 0xFF253B35), Tone(0xFF276E47, 0xFFAADCC2), Tone(0xFF3FB173, 0xFF56BA84)),
    )

    private val defaults = mapOf(
        "De" to "deutsch", "Ma" to "mathe", "En" to "englisch", "Ph" to "physik",
        "Ge" to "geschichte", "Ku" to "kunst", "Sp" to "sport", "Bi" to "biologie",
    )

    /** Как paletteOf во фронте: свой цвет пользователя → цвет дизайна → по сумме букв кода. */
    fun fach(code: String?, overrides: Map<String, String>): Fach {
        if (code.isNullOrEmpty()) return palettes.getValue("sport")
        val key = overrides[code] ?: defaults[code] ?: palettes.keys.elementAt(code.sumOf { it.code } % palettes.size)
        return palettes[key] ?: palettes.getValue("sport")
    }
}

/**
 * «Aussehen» виджета: App (как тема на сайте; «System» — как телефон), Hell, Dunkel.
 * dark = null — следовать телефону (Glance сам выберет светлый или тёмный цвет).
 */
class Look(private val dark: Boolean?, private val half: Boolean) {
    fun of(pair: Tone): ColorProvider = when (dark) {
        null -> ColorProvider(day = Color(pair.light), night = Color(pair.dark))
        true -> ColorProvider(Color(pair.dark))
        false -> ColorProvider(Color(pair.light))
    }

    /** Фон виджета: «Halb» — полупрозрачная карточка, сквозь неё видны обои. */
    val background: ColorProvider
        get() = if (!half) of(Soft.card) else of(Tone(Soft.card.light and 0x00FFFFFF or 0xC8000000, Soft.card.dark and 0x00FFFFFF or 0xC8000000))
}
