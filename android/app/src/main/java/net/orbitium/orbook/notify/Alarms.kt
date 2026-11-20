package net.orbitium.orbook.notify

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import net.orbitium.orbook.widget.WidgetStore
import net.orbitium.orbook.widget.WidgetWorker
import net.orbitium.orbook.widget.Widgets
import java.time.Duration
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId

/**
 * Часть 31e. Будильники Android — работают без интернета, по сохранённому плану:
 *   • BEFORE — «Vor der Stunde»: за 5/10/15 минут до ближайшего урока открытого класса;
 *   • EVENING — вечернее «Morgen» (тесты и домашки) в reminderTime;
 *   • TICK — виджеты перерисовываются на границе урока, чтобы «Jetzt» шёл и без сети.
 * Каждый срабатывает один раз и ставит следующий (schedule()).
 */
object Alarms {
    const val BEFORE = "net.orbitium.orbook.BEFORE"
    const val EVENING = "net.orbitium.orbook.EVENING"
    const val TICK = "net.orbitium.orbook.TICK"

    private fun intent(context: Context, action: String) =
        PendingIntent.getBroadcast(context, action.hashCode(), Intent(context, AlarmReceiver::class.java).setAction(action),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)

    /** Школьное время → время телефона: разница «школьного сейчас» и цели, отложенная от настоящего «сейчас». */
    private fun phoneTime(target: LocalDateTime, schoolNow: LocalDateTime) =
        System.currentTimeMillis() + Duration.between(schoolNow, target).toMillis()

    private fun set(context: Context, action: String, at: Long?, exact: Boolean) {
        val manager = context.getSystemService(AlarmManager::class.java)
        val pending = intent(context, action)
        if (at == null) return manager.cancel(pending)
        // точный будильник — только для «Vor der Stunde»; если Android его не даёт — чуть менее точный
        val canExact = Build.VERSION.SDK_INT < 31 || manager.canScheduleExactAlarms()
        if (exact && canExact) manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending)
        else manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending)
    }

    /** Открытый класс (о нём напоминаем), иначе первый. */
    fun activeClass(context: Context): Int? {
        val snapshot = WidgetStore(context).snapshot()
        return snapshot.activeId?.takeIf { id -> snapshot.classes.any { it.id == id } } ?: snapshot.classes.firstOrNull()?.id
    }

    fun schedule(context: Context) {
        val settings = NotifySettings.load(context)
        val on = Notifications.active(context)
        val current = Notifications.dataOf(context, activeClass(context))

        // «Vor der Stunde»
        val before = if (on && settings.beforeOn && current != null) {
            val (data, now) = current
            nextLesson(data, now, settings.beforeMinutes)?.let { (start, _) -> phoneTime(start.minusMinutes(settings.beforeMinutes.toLong()), now) }
        } else null
        set(context, BEFORE, before, exact = true)

        // вечернее «Morgen» — по часам телефона
        val evening = if (on && settings.reminder) {
            val today = LocalDate.now().atTime(settings.reminderTime)
            val next = if (today > LocalDateTime.now()) today else today.plusDays(1)
            next.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
        } else null
        set(context, EVENING, evening, exact = false)

        // виджеты: следующая граница урока (начало или конец)
        val tick = if (Widgets.count(context) > 0 && current != null) {
            val (data, now) = current
            data.days.asSequence().flatMap { d -> d.lessons.asSequence().flatMap { sequenceOf(it.start, it.end) }.filterNotNull().map { d.date.atTime(it) } }
                .filter { it > now }.minOrNull()?.let { phoneTime(it, now) }
        } else null
        set(context, TICK, tick, exact = false)
    }
}

/** Сработал будильник, телефон перезагрузили или приложение обновили. */
class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val texts = WidgetStore(context).snapshot().texts
        when (intent.action) {
            Alarms.BEFORE -> before(context)
            Alarms.EVENING -> {
                val store = WidgetStore(context)
                val done = store.snapshot().done
                if (Notifications.active(context) && !NotifySettings.load(context).quiet(LocalDateTime.now().toLocalTime())) {
                    Notifications.classIds(context).forEach { classId ->
                        val (data, now) = Notifications.dataOf(context, classId) ?: return@forEach
                        eveningNote(data, now, done, texts)?.let { Notifier.post(context, it.copy(id = "${it.id}-$classId"), Notifier.PLAN, texts) }
                    }
                }
            }
            Alarms.TICK -> Widgets.redraw(context)
            else -> WidgetWorker.schedule(context) // BOOT_COMPLETED, MY_PACKAGE_REPLACED: будильники после перезагрузки пропадают
        }
        Alarms.schedule(context)
    }

    private fun before(context: Context) {
        val settings = NotifySettings.load(context)
        if (!Notifications.active(context) || !settings.beforeOn) return
        val (data, now) = Notifications.dataOf(context, Alarms.activeClass(context)) ?: return
        // урок, который начнётся примерно через minutes (будильник мог прийти на минуту-две раньше или позже)
        val (start, lesson) = nextLesson(data, now.minusMinutes(2), settings.beforeMinutes) ?: return
        if (Duration.between(now, start).toMinutes() > settings.beforeMinutes + 5) return
        val texts = WidgetStore(context).snapshot().texts
        Notifier.post(context, Note("vor-$start", beforeText(lesson, settings.beforeMinutes, texts), "/heute"), Notifier.LESSON, texts)
    }
}
