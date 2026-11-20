package net.orbitium.orbook.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.updateAll
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

/** Виджеты на этом телефоне — для сайта: список в «Android-App» и экран «Widget einstellen». */
object Widgets {
    private fun ids(context: Context): IntArray =
        AppWidgetManager.getInstance(context).getAppWidgetIds(ComponentName(context, OrbWidgetReceiver::class.java))

    /** «4 × 2» — сколько клеток рабочего стола занимает виджет (формула из документации Android: 70·n − 30 dp). */
    fun cells(context: Context, id: Int): Pair<Int, Int> {
        val options = AppWidgetManager.getInstance(context).getAppWidgetOptions(id)
        val width = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)
        val height = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT)
        fun count(dp: Int) = ((dp + 30) / 70).coerceAtLeast(1)
        return count(width) to count(height)
    }

    fun count(context: Context): Int = ids(context).size

    fun describe(context: Context, id: Int): JSONObject {
        val (cols, rows) = cells(context, id)
        return (WidgetStore(context).config(id) ?: WidgetConfig()).toJson().put("id", id).put("cols", cols).put("rows", rows)
    }

    fun list(context: Context): JSONArray = JSONArray().apply { ids(context).forEach { put(describe(context, it)) } }

    /** Сохранить настройку и сразу перерисовать: сначала со старыми данными, потом — свежими с сервера. */
    fun save(context: Context, id: Int, json: JSONObject) {
        WidgetStore(context).saveConfig(id, WidgetConfig.from(json))
        redraw(context)
        WidgetWorker.schedule(context)
        WidgetWorker.refreshNow(context)
    }

    fun redraw(context: Context) {
        val app = context.applicationContext
        CoroutineScope(Dispatchers.Default).launch {
            if (GlanceAppWidgetManager(app).getGlanceIds(OrbWidget::class.java).isNotEmpty()) OrbWidget().updateAll(app)
        }
    }
}
