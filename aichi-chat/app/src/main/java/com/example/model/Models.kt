package com.example.model

data class Store(
    val id: String,
    val name: String,
    val slug: String = "",
    val description: String = "",
    val province: String = "",
    val city: String = "",
    val isVerified: Boolean = false,
    val isOficial: Boolean = false,
    val rating: Float = 0f,
    val totalSales: Int = 0,
    val imageUrl: String = "",
    val categories: List<String> = emptyList(),
    val tags: List<String> = emptyList(),
    val userId: String = "",
    val productCount: Int = 0,
    val whatsapp: String = "",
    val email: String = "",
    val address: String = "",
    val rnc: String = "",
    val paymentMethods: String = "",
    val products: List<Product> = emptyList()
)

data class Product(
    val id: String,
    val storeId: String = "",
    val storeName: String = "",
    val name: String,
    val description: String = "",
    val price: Int = 0,
    val originalPrice: Int = 0,
    val discount: Int = 0,
    val rating: Float = 0f,
    val reviewsCount: Int = 0,
    val imageUrl: String? = null,
    val images: List<String> = emptyList(),
    val category: String = "",
    val badge: String = "",
    val isExpress: Boolean = false,
    val isFreeShipping: Boolean = false,
    val stock: Int = 0,
    val whatsapp: String = "",
    val categoryId: String = "",
    val status: String = "ACTIVE"
)

data class UserProfile(
    val id: String = "",
    val name: String = "",
    val email: String = "",
    val role: String = "CUSTOMER"
)

data class ChatMessage(
    val id: String = "",
    val message: String = "",
    val sender: String = "USER",
    val createdAt: Long = System.currentTimeMillis()
)

data class AdminMetrics(
    val totalSales: Int = 0,
    val activeProducts: Int = 0,
    val activeStores: Int = 0,
    val pendingStores: Int = 0,
    val liveChats: Int = 0,
    val aiAgentActive: Boolean = false
)

data class UserOrder(
    val id: String = "",
    val productId: String = "",
    val productName: String = "",
    val status: String = "PENDING",
    val total: Int = 0,
    val createdAt: Long = System.currentTimeMillis()
)

data class StoreApplication(
    val id: String,
    val storeName: String,
    val initials: String,
    val rncStatus: String = "Pendiente",
    val isRncVerified: Boolean = false,
    val location: String = "",
    val rncNumber: String = "",
    val category: String = "",
    val contactName: String = "",
    val timeAgo: String = "",
    val isPending: Boolean = true
)
