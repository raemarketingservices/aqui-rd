package com.example.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.network.ApiClient
import com.example.ui.theme.UnikoBlue
import com.example.ui.theme.UnikoGreen
import com.example.ui.theme.UnikoOrange
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private data class StoreChatMsg(
    val id: String,
    val text: String,
    val isUser: Boolean,
    val timestamp: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StoreChatScreen(
    storeId: String,
    storeName: String,
    storeLogo: String?,
    productName: String?,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val messages = remember { mutableStateListOf<StoreChatMsg>() }
    var inputText by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    val timeFormat = remember { SimpleDateFormat("HH:mm", Locale.getDefault()) }

    fun addBotMessage(text: String) {
        messages.add(
            StoreChatMsg(
                id = System.currentTimeMillis().toString(),
                text = text,
                isUser = false,
                timestamp = timeFormat.format(Date())
            )
        )
    }

    fun addUserMessage(text: String) {
        messages.add(
            StoreChatMsg(
                id = System.currentTimeMillis().toString(),
                text = text,
                isUser = true,
                timestamp = timeFormat.format(Date())
            )
        )
    }

    fun sendMessage(text: String) {
        if (text.isBlank() || isLoading) return
        addUserMessage(text.trim())
        inputText = ""
        isLoading = true
        scope.launch {
            try {
                val response = ApiClient.sendStoreChat(
                    storeId = storeId,
                    message = text.trim(),
                    productName = productName ?: "",
                    userName = ""
                )
                addBotMessage(response.reply)
            } catch (e: Exception) {
                addBotMessage("Lo sentimos, ocurrio un error. Intenta de nuevo.")
            }
            isLoading = false
        }
    }

    LaunchedEffect(storeId) {
        val welcome = if (productName != null) {
            "Hola! Bienvenido a $storeName. Soy tu asistente virtual. Como puedo ayudarte con $productName?"
        } else {
            "Hola! Bienvenido a $storeName. Soy tu asistente virtual. Como puedo ayudarte hoy?"
        }
        addBotMessage(welcome)
    }

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AsyncImage(
                            model = storeLogo,
                            contentDescription = storeName,
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(UnikoBlue.copy(alpha = 0.1f))
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = storeName,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "En linea",
                                fontSize = 11.sp,
                                color = UnikoGreen
                            )
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { padding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp),
                state = listState,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(messages, key = { it.id }) { msg ->
                    if (msg.isUser) {
                        UserBubble(msg.text, msg.timestamp)
                    } else {
                        BotBubble(msg.text, msg.timestamp)
                    }
                }
                if (isLoading) {
                    item {
                        Row(
                            modifier = Modifier.padding(start = 12.dp, top = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp,
                                color = UnikoBlue
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Escribiendo...",
                                fontSize = 12.sp,
                                color = Color.Gray
                            )
                        }
                    }
                }
            }

            if (messages.isNotEmpty() && !isLoading) {
                val lastBotMsg = messages.lastOrNull { !it.isUser }
                if (lastBotMsg != null) {
                    QuickActions(
                        onAction = { sendMessage(it) }
                    )
                }
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("Escribe tu mensaje...") },
                    shape = RoundedCornerShape(24.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = UnikoBlue,
                        unfocusedBorderColor = Color.LightGray
                    ),
                    singleLine = true
                )
                Spacer(modifier = Modifier.width(8.dp))
                IconButton(
                    onClick = { sendMessage(inputText) },
                    enabled = inputText.isNotBlank() && !isLoading
                ) {
                    Icon(
                        Icons.AutoMirrored.Filled.Send,
                        contentDescription = "Enviar",
                        tint = if (inputText.isNotBlank()) UnikoOrange else Color.Gray,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun BotBubble(text: String, timestamp: String) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.Start
    ) {
        Row(verticalAlignment = Alignment.Top) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(UnikoBlue),
                contentAlignment = Alignment.Center
            ) {
                Text("AI", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Box(
                    modifier = Modifier
                        .background(
                            MaterialTheme.colorScheme.surfaceVariant,
                            RoundedCornerShape(topStart = 4.dp, topEnd = 16.dp, bottomStart = 16.dp, bottomEnd = 16.dp)
                        )
                        .padding(12.dp)
                ) {
                    Text(text = text, fontSize = 14.sp, lineHeight = 20.sp)
                }
                Text(
                    text = timestamp,
                    fontSize = 10.sp,
                    color = Color.Gray,
                    modifier = Modifier.padding(start = 4.dp, top = 2.dp)
                )
            }
        }
    }
}

@Composable
private fun UserBubble(text: String, timestamp: String) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.End
    ) {
        Box(
            modifier = Modifier
                .background(
                    UnikoOrange,
                    RoundedCornerShape(topStart = 16.dp, topEnd = 4.dp, bottomStart = 16.dp, bottomEnd = 16.dp)
                )
                .padding(12.dp)
                .widthIn(max = 280.dp)
        ) {
            Text(text = text, fontSize = 14.sp, color = Color.White, lineHeight = 20.sp)
        }
        Text(
            text = timestamp,
            fontSize = 10.sp,
            color = Color.Gray,
            modifier = Modifier.padding(end = 4.dp, top = 2.dp)
        )
    }
}

@Composable
private fun QuickActions(onAction: (String) -> Unit) {
    val actions = listOf(
        "Precio" to UnikoBlue,
        "Disponibilidad" to UnikoGreen,
        "Envios" to Color(0xFF66BB6A),
        "Garantia" to Color(0xFF7E57C2),
        "Hablar con representante" to UnikoOrange
    )
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 4.dp)
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            actions.take(3).forEach { (label, color) ->
                FilterChip(
                    selected = false,
                    onClick = { onAction(label) },
                    label = { Text(label, fontSize = 12.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        containerColor = color.copy(alpha = 0.1f),
                        labelColor = color
                    )
                )
            }
        }
        Spacer(modifier = Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            actions.drop(3).forEach { (label, color) ->
                FilterChip(
                    selected = false,
                    onClick = { onAction(label) },
                    label = { Text(label, fontSize = 12.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        containerColor = color.copy(alpha = 0.1f),
                        labelColor = color
                    )
                )
            }
        }
    }
}
