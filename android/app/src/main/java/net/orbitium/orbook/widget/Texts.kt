package net.orbitium.orbook.widget

/**
 * Тексты виджета. Основной язык — немецкий (как на сайте); перевод на English/Українська присылает сам сайт
 * в снимке (`texts`, ключ — немецкий текст, src/shared/utils/widgetSnapshot.js). Нет перевода — немецкий.
 * {n} в тексте заменяется числом или словом; с части 50c — и любое другое имя ({time}, {fach} …):
 * в одном тексте виджета всегда одно место для подстановки, поэтому ключи сайта подходят как есть.
 */
private val SLOT = Regex("\\{[a-zA-Z0-9]+\\}")

class Texts(private val map: Map<String, String>, val lang: String) {
    fun t(key: String, n: Any? = null): String {
        val text = map[key] ?: key
        return if (n == null) text else SLOT.replace(text) { n.toString() }
    }
}
