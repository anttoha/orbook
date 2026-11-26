package net.orbitium.orbook.widget

import org.json.JSONArray
import org.json.JSONObject
import java.time.DayOfWeek
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.temporal.ChronoUnit

/*
 * Часть 50c: виджеты «Für dich jetzt» и «Wetter» (макет design/neu/50-wetter, handy-09…12).
 * Те же правила, что на сайте: src/shared/utils/nowFocus.js (что показать сейчас) и weather.js (значки, «что надеть»).
 * Чистые функции без Android — их проверяет FuerDichTest. Поменял правило на сайте — поменяй и здесь.
 */

// ── погода: поле weather ответа /api/widget (как GET /api/weather) ──

data class WeatherHour(val hour: Int, val temp: Int?, val code: Int?, val rain: Int?)

data class WeatherDay(
    val date: LocalDate,
    val code: Int?,
    val tMax: Int?,
    val tMin: Int?,
    val rainMax: Int?,
    val rainFrom: Int?,
    val windMax: Int?,
    val uvMax: Double?,
    val hours: List<WeatherHour>,
)

data class Weather(val place: String?, val updatedAt: Instant?, val days: List<WeatherDay>) {
    fun day(date: LocalDate): WeatherDay? = days.firstOrNull { it.date == date }
}

private fun JSONObject.int(key: String): Int? = if (!has(key) || isNull(key)) null else optInt(key)
private fun JSONObject.num(key: String): Double? = if (!has(key) || isNull(key)) null else optDouble(key).takeIf { !it.isNaN() }
private fun JSONArray?.objects(): List<JSONObject> = if (this == null) emptyList() else (0 until length()).mapNotNull { optJSONObject(it) }

fun parseWeather(o: JSONObject): Weather = Weather(
    place = o.optJSONObject("place")?.optString("name")?.ifEmpty { null },
    updatedAt = o.optString("updatedAt").ifEmpty { null }?.let { runCatching { Instant.parse(it) }.getOrNull() },
    days = o.optJSONArray("days").objects().mapNotNull { d ->
        val date = runCatching { LocalDate.parse(d.optString("date")) }.getOrNull() ?: return@mapNotNull null
        WeatherDay(
            date, d.int("code"), d.int("tMax"), d.int("tMin"), d.int("rainMax"), d.int("rainFrom"), d.int("windMax"), d.num("uvMax"),
            d.optJSONArray("hours").objects().map { h -> WeatherHour(h.optInt("hour"), h.int("temp"), h.int("code"), h.int("rain")) },
        )
    },
)

/** Код WMO → вид значка (как weatherKind на сайте): sun, cloud-sun, cloud, fog, rain, snow, storm. */
fun weatherKind(code: Int?): String? = when {
    code == null -> null
    code <= 1 -> "sun"
    code == 2 -> "cloud-sun"
    code == 3 -> "cloud"
    code == 45 || code == 48 -> "fog"
    code in 71..77 || code == 85 || code == 86 -> "snow"
    code >= 95 -> "storm"
    code in 51..67 || code in 80..82 -> "rain"
    else -> "cloud"
}

/** «07:05» → час прогноза (ближайший): 07:05 → 7, 07:40 → 8. */
fun hourAt(day: WeatherDay?, time: LocalTime?): WeatherHour? {
    if (day == null || time == null) return null
    val target = if (time.minute >= 30) time.hour + 1 else time.hour
    return day.hours.firstOrNull { it.hour == target }
}

/** «17°» или «–». */
fun degrees(value: Int?) = if (value == null) "–" else "$value°"

/** С какой вероятности дождя час подсвечивается синим (RAIN_HINT на сайте). */
const val RAIN_HINT = 30

// ── настройки «Für dich jetzt»: те же, что на странице /fuer-dich (src/shared/utils/fuerDich.js), приходят в снимке ──

data class FuerDichSettings(
    val leaveMinutes: Int = 45,
    val eveningFrom: LocalTime = LocalTime.of(17, 0),
    val show: Set<String> = setOf("wetter", "mitnehmen", "hausaufgaben", "tests", "aenderungen"),
    val onlyMine: Boolean = true,
    val tips: Map<String, Double?> = mapOf("regenjacke" to 50.0, "jacke" to 12.0, "muetze" to 3.0, "sonnencreme" to 6.0),
    val testReminder: Boolean = true,
    val items: Map<String, List<String>> = mapOf("Sp" to listOf("Sportsachen")),
) {
    fun shows(part: String) = part in show

    companion object {
        private val SHOW = listOf("wetter", "mitnehmen", "hausaufgaben", "tests", "aenderungen", "termine")

        /** Из снимка сайта (уже проверено cleanFuerDich); нет — по умолчанию. */
        fun from(o: JSONObject?): FuerDichSettings {
            val d = FuerDichSettings()
            if (o == null) return d
            val show = o.optJSONObject("show")
            val tips = o.optJSONObject("tips")
            val items = o.optJSONObject("items")
            return FuerDichSettings(
                leaveMinutes = o.optInt("leaveMinutes", d.leaveMinutes).coerceIn(5, 120),
                eveningFrom = runCatching { LocalTime.parse(o.optString("eveningFrom")) }.getOrDefault(d.eveningFrom),
                show = if (show == null) d.show else SHOW.filter { show.optBoolean(it, it in d.show) }.toSet(),
                onlyMine = o.optBoolean("onlyMine", d.onlyMine),
                tips = if (tips == null) d.tips else d.tips.mapValues { (key, value) -> if (!tips.has(key)) value else tips.num(key) },
                testReminder = o.optBoolean("testReminder", d.testReminder),
                items = if (items == null) d.items else items.keys().asSequence().associateWith { code ->
                    items.optJSONArray(code)?.let { list -> (0 until list.length()).map { list.optString(it) }.filter { it.isNotBlank() } }.orEmpty()
                }.filterValues { it.isNotEmpty() },
            )
        }
    }
}

/**
 * «Что надеть» (weatherTips): ключи regenjacke, jacke, muetze, sonnencreme — в этом порядке.
 * at — час к выходу (его температура), без него — минимум дня. Порог null — совет выключен.
 */
fun weatherTips(day: WeatherDay?, at: WeatherHour?, tips: Map<String, Double?>): List<String> {
    if (day == null) return emptyList()
    val temp = at?.temp ?: day.tMin
    val out = mutableListOf<String>()
    tips["regenjacke"]?.let { if (day.rainMax != null && day.rainMax >= it) out += "regenjacke" }
    tips["jacke"]?.let { if (temp != null && temp < it) out += "jacke" }
    tips["muetze"]?.let { if (temp != null && temp < it) out += "muetze" }
    tips["sonnencreme"]?.let { if (day.uvMax != null && day.uvMax >= it) out += "sonnencreme" }
    return out
}

/** Плашка «что взять»: kind — wetter (ключ совета), test (label — предмет), fach (своя вещь). */
data class Pack(val kind: String, val label: String)

private fun Lesson.active() = !cancelled

/** Время выхода: начало первого урока минус leaveMinutes (не раньше полуночи). */
fun leaveTime(lessons: List<Lesson>, leaveMinutes: Int): LocalTime? {
    val first = lessons.filter { it.active() && it.start != null }.minOfOrNull { it.start!! } ?: return null
    val minutes = (first.toSecondOfDay() / 60 - leaveMinutes).coerceAtLeast(0)
    return LocalTime.of(minutes / 60, minutes % 60)
}

/** packList: погода → тесты → вещи по предметам дня (без повторов, без учёта регистра). */
fun packList(lessons: List<Lesson>, exams: List<Entry>, weather: WeatherDay?, leaveHour: WeatherHour?, settings: FuerDichSettings): List<Pack> {
    val out = mutableListOf<Pack>()
    if (settings.shows("wetter")) weatherTips(weather, leaveHour, settings.tips).forEach { out += Pack("wetter", it) }
    if (settings.shows("tests") && settings.testReminder) exams.forEach { out += Pack("test", it.title) }
    if (settings.shows("mitnehmen")) {
        val seen = mutableSetOf<String>()
        for (lesson in lessons.filter { it.active() }) {
            for (item in settings.items[lesson.subject].orEmpty()) {
                if (seen.add(item.lowercase())) out += Pack("fach", item)
            }
        }
    }
    return out
}

private val byTime = compareBy<Lesson>({ it.start ?: LocalTime.MAX }, { it.period })

/** Первый урок + изменённые, потом остальные; не больше n, по времени (keyLessons). */
fun keyLessons(lessons: List<Lesson>, n: Int = 3, changesFirst: Boolean = true): List<Lesson> {
    val sorted = lessons.sortedWith(byTime)
    val first = sorted.firstOrNull { it.active() }
    val wanted = if (changesFirst) listOfNotNull(first) + sorted.filter { it.cancelled || it.changed } + sorted else sorted
    return wanted.distinct().take(n).sortedWith(byTime)
}

// ── «Für dich jetzt»: что показать сейчас ──

/** Ответ правила. kind: ferien | morgen | stunde | pause | nachmittag | abend. Поля, которых у отрезка нет, — пустые. */
data class Focus(
    val kind: String,
    val date: LocalDate?,
    val weather: WeatherDay? = null,
    // morgen
    val leave: LocalTime? = null,
    val leaveIn: Long? = null, // ≤ 0 — «los!»
    val leaveHour: WeatherHour? = null,
    val pack: List<Pack> = emptyList(),
    val lessons: List<Lesson> = emptyList(),
    // stunde / pause
    val lesson: Lesson? = null,
    val minutes: Long? = null, // stunde — сколько осталось, pause — через сколько
    val progress: Float? = null,
    val after: List<Lesson> = emptyList(),
    // nachmittag / abend
    val first: Lesson? = null,
    val changes: List<Lesson> = emptyList(),
    val homework: List<Entry> = emptyList(),
    val exams: List<Entry> = emptyList(),
    // ferien
    val ferien: Termin? = null,
    val backOn: LocalDate? = null,
    val daysFree: Long? = null,
)

private fun Termin.covers(date: LocalDate) = date >= from && date <= (to ?: from)

/** Учебный день: не выходной, не «holiday» в плане и не внутри «freier Tag». */
private fun isSchoolDay(date: LocalDate, data: WidgetData): Boolean =
    date.dayOfWeek != DayOfWeek.SATURDAY && date.dayOfWeek != DayOfWeek.SUNDAY &&
        data.days.none { it.date == date && it.status == "holiday" } &&
        data.appointments.none { it.kind == "free" && it.covers(date) }

fun nextSchoolDay(date: LocalDate, data: WidgetData): LocalDate =
    generateSequence(date.plusDays(1)) { it.plusDays(1) }.take(400).firstOrNull { isSchoolDay(it, data) } ?: date.plusDays(1)

private fun lessonsOf(day: Day?) = if (day?.status == "ok") day.lessons.sortedWith(byTime) else emptyList()

/**
 * Как nowFocus на сайте. done — номера выполненных Hausaufgaben (галочки с телефона, из снимка).
 * Порядок: ferien → morgen → stunde → pause → nachmittag → abend.
 */
fun nowFocus(data: WidgetData, at: LocalDateTime, settings: FuerDichSettings, done: Set<Int> = emptySet()): Focus {
    val today = at.toLocalDate()
    val time = at.toLocalTime()
    val weather = data.weather.takeIf { settings.shows("wetter") }
    val homework = data.homework.filter { it.id !in done }

    data.appointments.firstOrNull { it.kind == "free" && it.covers(today) }?.let { item ->
        val backOn = nextSchoolDay(item.to ?: item.from, data)
        return Focus(
            "ferien", today, weather?.day(today), ferien = item, backOn = backOn,
            daysFree = ChronoUnit.DAYS.between(today, backOn),
            exams = if (settings.shows("tests")) data.exams.filter { it.date >= backOn }.take(1) else emptyList(),
            homework = if (settings.shows("hausaufgaben")) homework.filter { it.date >= today }.take(1) else emptyList(),
        )
    }

    val todayDay = data.days.firstOrNull { it.date == today }
    val weatherToday = weather?.day(today)
    // плана на сегодня нет (ещё не вышел) — утро без уроков: погода и что надеть
    if (todayDay != null && todayDay.status != "ok" && todayDay.status != "holiday") {
        return Focus("morgen", today, weatherToday, pack = packList(emptyList(), emptyList(), weatherToday, null, settings))
    }
    val lessons = lessonsOf(todayDay)
    val timed = lessons.filter { it.active() && it.start != null && it.end != null }
    val over = timed.isNotEmpty() && time >= timed.last().end!!
    if (timed.isNotEmpty() && !over) {
        val current = timed.firstOrNull { time >= it.start!! && time < it.end!! }
        if (current != null) {
            val total = Duration.between(current.start, current.end).toMinutes().coerceAtLeast(1)
            return Focus(
                "stunde", today, weatherToday, lesson = current,
                minutes = Duration.between(time, current.end).toMinutes() + 1,
                progress = Duration.between(current.start, time).toMinutes().toFloat() / total,
                after = timed.filter { it.start!! >= current.end }.take(2),
            )
        }
        val first = timed.first()
        if (time < first.start) {
            val leave = leaveTime(lessons, settings.leaveMinutes)
            val leaveHour = hourAt(weatherToday, leave)
            return Focus(
                "morgen", today, weatherToday, leave = leave,
                leaveIn = leave?.let { Duration.between(time, it).toMinutes() },
                leaveHour = leaveHour,
                lessons = keyLessons(lessons, 3, settings.shows("aenderungen")),
                pack = packList(lessons, data.exams.filter { it.date == today }, weatherToday, leaveHour, settings),
            )
        }
        val next = timed.first { it.start!! > time }
        return Focus(
            "pause", today, weatherToday, lesson = next,
            minutes = Duration.between(time, next.start).toMinutes() + 1,
            after = timed.filter { it.start!! > next.start }.take(2),
        )
    }

    // уроки кончились (или их нет): до «Abends ab» — «Für morgen», если завтра учебный; иначе — следующий учебный день
    val next = nextSchoolDay(today, data)
    val kind = if (timed.isNotEmpty() && time < settings.eveningFrom && next == today.plusDays(1)) "nachmittag" else "abend"
    val nextLessons = lessonsOf(data.days.firstOrNull { it.date == next })
    return Focus(
        kind, next, weather?.day(next),
        first = nextLessons.firstOrNull { it.active() },
        lessons = keyLessons(nextLessons, 3, settings.shows("aenderungen")),
        changes = if (settings.shows("aenderungen")) nextLessons.filter { it.cancelled || it.changed } else emptyList(),
        homework = if (settings.shows("hausaufgaben")) homework.filter { it.date <= next } else emptyList(),
        exams = if (settings.shows("tests")) data.exams.filter { it.date >= next && it.date <= next.plusDays(2) } else emptyList(),
        pack = packList(nextLessons, data.exams.filter { it.date == next }, weather?.day(next), null, settings),
    )
}

/**
 * День для виджета «Wetter»: сегодня, а после «Abends ab» (или когда сегодня прогноза нет) — завтра.
 */
fun weatherDayToShow(weather: Weather, at: LocalDateTime, settings: FuerDichSettings): WeatherDay? {
    val today = at.toLocalDate()
    val wanted = if (at.toLocalTime() >= settings.eveningFrom) today.plusDays(1) else today
    return weather.day(wanted) ?: weather.days.firstOrNull { it.date >= today }
}
