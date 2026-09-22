package com.example.ui

import android.app.NotificationManager
import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.UnikoRdRepository
import com.example.model.AdminMetrics
import com.example.model.ChatMessage
import com.example.model.Product
import com.example.model.Store
import com.example.model.StoreApplication
import com.example.model.UserOrder
import com.example.model.UserProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class UnikoScreen {
    WELCOME,
    STORES,
    STORE_DETAIL,
    PRODUCT_DETAIL,
    CHAT,
    ADMIN,
    PROFILE,
    LOGIN,
    REGISTER,
    VENDOR_TERMS
}

enum class NavigationTab {
    TIENDAS,
    CHAT,
    ADMIN,
    PERFIL
}

class UnikoRdViewModel(
    private val repository: UnikoRdRepository = UnikoRdRepository()
) : ViewModel() {

    private val _currentScreen = MutableStateFlow(UnikoScreen.WELCOME)
    val currentScreen: StateFlow<UnikoScreen> = _currentScreen.asStateFlow()

    private val _activeTab = MutableStateFlow(NavigationTab.TIENDAS)
    val activeTab: StateFlow<NavigationTab> = _activeTab.asStateFlow()

    val isDarkMode: StateFlow<Boolean> = repository.isDarkMode
    val currentUserRole: StateFlow<String> = repository.currentUserRole
    val cartCount: StateFlow<Int> = repository.cartCount
    val selectedProvince: StateFlow<String> = repository.selectedProvince
    val searchQuery: StateFlow<String> = repository.searchQuery
    val userProfile: StateFlow<UserProfile> = repository.userProfile
    val userOrders: StateFlow<List<UserOrder>> = repository.userOrders
    val chatMessages: StateFlow<List<ChatMessage>> = repository.chatMessages
    val storeApplications: StateFlow<List<StoreApplication>> = repository.storeApplications
    val adminMetrics: StateFlow<AdminMetrics> = repository.adminMetrics

    private val _selectedStore = MutableStateFlow<Store?>(null)
    val selectedStore: StateFlow<Store?> = _selectedStore.asStateFlow()

    private val _selectedProduct = MutableStateFlow<Product?>(null)
    val selectedProduct: StateFlow<Product?> = _selectedProduct.asStateFlow()

    val filteredStores: StateFlow<List<Store>> = combine(
        repository.stores,
        repository.selectedProvince,
        repository.searchQuery
    ) { stores, province, query ->
        stores.filter { store ->
            val matchesProvince = province == "Todas" || store.province.equals(province, ignoreCase = true)
            val matchesQuery = query.isBlank() ||
                    store.name.contains(query, ignoreCase = true) ||
                    store.description.contains(query, ignoreCase = true)
            matchesProvince && matchesQuery
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allProducts: StateFlow<List<Product>> = repository.products

    init {
        viewModelScope.launch {
            repository.stores.collect { list ->
                if (_selectedStore.value == null && list.isNotEmpty()) {
                    _selectedStore.value = list.first()
                }
            }
        }
        viewModelScope.launch {
            repository.products.collect { list ->
                if (_selectedProduct.value == null && list.isNotEmpty()) {
                    _selectedProduct.value = list.first()
                }
            }
        }
    }

    fun navigateTo(screen: UnikoScreen) {
        _currentScreen.value = screen
        when (screen) {
            UnikoScreen.WELCOME, UnikoScreen.STORES -> _activeTab.value = NavigationTab.TIENDAS
            UnikoScreen.CHAT -> _activeTab.value = NavigationTab.CHAT
            UnikoScreen.ADMIN -> _activeTab.value = NavigationTab.ADMIN
            UnikoScreen.PROFILE -> _activeTab.value = NavigationTab.PERFIL
            else -> {}
        }
    }

    fun onTabSelected(tab: NavigationTab) {
        _activeTab.value = tab
        when (tab) {
            NavigationTab.TIENDAS -> _currentScreen.value = UnikoScreen.STORES
            NavigationTab.CHAT -> _currentScreen.value = UnikoScreen.CHAT
            NavigationTab.ADMIN -> _currentScreen.value = UnikoScreen.ADMIN
            NavigationTab.PERFIL -> _currentScreen.value = UnikoScreen.PROFILE
        }
    }

    fun selectStore(store: Store) {
        _selectedStore.value = store
        _currentScreen.value = UnikoScreen.STORE_DETAIL
    }

    fun selectProduct(product: Product) {
        _selectedProduct.value = product
        _currentScreen.value = UnikoScreen.PRODUCT_DETAIL
    }

    fun openChatForProduct(product: Product) {
        _selectedProduct.value = product
        _activeTab.value = NavigationTab.CHAT
        _currentScreen.value = UnikoScreen.CHAT
    }

    fun setProvinceFilter(province: String) {
        repository.setSelectedProvince(province)
    }

    fun setSearchQuery(query: String) {
        repository.setSearchQuery(query)
    }

    fun toggleDarkMode() {
        repository.toggleDarkMode()
    }

    fun toggleAiAgent() {
        repository.toggleAiAgent()
    }

    fun approveStore(appId: String) {
        repository.approveStoreApplication(appId)
    }

    fun rejectStore(appId: String) {
        repository.rejectStoreApplication(appId)
    }

    fun sendChatMessage(text: String) {
        repository.sendUserMessage(text)
    }

    fun addToCart(productId: String) {
        repository.addToCart(productId)
    }

    fun loginAsDemoUser(role: String) {
        repository.setUserRole(role)
        when (role) {
            "ADMIN" -> navigateTo(UnikoScreen.ADMIN)
            "VENDEDOR" -> {
                val stores = repository.stores.value
                if (stores.isNotEmpty()) {
                    _selectedStore.value = stores.first()
                }
                navigateTo(UnikoScreen.STORE_DETAIL)
            }
            else -> navigateTo(UnikoScreen.PROFILE)
        }
    }

    fun openVendorTerms() {
        navigateTo(UnikoScreen.VENDOR_TERMS)
    }

    fun acceptVendorTerms() {
        navigateTo(UnikoScreen.LOGIN)
    }

    fun sendVendorRegistrationNotification(context: Context, vendorName: String) {
        repository.notifyNewVendorRegistration(vendorName)
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val n = androidx.core.app.NotificationCompat.Builder(context, "uniko_vendor_updates")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Nuevo Vendedor Registrado")
            .setContentText(vendorName + " se ha registrado como vendedor en UNIKO RD")
            .setPriority(androidx.core.app.NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()
        nm.notify(System.currentTimeMillis().toInt(), n)
    }
}
