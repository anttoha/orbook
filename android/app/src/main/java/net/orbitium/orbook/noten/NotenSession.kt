package net.orbitium.orbook.noten

/**
 * Часть 47: номер сессии Noten. «Abmelden» начинает новую; ответ школы, спрошенный в прошлой,
 * ничего не сохраняет. Проверка и запись идут под одной блокировкой — выход не вклинится между ними.
 * Номер живёт только в памяти: вместе с процессом умирают и сами запросы.
 */
class NotenSession {
    private var number = 0

    @Synchronized
    fun current(): Int = number

    /** Выход: новая сессия и стирание — одним шагом. */
    @Synchronized
    fun end(wipe: () -> Unit) {
        number++
        wipe()
    }

    /** Выполнить запись, только если с запроса не выходили. false — ответ устарел. */
    @Synchronized
    fun ifSame(session: Int, write: () -> Unit): Boolean {
        if (session != number) return false
        write()
        return true
    }
}
