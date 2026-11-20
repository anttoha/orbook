package net.orbitium.orbook.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

/** Android сообщает сюда: виджет положили, удалили, пора обновить. */
class OrbWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = OrbWidget()

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        super.onUpdate(context, appWidgetManager, appWidgetIds)
        WidgetWorker.schedule(context)
        WidgetWorker.refreshNow(context)
    }

    override fun onDeleted(context: Context, appWidgetIds: IntArray) {
        super.onDeleted(context, appWidgetIds)
        val store = WidgetStore(context)
        appWidgetIds.forEach(store::removeConfig)
    }

    // Последний виджет убрали — фоновые запросы нужны, только если включены уведомления (часть 31e)
    override fun onDisabled(context: Context) {
        super.onDisabled(context)
        WidgetWorker.schedule(context)
    }
}
