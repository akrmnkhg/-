package com.example.ui.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.AppSettings
import com.example.data.CartItem
import com.example.data.CategoryItem
import com.example.data.CustomerOrder
import com.example.data.FreshMarketRepository
import com.example.data.Offer
import com.example.data.Product
import com.example.data.Recipe
import com.example.data.UiState
import com.google.firebase.Firebase
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.Schema
import com.google.firebase.ai.type.generationConfig
import com.google.firebase.firestore.FirebaseFirestoreException
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import org.json.JSONObject

class FreshMarketViewModel(
    private val repository: FreshMarketRepository,
    private val currentUserId: String
) : ViewModel() {

    val productsState: StateFlow<UiState<List<Product>>> =
        repository.observeProducts()
            .toUiState("products")
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS), UiState.Loading)

    val categoriesState: StateFlow<UiState<List<CategoryItem>>> =
        repository.observeCategories()
            .toUiState("categories")
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS), UiState.Loading)

    val offersState: StateFlow<UiState<List<Offer>>> =
        repository.observeOffers()
            .toUiState("offers")
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS), UiState.Loading)

    val settingsState: StateFlow<UiState<AppSettings>> =
        repository.observeAppSettings()
            .toUiState("settings")
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS), UiState.Loading)

    val ordersState: StateFlow<UiState<List<CustomerOrder>>> =
        repository.observeOrders(currentUserId)
            .toUiState("orders")
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS), UiState.Loading)

    val favoriteIdsState: StateFlow<Set<String>> =
        repository.observeFavoriteIds(currentUserId)
            .catch { error ->
                val firestoreError = unwrapFirestoreException(error)
                if (firestoreError == null && error is CancellationException) throw error
                Log.w(TAG, "Error observing favorites", firestoreError ?: error)
                emit(emptySet())
            }
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS), emptySet())

    private val _selectedCategory = MutableStateFlow("All")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()

    private val _checkoutStatus = MutableStateFlow<String?>(null)
    val checkoutStatus: StateFlow<String?> = _checkoutStatus.asStateFlow()

    private val _isPlacingOrder = MutableStateFlow(false)
    val isPlacingOrder: StateFlow<Boolean> = _isPlacingOrder.asStateFlow()

    private val _aiRecipeState = MutableStateFlow<UiState<List<Recipe>>?>(null)
    val aiRecipeState: StateFlow<UiState<List<Recipe>>?> = _aiRecipeState.asStateFlow()

    private val recipeSchema = Schema.obj(
        properties = mapOf(
            "title" to Schema.string(description = "Recipe title"),
            "description" to Schema.string(description = "Short appetizing summary"),
            "prepTime" to Schema.string(description = "Preparation time e.g. 20 mins"),
            "calories" to Schema.string(description = "Estimated calories e.g. 320 kcal"),
            "ingredients" to Schema.array(items = Schema.string(), description = "List of ingredients"),
            "instructions" to Schema.array(items = Schema.string(), description = "Step-by-step instructions")
        )
    )

    private val recipeModel by lazy {
        Firebase.ai.generativeModel(
            modelName = "gemini-3.8-flash",
            generationConfig = generationConfig {
                responseMimeType = "application/json"
                responseSchema = recipeSchema
            }
        )
    }

    fun selectCategory(category: String) {
        _selectedCategory.value = category
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun clearCheckoutStatus() {
        _checkoutStatus.value = null
    }

    fun toggleFavorite(productId: String) {
        val currentlyFav = favoriteIdsState.value.contains(productId)
        viewModelScope.launch {
            repository.toggleFavorite(currentUserId, productId, currentlyFav)
        }
    }

    fun addToCart(product: Product, quantity: Int = 1) {
        _cartItems.update { current ->
            val existing = current.find { it.product.id == product.id }
            if (existing != null) {
                current.map {
                    if (it.product.id == product.id) it.copy(quantity = it.quantity + quantity) else it
                }
            } else {
                current + CartItem(product, quantity)
            }
        }
    }

    fun updateCartQuantity(productId: String, delta: Int) {
        _cartItems.update { current ->
            current.mapNotNull { item ->
                if (item.product.id == productId) {
                    val newQty = item.quantity + delta
                    if (newQty > 0) item.copy(quantity = newQty) else null
                } else {
                    item
                }
            }
        }
    }

    fun clearCart() {
        _cartItems.value = emptyList()
    }

    fun placeOrder(
        customerName: String,
        address: String,
        timeSlot: String,
        paymentMethod: String,
        onSuccess: () -> Unit
    ) {
        val items = _cartItems.value
        if (items.isEmpty()) return
        viewModelScope.launch {
            _isPlacingOrder.value = true
            _checkoutStatus.value = null
            val result = repository.placeOrder(
                userId = currentUserId,
                customerName = customerName,
                deliveryAddress = address,
                deliveryTimeSlot = timeSlot,
                paymentMethod = paymentMethod,
                cartItems = items
            )
            _isPlacingOrder.value = false
            result.onSuccess {
                clearCart()
                onSuccess()
            }.onFailure { err ->
                _checkoutStatus.value = err.localizedMessage ?: "Failed to place order."
            }
        }
    }

    fun generateAiRecipes() {
        viewModelScope.launch {
            _aiRecipeState.value = UiState.Loading
            try {
                val cartNames = _cartItems.value.joinToString(", ") { it.product.name }
                val catalogNames = (productsState.value as? UiState.Success)?.data
                    ?.take(6)
                    ?.joinToString(", ") { it.name }
                    .orEmpty()
                val sourceIngredients = cartNames.ifBlank { catalogNames.ifBlank { "fresh organic vegetables and fruits" } }

                val prompt = "Create one healthy, delicious recipe using these Fresh Market ingredients: $sourceIngredients."
                val response = withTimeout(60_000L) {
                    recipeModel.generateContent(prompt)
                }
                val jsonString = response.text ?: throw IllegalStateException("Model returned an empty response.")
                val json = JSONObject(jsonString)
                val ingredientsArr = json.getJSONArray("ingredients")
                val instructionsArr = json.getJSONArray("instructions")

                val recipe = Recipe(
                    id = "ai-${System.currentTimeMillis()}",
                    title = json.getString("title"),
                    description = json.getString("description"),
                    ingredients = (0 until ingredientsArr.length()).map { ingredientsArr.getString(it) },
                    prepTime = json.getString("prepTime"),
                    calories = json.getString("calories"),
                    instructions = (0 until instructionsArr.length()).map { instructionsArr.getString(it) }
                )
                _aiRecipeState.value = UiState.Success(listOf(recipe))
            } catch (e: TimeoutCancellationException) {
                Log.e(TAG, "AI generation timed out", e)
                _aiRecipeState.value = UiState.Error("Recipe generation timed out after 60 seconds. Please try again.")
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Firebase AI generation failed", e)
                _aiRecipeState.value = UiState.Error(e.localizedMessage ?: "Failed to generate recipe.")
            }
        }
    }

    private fun <T> Flow<T>.toUiState(streamName: String): Flow<UiState<T>> =
        this.map<T, UiState<T>> { UiState.Success(it) }
            .catch { error ->
                val firestoreError = unwrapFirestoreException(error)
                if (firestoreError == null && error is CancellationException) throw error
                val rootError = firestoreError ?: error
                Log.w(TAG, "Error observing $streamName", rootError)
                emit(UiState.Error(rootError.message ?: "Failed to load $streamName"))
            }

    private fun unwrapFirestoreException(error: Throwable): FirebaseFirestoreException? =
        generateSequence(error) { it.cause }
            .filterIsInstance<FirebaseFirestoreException>()
            .firstOrNull()

    private companion object {
        const val TAG = "FreshMarketVM"
        const val STOP_TIMEOUT_MILLIS = 5000L
    }
}
