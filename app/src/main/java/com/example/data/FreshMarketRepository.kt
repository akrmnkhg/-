package com.example.data

import android.content.Context
import com.example.R
import com.google.firebase.Firebase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.auth
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreException
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.snapshots
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await

class FreshMarketRepository(
    private val db: FirebaseFirestore,
    private val auth: FirebaseAuth = Firebase.auth
) {
    constructor(context: Context) : this(
        FirebaseFirestore.getInstance(
            context.applicationContext.getString(R.string.firestore_database_id)
        )
    )

    private fun requireUserId(): String {
        return auth.currentUser?.uid?.takeIf { it.isNotBlank() }
            ?: throw IllegalStateException("User must be signed in with Google before accessing Firestore.")
    }

    fun observeProducts(): Flow<List<Product>> =
        db.collection("products")
            .snapshots()
            .map { snapshot ->
                snapshot.toObjects(Product::class.java, DocumentSnapshot.ServerTimestampBehavior.ESTIMATE)
            }
            .catch { error ->
                logAndRethrowIfNeeded(error, OperationType.LIST, "products", expectedUid = null)
            }

    fun observeCategories(): Flow<List<CategoryItem>> =
        db.collection("categories")
            .orderBy("sortOrder", Query.Direction.ASCENDING)
            .snapshots()
            .map { snapshot ->
                snapshot.toObjects(CategoryItem::class.java, DocumentSnapshot.ServerTimestampBehavior.ESTIMATE)
            }
            .catch { error ->
                logAndRethrowIfNeeded(error, OperationType.LIST, "categories", expectedUid = null)
            }

    fun observeOffers(): Flow<List<Offer>> =
        db.collection("offers")
            .snapshots()
            .map { snapshot ->
                snapshot.toObjects(Offer::class.java, DocumentSnapshot.ServerTimestampBehavior.ESTIMATE)
                    .filter { it.active }
            }
            .catch { error ->
                logAndRethrowIfNeeded(error, OperationType.LIST, "offers", expectedUid = null)
            }

    fun observeAppSettings(): Flow<AppSettings> =
        db.collection("settings")
            .document("app_config")
            .snapshots()
            .map { snapshot ->
                if (snapshot.exists()) {
                    snapshot.toObject(AppSettings::class.java, DocumentSnapshot.ServerTimestampBehavior.ESTIMATE)
                        ?: AppSettings()
                } else {
                    AppSettings()
                }
            }
            .catch { error ->
                logAndRethrowIfNeeded(error, OperationType.GET, "settings/app_config", expectedUid = null)
            }

    fun observeOrders(userId: String): Flow<List<CustomerOrder>> = flow {
        val uid = userId.takeIf { it.isNotBlank() } ?: requireUserId()
        val path = "users/$uid/orders"
        db.collection("users")
            .document(uid)
            .collection("orders")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .snapshots()
            .map { snapshot ->
                snapshot.toObjects(CustomerOrder::class.java, DocumentSnapshot.ServerTimestampBehavior.ESTIMATE)
            }
            .catch { error ->
                logAndRethrowIfNeeded(error, OperationType.LIST, path, expectedUid = uid)
            }
            .collect { emit(it) }
    }

    fun observeFavoriteIds(userId: String): Flow<Set<String>> = flow {
        val uid = userId.takeIf { it.isNotBlank() } ?: requireUserId()
        val path = "users/$uid/favorites"
        db.collection("users")
            .document(uid)
            .collection("favorites")
            .snapshots()
            .map { snapshot ->
                snapshot.documents.mapNotNull { doc ->
                    doc.getString("productId")?.takeIf { it.isNotBlank() } ?: doc.id
                }.toSet()
            }
            .catch { error ->
                logAndRethrowIfNeeded(error, OperationType.LIST, path, expectedUid = uid)
            }
            .collect { emit(it) }
    }

    suspend fun toggleFavorite(userId: String, productId: String, currentlyFavorite: Boolean): Result<Unit> {
        val uid = auth.currentUser?.uid
        val path = "users/${uid ?: "unauthenticated"}/favorites/$productId"
        return try {
            val verifiedUid = requireUserId()
            check(verifiedUid == userId) { "Signed-in user changed; refusing cross-user write." }
            require(productId.isNotBlank() && productId.matches(Regex("^[a-zA-Z0-9_\\-]+$"))) {
                "Invalid product ID"
            }
            val docRef = db.collection("users")
                .document(verifiedUid)
                .collection("favorites")
                .document(productId)
            if (currentlyFavorite) {
                docRef.delete().await()
            } else {
                docRef.set(
                    mapOf(
                        "productId" to productId,
                        "createdAt" to FieldValue.serverTimestamp()
                    )
                ).await()
            }
            Result.success(Unit)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            handleFirestoreError(e, if (currentlyFavorite) OperationType.DELETE else OperationType.CREATE, path)
            Result.failure(e)
        }
    }

    suspend fun placeOrder(
        userId: String,
        customerName: String,
        deliveryAddress: String,
        deliveryTimeSlot: String,
        paymentMethod: String,
        cartItems: List<CartItem>,
        deliveryFee: Double = 2.99
    ): Result<CustomerOrder> {
        val uid = auth.currentUser?.uid
        val basePath = "users/${uid ?: "unauthenticated"}/orders"
        return try {
            val verifiedUid = requireUserId()
            check(verifiedUid == userId) { "Signed-in user changed; refusing cross-user write." }
            require(cartItems.isNotEmpty()) { "Basket cannot be empty" }
            require(deliveryAddress.trim().length in 1..300) { "Delivery address is required (max 300 chars)" }
            require(deliveryTimeSlot.trim().length in 1..100) { "Delivery time slot is required" }
            require(paymentMethod.trim().length in 1..100) { "Payment method is required" }

            val itemCount = cartItems.sumOf { it.quantity }.toLong().coerceIn(1L, 1000L)
            val subtotal = cartItems.sumOf { it.product.price * it.quantity }
            val totalPrice = subtotal + deliveryFee
            val itemsSummary = cartItems
                .joinToString("\n") { "${it.quantity}x ${it.product.name} ($${String.format("%.2f", it.product.price * it.quantity)})" }
                .take(2000)

            val docRef = db.collection("users")
                .document(verifiedUid)
                .collection("orders")
                .document()
            val orderCode = "FM-${System.currentTimeMillis().toString().takeLast(6)}"

            val payload = mapOf(
                "userId" to verifiedUid,
                "orderCode" to orderCode,
                "customerName" to customerName.take(120),
                "deliveryAddress" to deliveryAddress.trim().take(300),
                "deliveryTimeSlot" to deliveryTimeSlot.trim().take(100),
                "paymentMethod" to paymentMethod.trim().take(100),
                "totalPrice" to totalPrice,
                "status" to OrderStatus.CONFIRMED.name,
                "itemsSummary" to itemsSummary,
                "itemCount" to itemCount,
                "createdAt" to FieldValue.serverTimestamp(),
                "updatedAt" to FieldValue.serverTimestamp()
            )
            docRef.set(payload).await()

            Result.success(
                CustomerOrder(
                    id = docRef.id,
                    userId = verifiedUid,
                    orderCode = orderCode,
                    customerName = customerName.take(120),
                    deliveryAddress = deliveryAddress.trim(),
                    deliveryTimeSlot = deliveryTimeSlot.trim(),
                    paymentMethod = paymentMethod.trim(),
                    totalPrice = totalPrice,
                    status = OrderStatus.CONFIRMED.name,
                    itemsSummary = itemsSummary,
                    itemCount = itemCount
                )
            )
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            handleFirestoreError(e, OperationType.CREATE, basePath)
            Result.failure(e)
        }
    }

    private fun logAndRethrowIfNeeded(
        error: Throwable,
        operationType: OperationType,
        path: String,
        expectedUid: String?
    ): Nothing {
        val firestoreError = generateSequence(error) { it.cause }
            .filterIsInstance<FirebaseFirestoreException>()
            .firstOrNull()
        if (firestoreError == null && error is CancellationException) throw error
        val exceptionToLog = firestoreError ?: (error as? Exception)
        if (exceptionToLog != null && (expectedUid == null || auth.currentUser?.uid == expectedUid)) {
            handleFirestoreError(exceptionToLog, operationType, path)
        }
        throw error
    }
}
