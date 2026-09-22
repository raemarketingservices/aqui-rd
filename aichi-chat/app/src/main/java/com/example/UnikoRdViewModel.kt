package com.example

import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.lifecycle.ViewModel

class UnikoRdViewModel : ViewModel() {

    private val repository = UnikoRdRepository()

    fun sendVendorRegistrationNotification(context: Context, vendorName: String) {
        repository.notifyNewVendorRegistration(vendorName)

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = android.app.NotificationChannel(
                "uniko_vendor_updates",
                "Actualizaciones de Vendedores",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            notificationManager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(context, "uniko_vendor_updates")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Nuevo Vendedor Registrado")
            .setContentText("$vendorName se ha registrado como vendedor en UNIKO RD")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
}
