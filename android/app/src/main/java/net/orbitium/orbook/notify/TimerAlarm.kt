package net.orbitium.orbook.notify

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import net.orbitium.orbook.widget.WidgetStore
import org.json.JSONObject

/**
 * Часть 44. Lerntimer: будильник на конец раунда или перерыва — уведомление придёт, даже если приложение закрыто.
 * Сайт сам считает, когда фаза кончится, и передаёт время и текст (ORBookAndroid.timerAlarm). Сервер не участвует.
 * Новый будильник заменяет старый; пауза, «Stopp» или конец фазы — timerCancel.
 */
object TimerAlarm {
    const val ACTION = "net.orbitium.orbook.TIMER"
    private const val PREFS = "lerntimer"

    private fun intent(context: Context) =
        PendingIntent.getBroadcast(context, ACTION.hashCode(), Intent(context, AlarmReceiver::class.java).setAction(ACTION),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)

    /** {"at": 1758120000000, "title": "Lerntimer", "text": "Runde geschafft · Mathe"} */
    fun set(context: Context, json: JSONObject) {
        val at = json.optLong("at", 0L)
        if (at <= System.currentTimeMillis()) return cancel(context)
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putString("text", json.optString("text", "")).putLong("at", at).apply()
        val manager = context.getSystemService(AlarmManager::class.java)
        // точный будильник (как «Vor der Stunde»); если Android его не даёт — чуть менее точный
        val canExact = Build.VERSION.SDK_INT < 31 || manager.canScheduleExactAlarms()
        if (canExact) manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, intent(context))
        else manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, intent(context))
    }

    fun cancel(context: Context) {
        context.getSystemService(AlarmManager::class.java).cancel(intent(context))
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear().apply()
    }

    /** Будильник сработал: показать уведомление (канал «Lerntimer»), нажатие открывает таймер. */
    fun fire(context: Context) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val text = prefs.getString("text", null) ?: return
        prefs.edit().clear().apply()
        val texts = WidgetStore(context).snapshot().texts
        Notifier.post(context, Note("lerntimer", text, "/lerntimer"), Notifier.TIMER, texts)
    }
}
