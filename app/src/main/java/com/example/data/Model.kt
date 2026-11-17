package com.example.data

import androidx.annotation.Keep
import com.google.firebase.Timestamp
import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.IgnoreExtraProperties
import com.google.firebase.firestore.ServerTimestamp

@Keep
@IgnoreExtraProperties
data class Product(
    @DocumentId val id: String = "",
    val name: String = "",
    val category: String = "",
    val price: Double = 0.0,
    val unit: String = "",
    val rating: Double = 4.8,
    val reviewCount: Long = 0L,
    val imageUrl: String = "",
    val description: String = "",
    val organic: Boolean = false,
    val nutritionInfo: String = "",
    val stockQuantity: Long = 0L,
    @ServerTimestamp val createdAt: Timestamp? = null,
    @ServerTimestamp val updatedAt: Timestamp? = null
)

@Keep
@IgnoreExtraProperties
data class CategoryItem(
    @DocumentId val id: String = "",
    val name: String = "",
    val imageUrl: String = "",
    val sortOrder: Long = 0L,
    @ServerTimestamp val createdAt: Timestamp? = null,
    @ServerTimestamp val updatedAt: Timestamp? = null
)

@Keep
@IgnoreExtraProperties
data class Offer(
    @DocumentId val id: String = "",
    val title: String = "",
    val description: String = "",
    val price: Double = 0.0,
    val originalPrice: Double? = null,
    val discountLabel: String = "",
    val imageUrl: String = "",
    val active: Boolean = true,
    @ServerTimestamp val createdAt: Timestamp? = null,
    @ServerTimestamp val updatedAt: Timestamp? = null
)

@Keep
@IgnoreExtraProperties
data class WalletAccount(
    val name: String = "",
    val accountNumber: String = "",
    val note: String = ""
)

@Keep
@IgnoreExtraProperties
data class CartContactChannel(
    val label: String = "",
    val value: String = ""
)

@Keep
@IgnoreExtraProperties
data class AppSettings(
    @DocumentId val id: String = "",
    val adminWhatsApp: String = "",
    val adminGmail: String = "",
    val wallets: List<WalletAccount> = emptyList(),
    val extraCartChannels: List<CartContactChannel> = emptyList(),
    @ServerTimestamp val updatedAt: Timestamp? = null
)

data class CartItem(
    val product: Product,
    val quantity: Int
)

enum class OrderStatus {
    CONFIRMED, PACKED, OUT_FOR_DELIVERY, DELIVERED;

    companion object {
        fun fromRaw(raw: String?): OrderStatus =
            entries.firstOrNull { it.name == raw } ?: CONFIRMED
    }
}

@Keep
@IgnoreExtraProperties
data class CustomerOrder(
    @DocumentId val id: String = "",
    val userId: String = "",
    val orderCode: String = "",
    val customerName: String = "",
    val deliveryAddress: String = "",
    val deliveryTimeSlot: String = "",
    val paymentMethod: String = "",
    val totalPrice: Double = 0.0,
    val status: String = OrderStatus.CONFIRMED.name,
    val itemsSummary: String = "",
    val itemCount: Long = 1L,
    @ServerTimestamp val createdAt: Timestamp? = null,
    @ServerTimestamp val updatedAt: Timestamp? = null
)

@Keep
@IgnoreExtraProperties
data class FavoriteItem(
    @DocumentId val id: String = "",
    val productId: String = "",
    @ServerTimestamp val createdAt: Timestamp? = null
)

data class Recipe(
    val id: String,
    val title: String,
    val description: String,
    val ingredients: List<String>,
    val prepTime: String,
    val calories: String,
    val instructions: List<String>
)

sealed interface UiState<out T> {
    data object Loading : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
}
