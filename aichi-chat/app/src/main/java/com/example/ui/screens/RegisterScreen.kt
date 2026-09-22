package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.Store
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.network.ApiClient
import com.example.ui.components.UnikoRdLogo
import com.example.ui.theme.UnikoBlue
import com.example.ui.theme.UnikoGreen
import com.example.ui.theme.UnikoOrange
import kotlinx.coroutines.launch

private val PAYMENT_OPTIONS = listOf(
    "contra_entrega" to "💵 Contra Entrega",
    "cuenta_bancaria" to "🏦 Transferencia Bancaria",
    "tarjeta_credito" to "💳 Tarjeta de Crédito",
    "tarjeta_debito" to "💳 Tarjeta de Débito",
    "paypal" to "🌐 PayPal",
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit,
    modifier: Modifier = Modifier
) {
    var accountType by remember { mutableStateOf("CLIENTE") }
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phonePrefix by remember { mutableStateOf("+1 (809)") }
    var phoneNumber by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var termsAccepted by remember { mutableStateOf(true) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    // Vendor fields
    var businessName by remember { mutableStateOf("") }
    var storeDescription by remember { mutableStateOf("") }
    var storeAddress by remember { mutableStateOf("") }
    var storeEmail by remember { mutableStateOf("") }
    var storeWhatsapp by remember { mutableStateOf("") }
    var storeLogo by remember { mutableStateOf("") }
    val selectedPayments = remember { mutableStateListOf<String>() }
    var paymentExpanded by remember { mutableStateOf(false) }

    val scrollState = rememberScrollState()
    val scope = rememberCoroutineScope()

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(horizontal = 24.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant)
                .padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(UnikoGreen))
                Spacer(modifier = Modifier.width(6.dp))
                Text(text = "En Vivo RD", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = UnikoGreen)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))
        UnikoRdLogo(iconSize = 44.dp, subtitleText = "República Dominicana")
        Spacer(modifier = Modifier.height(16.dp))

        Text(text = "Crea tu Cuenta", style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.ExtraBold, fontSize = 22.sp), color = MaterialTheme.colorScheme.onBackground)
        Spacer(modifier = Modifier.height(4.dp))
        Text(text = "Marketplace República Dominicana", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(modifier = Modifier.height(20.dp))

        // Account Type
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            AccountTypeCard(title = "Cliente", subtitle = "Comprar en todo el país", icon = Icons.Default.ShoppingBag, isSelected = accountType == "CLIENTE", modifier = Modifier.weight(1f), onClick = { accountType = "CLIENTE" })
            AccountTypeCard(title = "Vendedor", subtitle = "Vender mis productos", icon = Icons.Default.Store, isSelected = accountType == "VENDEDOR", modifier = Modifier.weight(1f), onClick = { accountType = "VENDEDOR" })
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Name
        OutlinedTextField(value = fullName, onValueChange = { fullName = it }, label = { Text("Nombre Completo") }, placeholder = { Text("Juan Pérez Santana") }, leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant) }, singleLine = true, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = UnikoBlue, unfocusedBorderColor = MaterialTheme.colorScheme.outline))
        Spacer(modifier = Modifier.height(12.dp))

        // Email
        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Correo Electrónico") }, placeholder = { Text("juan@ejemplo.do") }, leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant) }, singleLine = true, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = UnikoBlue, unfocusedBorderColor = MaterialTheme.colorScheme.outline))
        Spacer(modifier = Modifier.height(12.dp))

        // Phone
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(modifier = Modifier.height(56.dp).clip(RoundedCornerShape(12.dp)).background(MaterialTheme.colorScheme.surfaceVariant).border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(12.dp)).padding(horizontal = 10.dp), contentAlignment = Alignment.Center) {
                    Text(text = phonePrefix, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                }
                OutlinedTextField(value = phoneNumber, onValueChange = { phoneNumber = it }, label = { Text("Teléfono / WhatsApp") }, placeholder = { Text("555-0199") }, leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant) }, singleLine = true, modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = UnikoBlue, unfocusedBorderColor = MaterialTheme.colorScheme.outline))
            }
            Text(text = "Para coordinación de envíos locales", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(start = 4.dp, top = 2.dp))
        }
        Spacer(modifier = Modifier.height(12.dp))

        // Password
        OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Contraseña Segura") }, leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant) }, trailingIcon = { IconButton(onClick = { passwordVisible = !passwordVisible }) { Icon(imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff, contentDescription = null) } }, visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(), singleLine = true, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = UnikoBlue, unfocusedBorderColor = MaterialTheme.colorScheme.outline))

        if (password.isNotEmpty()) {
            Spacer(modifier = Modifier.height(4.dp))
            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.weight(1f).height(4.dp).clip(RoundedCornerShape(2.dp)).background(if (password.length >= 6) UnikoGreen else UnikoOrange))
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = if (password.length >= 6) "Segura" else "Corta", fontSize = 10.sp, color = if (password.length >= 6) UnikoGreen else UnikoOrange, fontWeight = FontWeight.Bold)
            }
        }

        // === VENDOR FIELDS ===
        if (accountType == "VENDEDOR") {
            Spacer(modifier = Modifier.height(16.dp))
            Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(UnikoOrange.copy(alpha = 0.08f)).padding(12.dp)) {
                Column {
                    Text(text = "🏪 Información de la Tienda", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = UnikoOrange)
                }
            }
            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(value = businessName, onValueChange = { businessName = it }, label = { Text("Nombre de la tienda *") }, placeholder = { Text("Mi Electrónica RD") }, leadingIcon = { Icon(Icons.Default.Store, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant) }, singleLine = true, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = UnikoBlue, unfocusedBorderColor = MaterialTheme.colorScheme.outline))
            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(value = storeDescription, onValueChange = { storeDescription = it }, label = { Text("Descripción") }, placeholder = { Text("Describe tu tienda...") }, modifier = Modifier.fillMaxWidth().height(80.dp), shape = RoundedCornerShape(12.dp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = UnikoBlue, unfocusedBorderColor = MaterialTheme.colorScheme.outline))
            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(value = storeWhatsapp, onValueChange = { storeWhatsapp = it }, label = { Text("WhatsApp de la tienda") }, placeholder = { Text("8290000000") }, leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant) }, singleLine = true, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = UnikoBlue, unfocusedBorderColor = MaterialTheme.colorScheme.outline))
            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(value = storeEmail, onValueChange = { storeEmail = it }, label = { Text("Email de la tienda") }, placeholder = { Text("tienda@ejemplo.com") }, leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant) }, singleLine = true, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = UnikoBlue, unfocusedBorderColor = MaterialTheme.colorScheme.outline))
            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(value = storeAddress, onValueChange = { storeAddress = it }, label = { Text("Dirección") }, placeholder = { Text("Santo Domingo, RD") }, leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant) }, singleLine = true, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = UnikoBlue, unfocusedBorderColor = MaterialTheme.colorScheme.outline))
            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(value = storeLogo, onValueChange = { storeLogo = it }, label = { Text("Logo URL (opcional)") }, placeholder = { Text("https://ejemplo.com/logo.png") }, singleLine = true, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = UnikoBlue, unfocusedBorderColor = MaterialTheme.colorScheme.outline))
            Spacer(modifier = Modifier.height(12.dp))

            // Payment Methods
            Text(text = "Métodos de pago aceptados", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface, modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp))
            ExposedDropdownMenuBox(expanded = paymentExpanded, onExpandedChange = { paymentExpanded = it }) {
                OutlinedTextField(value = if (selectedPayments.isEmpty()) "Seleccionar métodos" else selectedPayments.joinToString { pid -> PAYMENT_OPTIONS.find { it.first == pid }?.second ?: pid }, onValueChange = {}, readOnly = true, label = { Text("Métodos de pago") }, trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = paymentExpanded) }, modifier = Modifier.fillMaxWidth().menuAnchor(), shape = RoundedCornerShape(12.dp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = UnikoBlue, unfocusedBorderColor = MaterialTheme.colorScheme.outline))
                ExposedDropdownMenu(expanded = paymentExpanded, onDismissRequest = { paymentExpanded = false }) {
                    PAYMENT_OPTIONS.forEach { (value, label) ->
                        DropdownMenuItem(text = { Row(verticalAlignment = Alignment.CenterVertically) { Checkbox(checked = selectedPayments.contains(value), onCheckedChange = { if (it) selectedPayments.add(value) else selectedPayments.remove(value) }); Spacer(modifier = Modifier.width(8.dp)); Text(label) } }, onClick = { if (selectedPayments.contains(value)) selectedPayments.remove(value) else selectedPayments.add(value) })
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }

        // Error
        errorMsg?.let {
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = it, color = Color.Red, fontSize = 12.sp)
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Terms
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked = termsAccepted, onCheckedChange = { termsAccepted = it }, colors = CheckboxDefaults.colors(checkedColor = UnikoBlue))
            Text(text = "Acepto los Términos y Condiciones", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Register Button
        Button(
            onClick = {
                if (fullName.isBlank() || email.isBlank() || password.length < 6) {
                    errorMsg = "Completa todos los campos (contraseña mín. 6 caracteres)"
                    return@Button
                }
                if (accountType == "VENDEDOR" && businessName.isBlank()) {
                    errorMsg = "El nombre de la tienda es requerido"
                    return@Button
                }
                isLoading = true
                errorMsg = null
                scope.launch {
                    try {
                        val resp = ApiClient.register(fullName, email, password, accountType)
                        if (resp.token.isNotEmpty()) {
                            ApiClient.setAuthToken(resp.token)
                            resp.user?.let { u ->
                                if (accountType == "VENDEDOR") {
                                    try {
                                        ApiClient.vendorRegister(
                                            userId = u.id,
                                            businessName = businessName,
                                            description = storeDescription,
                                            whatsapp = storeWhatsapp.ifBlank { phoneNumber },
                                            address = storeAddress,
                                            logo = storeLogo,
                                            paymentMethods = selectedPayments.joinToString(",")
                                        )
                                    } catch (_: Exception) {}
                                }
                            }
                            onRegisterSuccess()
                        } else {
                            errorMsg = resp.error ?: "Error al crear cuenta"
                        }
                    } catch (e: Exception) {
                        errorMsg = e.message ?: "Error de red"
                    }
                    isLoading = false
                }
            },
            colors = ButtonDefaults.buttonColors(containerColor = UnikoOrange),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth().height(50.dp),
            enabled = !isLoading
        ) {
            Text(text = if (isLoading) "Creando..." else if (accountType == "VENDEDOR") "Crear Tienda 🚀" else "Crear Cuenta 🚀", fontSize = 15.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
            Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Default.Security, contentDescription = null, tint = UnikoGreen, modifier = Modifier.size(14.dp)); Spacer(modifier = Modifier.width(4.dp)); Text("Datos 100% protegidos", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant) }
            Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Default.Check, contentDescription = null, tint = UnikoBlue, modifier = Modifier.size(14.dp)); Spacer(modifier = Modifier.width(4.dp)); Text("Envíos 24-48h en RD", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant) }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Row(horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
            Text(text = "¿Ya tienes cuenta? ", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(text = "Inicia Sesión", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = UnikoBlue, modifier = Modifier.clickable { onNavigateToLogin() })
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
private fun AccountTypeCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isSelected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier.clip(RoundedCornerShape(12.dp)).clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = if (isSelected) UnikoBlue.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surface),
        border = BorderStroke(width = if (isSelected) 2.dp else 1.dp, color = if (isSelected) UnikoBlue else MaterialTheme.colorScheme.outline),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Icon(imageVector = icon, contentDescription = null, tint = if (isSelected) UnikoBlue else MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(20.dp))
                if (isSelected) {
                    Icon(imageVector = Icons.Default.Check, contentDescription = "Seleccionado", tint = UnikoBlue, modifier = Modifier.size(16.dp))
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = if (isSelected) UnikoBlue else MaterialTheme.colorScheme.onSurface)
            Text(text = subtitle, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
