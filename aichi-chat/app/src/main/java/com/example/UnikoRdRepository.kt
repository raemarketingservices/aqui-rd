package com.example

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update

data class StoreApplication(
    val id: String,
    val storeName: String,
    val initials: String,
    val rncStatus: String,
    val isRncVerified: Boolean,
    val location: String,
    val rncNumber: String,
    val category: String,
    val contactName: String,
    val timeAgo: String,
    val isPending: Boolean
)

class UnikoRdRepository {

    private val _storeApplications = MutableStateFlow<List<StoreApplication>>(emptyList())
    val storeApplications: StateFlow<List<StoreApplication>> = _storeApplications

    fun refreshFromApi() {
        // TODO: Implement API refresh logic
    }

    fun notifyNewVendorRegistration(vendorName: String) {
        val newApp = StoreApplication(
            id = System.currentTimeMillis().toString(),
            storeName = vendorName,
            initials = vendorName.take(2).uppercase(),
            rncStatus = "Pendiente",
            isRncVerified = false,
            location = "Republica Dominicana",
            rncNumber = "Pendiente",
            category = "General",
            contactName = vendorName,
            timeAgo = "Ahora",
            isPending = true
        )
        _storeApplications.update { current -> current + newApp }
    }
}
