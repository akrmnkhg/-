const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const { test, before, after, beforeEach } = require("node:test");
const fs = require("node:fs");

let testEnv;
const PROJECT_ID = process.env.GCP_PROJECT || "demo-no-project";
const ADMIN_UID = "admin_uid_001";
const ADMIN_EMAIL = "saakkrrmm@gmail.com";
const CUSTOMER_UID = "customer_alice_123";
const OTHER_CUSTOMER_UID = "customer_bob_456";

const [emulatorHost, emulatorPortStr] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8085").split(":");
const emulatorPort = parseInt(emulatorPortStr, 10);

before(async () => {
  const rules = fs.readFileSync("./firestore.rules", "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: emulatorHost,
      port: emulatorPort,
    },
  });
});

after(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

function adminContext() {
  return testEnv.authenticatedContext(ADMIN_UID, {
    email: ADMIN_EMAIL,
    email_verified: true,
  });
}

function unverifiedAdminSpoofContext() {
  return testEnv.authenticatedContext("spoof_uid", {
    email: ADMIN_EMAIL,
    email_verified: false,
  });
}

test("Customers and public: can read products, categories, offers, settings but CANNOT write", async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const past = new Date(Date.now() - 5000);
    await db.collection("products").doc("p1").set({
      name: "Organic Hass Avocados",
      category: "Fruits",
      price: 4.99,
      unit: "pack of 4",
      organic: true,
      stockQuantity: 45,
      createdAt: past,
      updatedAt: past,
    });
    await db.collection("settings").doc("app_config").set({
      adminWhatsApp: "+967770000000",
      adminGmail: ADMIN_EMAIL,
      wallets: [{ name: "Kuraimi", accountNumber: "123456", note: "Main" }],
      extraCartChannels: [{ label: "Telegram", value: "@freshmarket" }],
      updatedAt: past,
    });
  });

  const customerDb = testEnv.authenticatedContext(CUSTOMER_UID, {
    email: "alice@example.com",
    email_verified: true,
  }).firestore();

  // Read-only allowed
  await assertSucceeds(customerDb.collection("products").get());
  await assertSucceeds(customerDb.collection("products").doc("p1").get());
  await assertSucceeds(customerDb.collection("categories").get());
  await assertSucceeds(customerDb.collection("offers").get());
  await assertSucceeds(customerDb.collection("settings").doc("app_config").get());

  // Customer write/tamper rejected
  const now = new Date(Date.now() - 1000);
  await assertFails(
    customerDb.collection("products").doc("p1").update({
      price: 0.01,
      updatedAt: now,
    })
  );
  await assertFails(
    customerDb.collection("settings").doc("app_config").update({
      adminWhatsApp: "+10000000",
      updatedAt: now,
    })
  );
  await assertFails(
    customerDb.collection("offers").doc("o1").set({
      title: "Fake Free Offer",
      description: "Free",
      price: 0,
      active: true,
      createdAt: now,
      updatedAt: now,
    })
  );
});

test("Email spoofing with email_verified=false is rejected for admin writes", async () => {
  const spoofDb = unverifiedAdminSpoofContext().firestore();
  const now = new Date(Date.now() - 1000);

  await assertFails(
    spoofDb.collection("products").doc("p_spoof").set({
      name: "Spoof Item",
      category: "Fruits",
      price: 1.0,
      unit: "1kg",
      organic: true,
      stockQuantity: 10,
      createdAt: now,
      updatedAt: now,
    })
  );
});

test("Verified Admin: can create, update, and delete products, categories, offers, and settings", async () => {
  const adminDb = adminContext().firestore();
  const created = new Date(Date.now() - 5000);
  const updated = new Date(Date.now() - 1000);

  // Create Product
  await assertSucceeds(
    adminDb.collection("products").doc("prod_1").set({
      name: "Honeycrisp Apples",
      category: "Fruits",
      price: 3.99,
      unit: "per kg",
      rating: 4.9,
      reviewCount: 210,
      imageUrl: "https://example.com/apple.jpg",
      description: "Fresh crisp apples",
      organic: false,
      nutritionInfo: "52 kcal",
      stockQuantity: 120,
      createdAt: created,
      updatedAt: created,
    })
  );

  // Partial update Product price & imageUrl
  await assertSucceeds(
    adminDb.collection("products").doc("prod_1").update({
      price: 4.5,
      imageUrl: "https://example.com/apple_new.jpg",
      updatedAt: updated,
    })
  );

  // Ghost field rejected
  await assertFails(
    adminDb.collection("products").doc("prod_1").update({
      ghostField: "hack",
      updatedAt: updated,
    })
  );

  // Category CRUD
  await assertSucceeds(
    adminDb.collection("categories").doc("cat_fruits").set({
      name: "Fruits",
      imageUrl: "",
      sortOrder: 1,
      createdAt: created,
      updatedAt: created,
    })
  );

  // Offer CRUD
  await assertSucceeds(
    adminDb.collection("offers").doc("offer_1").set({
      title: "Weekend Organic Basket",
      description: "Save 20% on organic greens",
      price: 19.99,
      originalPrice: 24.99,
      discountLabel: "20% OFF",
      imageUrl: "",
      active: true,
      createdAt: created,
      updatedAt: created,
    })
  );

  // Settings update (Wallets, WhatsApp, Gmail, Extra Channels)
  await assertSucceeds(
    adminDb.collection("settings").doc("app_config").set({
      adminWhatsApp: "+967771234567",
      adminGmail: ADMIN_EMAIL,
      wallets: [
        { name: "Kuraimi Bank", accountNumber: "300112233", note: "SAR/YER" },
        { name: "Jawwal Pay", accountNumber: "770011223", note: "Instant" },
      ],
      extraCartChannels: [
        { label: "Direct Call", value: "770011223" },
        { label: "Support Email", value: ADMIN_EMAIL },
      ],
      updatedAt: updated,
    })
  );
});

test("Customer orders and favorites: strictly isolated per user", async () => {
  const aliceDb = testEnv.authenticatedContext(CUSTOMER_UID).firestore();
  const bobDb = testEnv.authenticatedContext(OTHER_CUSTOMER_UID).firestore();
  const now = new Date(Date.now() - 1000);

  await assertSucceeds(
    aliceDb.collection("users").doc(CUSTOMER_UID).collection("orders").doc("ord_1").set({
      userId: CUSTOMER_UID,
      orderCode: "FM-1001",
      customerName: "Alice",
      deliveryAddress: "123 Green Valley",
      deliveryTimeSlot: "2:00 PM - 4:00 PM",
      paymentMethod: "Kuraimi Bank",
      totalPrice: 15.98,
      status: "CONFIRMED",
      itemsSummary: "2x Organic Hass Avocados",
      itemCount: 2,
      createdAt: now,
      updatedAt: now,
    })
  );

  await assertSucceeds(
    aliceDb.collection("users").doc(CUSTOMER_UID).collection("orders").get()
  );

  // Bob cannot read or write Alice's orders
  await assertFails(
    bobDb.collection("users").doc(CUSTOMER_UID).collection("orders").get()
  );
  await assertFails(
    bobDb.collection("users").doc(CUSTOMER_UID).collection("orders").doc("ord_1").get()
  );

  // Customer cannot self-escalate order status to DELIVERED on create
  await assertFails(
    aliceDb.collection("users").doc(CUSTOMER_UID).collection("orders").doc("ord_2").set({
      userId: CUSTOMER_UID,
      orderCode: "FM-1002",
      deliveryAddress: "123 Green Valley",
      deliveryTimeSlot: "2:00 PM - 4:00 PM",
      paymentMethod: "Cash",
      totalPrice: 10.0,
      status: "DELIVERED",
      itemsSummary: "1x Apples",
      itemCount: 1,
      createdAt: now,
      updatedAt: now,
    })
  );

  // Favorites
  await assertSucceeds(
    aliceDb.collection("users").doc(CUSTOMER_UID).collection("favorites").doc("prod_1").set({
      productId: "prod_1",
      createdAt: now,
    })
  );
  await assertFails(
    bobDb.collection("users").doc(CUSTOMER_UID).collection("favorites").doc("prod_1").delete()
  );
});

test("Admin registry: verified bootstrap admin can register UID; attackers cannot", async () => {
  const bootstrapDb = adminContext().firestore();
  const aliceDb = testEnv.authenticatedContext(CUSTOMER_UID, {
    email: "alice@example.com",
    email_verified: true,
  }).firestore();
  const now = new Date(Date.now() - 1000);

  // Attacker cannot self-register as admin
  await assertFails(
    aliceDb.collection("admins").doc(CUSTOMER_UID).set({
      email: "alice@example.com",
      createdAt: now,
    })
  );

  // Bootstrap admin can register own UID before changing email
  await assertSucceeds(
    bootstrapDb.collection("admins").doc(ADMIN_UID).set({
      email: ADMIN_EMAIL,
      createdAt: now,
    })
  );

  // After email changes to new gmail, UID entry in /admins/{uid} still grants admin write
  const rotatedAdminDb = testEnv.authenticatedContext(ADMIN_UID, {
    email: "newadmin@gmail.com",
    email_verified: true,
  }).firestore();
  await assertSucceeds(
    rotatedAdminDb.collection("categories").doc("cat_rotated").set({
      name: "Spices",
      imageUrl: "",
      sortOrder: 3,
      createdAt: now,
      updatedAt: now,
    })
  );
});

