package net.orbitium.orbook

import android.content.Context
import android.view.View
import android.widget.FrameLayout
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

/** Android 15 рисует приложение под строкой состояния — отодвигаем сайт от системных панелей и клавиатуры. */
fun withSystemBarPadding(context: Context, content: View): FrameLayout {
    val root = FrameLayout(context)
    root.setBackgroundColor(context.getColor(R.color.paper))
    root.addView(content)
    ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
        val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.ime())
        view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
        WindowInsetsCompat.CONSUMED
    }
    return root
}
