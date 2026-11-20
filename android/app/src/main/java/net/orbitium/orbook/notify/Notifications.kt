package net.orbitium.orbook.notify

import android.content.Context
import net.orbitium.orbook.widget.WidgetData
import net.orbitium.orbook.widget.WidgetStore
import net.orbitium.orbook.widget.WidgetWorker
import net.orbitium.orbook.widget.Widgets
import net.orbitium.orbook.widget.parseWidgetData
import org.json.JSONObject
import java.time.Duration
import java.time.LocalDateTime

/**
 * Часть 31e. Уведомления самого приложения — без Google и без сервера.
 * Приложение и так загружает /api/widget для виджетов (WidgetSync); после загрузки сравниваем ответ
 * с тем, о котором уже сообщили («seen»), и показываем разницу. Ruhezeit — не сравниваем (сообщим после неё).
 */
object Notifications {
    /** Классы, о которых сообщаем: все классы устройства, «Meine Kurse». Старый сервер без классов — один. */
    fun classIds(context: Context): List<Int?> = WidgetStore(context).snapshot().classes.map<_, Int?> { it.id }.ifEmpty { listOf(null) }

    fun keys(context: Context): List<String> = classIds(context).map { WidgetStore.key(it, true) }

    /** Нужны ли фоновые загрузки ради уведомлений (включены и разрешены). */
    fun active(context: Context) = NotifySettings.load(context).on && Notifier.permission(context) == "granted"

    /** Данные класса и «школьное» сейчас: now из ответа + сколько прошло с загрузки (у демо свой «сегодня»). */
    fun dataOf(context: Context, classId: Int?): Pair<WidgetData, LocalDateTime>? {
        val store = WidgetStore(context)
        val key = WidgetStore.key(classId, true)
        val data = store.data(key)?.let { runCatching { parseWidgetData(it) }.getOrNull() } ?: return null
        val elapsed = Duration.ofMillis((System.currentTimeMillis() - store.fetchedAt(key)).coerceAtLeast(0))
        return data to (data.now?.plus(elapsed) ?: LocalDateTime.now())
    }

    /** После каждой загрузки (и офлайн тоже — тогда новых данных нет и сообщать нечего). */
    fun afterSync(context: Context) {
        val settings = NotifySettings.load(context)
        if (active(context) && !settings.quiet(LocalDateTime.now().toLocalTime())) {
            val store = WidgetStore(context)
            val snapshot = store.snapshot()
            val several = snapshot.classes.size > 1
            for (classId in classIds(context)) {
                val key = WidgetStore.key(classId, true)
                val json = store.data(key) ?: continue
                val seen = store.seen(key)
                if (seen != null && seen != json) {
                    val old = runCatching { parseWidgetData(seen) }.getOrNull()
                    val (new, now) = dataOf(context, classId) ?: continue
                    if (old != null) {
                        val name = snapshot.classes.firstOrNull { it.id == classId }?.name
                        planChanges(old, new, now, settings, snapshot.texts).forEach { note ->
                            // несколько классов — «9b · Morgen: …», чтобы было понятно, о ком речь
                            val text = if (several && name != null) "$name · ${note.text}" else note.text
                            Notifier.post(context, note.copy(id = "$key-${note.id}", text = text), Notifier.PLAN, snapshot.texts)
                        }
                    }
                }
                store.saveSeen(key, json)
            }
        }
        Alarms.schedule(context)
    }

    /** Для сайта (ORBookAndroid.notifyState): настройки, разрешение и когда последний раз проверяли план. */
    fun state(context: Context): JSONObject {
        val store = WidgetStore(context)
        val last = keys(context).maxOfOrNull { store.fetchedAt(it) } ?: 0L
        return NotifySettings.load(context).toJson()
            .put("permission", Notifier.permission(context))
            .put("lastCheckAt", if (last > 0) last else JSONObject.NULL)
    }

    /** Сайт сохранил настройки: включили — сразу загрузить план (и запомнить его как «уже показанный»). */
    fun save(context: Context, json: JSONObject) {
        val before = NotifySettings.load(context)
        val settings = NotifySettings.from(json)
        NotifySettings.save(context, settings)
        if (settings.on && !before.on) {
            // только что включили: то, что уже есть, — не новость
            val store = WidgetStore(context)
            keys(context).forEach { key -> store.data(key)?.let { store.saveSeen(key, it) } }
        }
        WidgetWorker.schedule(context)
        if (settings.on) WidgetWorker.refreshNow(context)
        Alarms.schedule(context)
        Widgets.redraw(context)
    }

    fun test(context: Context) {
        val texts = WidgetStore(context).snapshot().texts
        Notifier.post(context, Note("test", texts.t("Test: Mitteilungen kommen an"), "/mehr/mitteilungen"), Notifier.PLAN, texts)
    }
}
