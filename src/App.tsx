import React, { useState, useMemo, useEffect } from 'react';
import {
  CategoryType,
  Product,
  CartItem,
  DeliveryAddress,
  Order,
  WalletConfig,
  WalletType,
  Offer,
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_WALLETS,
  SPECIAL_OFFERS,
  DEFAULT_ADDRESSES,
  CATEGORIES_CONFIG,
} from './data/mockData';
import { DeviceFrame } from './components/DeviceFrame';
import { Header } from './components/Header';
import { CategoriesNav } from './components/CategoriesNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartView } from './components/CartView';
import { OffersView } from './components/OffersView';
import { CategoriesView } from './components/CategoriesView';
import { ProfileView } from './components/ProfileView';
import { BottomNav, NavTab } from './components/BottomNav';
import { AddressModal } from './components/AddressModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminPanel } from './components/AdminPanel';
import { HomeHeroBanner } from './components/HomeHeroBanner';
import {
  ChevronLeft,
  Flame,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  // Navigation & Category state
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubFilter, setActiveSubFilter] = useState<string>('all');

  // Currency
  const [currency, setCurrency] = useState<'ر.ي' | 'ر.س' | '$'>('ر.ي');

  // Products with localStorage persistence (v2 for 5 departments)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('aljamal_products_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Wallets with localStorage persistence
  const [wallets, setWallets] = useState<WalletConfig[]>(() => {
    const saved = localStorage.getItem('aljamal_wallets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_WALLETS;
      }
    }
    return INITIAL_WALLETS;
  });

  // Special Offer Slots (default 4 items: 3 to 4 slots controlled by Manager)
  const [maxOfferSlots, setMaxOfferSlots] = useState<number>(() => {
    const saved = localStorage.getItem('aljamal_offer_slots');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) return parsed;
    }
    return 4;
  });

  useEffect(() => {
    localStorage.setItem('aljamal_offer_slots', maxOfferSlots.toString());
  }, [maxOfferSlots]);

  // Promotional Offers with localStorage persistence
  const [offers, setOffers] = useState<Offer[]>(() => {
    const saved = localStorage.getItem('aljamal_offers_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return SPECIAL_OFFERS;
      }
    }
    return SPECIAL_OFFERS;
  });

  useEffect(() => {
    localStorage.setItem('aljamal_offers_v2', JSON.stringify(offers));
  }, [offers]);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(['loc-fruit-1', 'veg-1']);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: INITIAL_PRODUCTS[0], // رمان صعدي بلدي
      selectedWeight: INITIAL_PRODUCTS[0].weightOptions[0],
      quantity: 1,
    },
    {
      product: INITIAL_PRODUCTS[12] || INITIAL_PRODUCTS[0], // طماطم بلدي
      selectedWeight: (INITIAL_PRODUCTS[12] || INITIAL_PRODUCTS[0]).weightOptions[0],
      quantity: 1,
    },
  ]);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(DEFAULT_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress>(
    DEFAULT_ADDRESSES[0]
  );

  // Orders with localStorage persistence
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('aljamal_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // default fallback
      }
    }
    return [
      {
        id: 'JM-7821',
        date: 'منذ يومين',
        items: [
          {
            product: INITIAL_PRODUCTS[0],
            selectedWeight: { label: '1 كجم', multiplier: 1 },
            quantity: 2,
          },
        ],
        subtotal: 56,
        deliveryFee: 10,
        discount: 0,
        total: 66,
        address: DEFAULT_ADDRESSES[0],
        status: 'delivered',
        paymentMethod: 'محفظة جيب (رمز النقطة: JEEB-99420)',
        walletType: 'jeeb',
        walletPointCode: 'JEEB-99420',
        transactionReference: 'TRX-882094',
        deliveryTimeSlot: 'الفترة المسائية',
      },
    ];
  });
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Persist products when changed
  useEffect(() => {
    localStorage.setItem('aljamal_products_v2', JSON.stringify(products));
  }, [products]);

  // Persist wallets when changed
  useEffect(() => {
    localStorage.setItem('aljamal_wallets', JSON.stringify(wallets));
  }, [wallets]);

  // Persist orders when changed
  useEffect(() => {
    localStorage.setItem('aljamal_orders', JSON.stringify(orders));
  }, [orders]);

  // Currency toggle helper
  const handleToggleCurrency = () => {
    setCurrency((prev) => (prev === 'ر.ي' ? 'ر.س' : prev === 'ر.س' ? '$' : 'ر.ي'));
  };

  // Add to cart handler
  const handleAddToCart = (
    product: Product,
    selectedWeight?: { label: string; multiplier: number },
    qty = 1
  ) => {
    const weightToUse =
      selectedWeight || product.weightOptions[0] || { label: '1 كجم', multiplier: 1 };

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedWeight.label === weightToUse.label
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += qty;
        return copy;
      } else {
        return [
          ...prev,
          {
            product,
            selectedWeight: weightToUse,
            quantity: qty,
          },
        ];
      }
    });
  };

  // Update quantity handler
  const handleUpdateCartQuantity = (
    productId: string,
    delta: number,
    weightLabel?: string
  ) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (
            item.product.id === productId &&
            (!weightLabel || item.selectedWeight.label === weightLabel)
          ) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveCartItem = (productId: string, weightLabel?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            (!weightLabel || item.selectedWeight.label === weightLabel)
          )
      )
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Toggle favorite
  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Add new address
  const handleAddAddress = (newAddr: Omit<DeliveryAddress, 'id'>) => {
    const created: DeliveryAddress = {
      ...newAddr,
      id: `addr-${Date.now()}`,
    };
    setAddresses((prev) => [created, ...prev]);
    setSelectedAddress(created);
  };

  // Checkout submission
  const handleCheckoutSuccess = (orderData: {
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    address: DeliveryAddress;
    paymentMethod: string;
    walletType?: WalletType;
    walletPointCode?: string;
    transactionReference?: string;
    deliveryTimeSlot: string;
  }) => {
    const newOrder: Order = {
      id: `JM-${Math.floor(1000 + Math.random() * 9000)}`,
      date: 'اليوم، منذ لحظات',
      items: orderData.items,
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      discount: orderData.discount,
      total: orderData.total,
      address: orderData.address,
      status: 'preparing',
      paymentMethod: orderData.paymentMethod,
      walletType: orderData.walletType,
      walletPointCode: orderData.walletPointCode,
      transactionReference: orderData.transactionReference,
      deliveryTimeSlot: orderData.deliveryTimeSlot,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setPlacedOrder(newOrder);
    setCart([]);
  };

  // Admin Management Handlers
  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleUpdateWallet = (updatedWallet: WalletConfig) => {
    setWallets((prev) =>
      prev.map((w) => (w.id === updatedWallet.id ? updatedWallet : w))
    );
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
  };

  // Special Offer Slots Handlers (زيادة وتنقيص خانات العروض والتبديل)
  const handleUpdateOfferSlots = (slots: number) => {
    const clamped = Math.max(1, Math.min(12, slots));
    setMaxOfferSlots(clamped);
  };

  const handleToggleSpecialOffer = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, isSpecialOffer: !p.isSpecialOffer } : p
      )
    );
  };

  // Promotional Offers Handlers (إدارة العروض الترويجية والأسعار والصور من الاستديو)
  const handleAddOffer = (newOffer: Offer) => {
    setOffers((prev) => [newOffer, ...prev]);
  };

  const handleUpdateOffer = (updatedOffer: Offer) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === updatedOffer.id ? updatedOffer : o))
    );
  };

  const handleDeleteOffer = (offerId: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
  };

  // Special Offer Products limited to maxOfferSlots (3 to 4 items)
  const specialOfferProducts = useMemo(() => {
    return products.filter((p) => p.isSpecialOffer).slice(0, maxOfferSlots);
  }, [products, maxOfferSlots]);

  // Filter products by category, search query, and subfilter
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      if (activeCategory !== 'all' && p.category !== activeCategory) {
        return false;
      }
      // Sub-filter match
      if (activeSubFilter !== 'all') {
        if (activeSubFilter === 'popular' && !p.isPopular) return false;
        if (activeSubFilter === 'organic' && !p.isOrganic) return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchAr = p.arabicName.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchCat = p.categoryLabel.toLowerCase().includes(query);
        const matchOrigin = p.origin.toLowerCase().includes(query);
        return matchName || matchAr || matchDesc || matchCat || matchOrigin;
      }
      return true;
    });
  }, [products, activeCategory, activeSubFilter, searchQuery]);

  // Total cart items counter
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <DeviceFrame>
      {/* Top Header with quick Admin Access */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAddress={selectedAddress}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
        currency={currency}
        onToggleCurrency={handleToggleCurrency}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Content Area */}
      <main className="p-3">
        {/* TAB 1: HOME (الرئيسية) */}
        {activeTab === 'home' && (
          <div className="space-y-4 pb-24">
            {/* Official Store Emblem & Identity Banner */}
            {searchQuery.trim() === '' && activeCategory === 'all' && (
              <HomeHeroBanner
                onOpenAddressModal={() => setIsAddressModalOpen(true)}
                onExploreOffers={() => setActiveTab('offers')}
              />
            )}

            {/* Quick Horizontal Category Navigation Pills */}
            <div className="bg-white rounded-2xl p-2.5 border border-stone-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-black text-stone-900">
                  {activeCategory === 'all'
                    ? 'أقسام المتجر الخمسة'
                    : CATEGORIES_CONFIG.find((c) => c.id === activeCategory)?.name}
                </span>
                {activeCategory !== 'all' ? (
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setActiveSubFilter('all');
                    }}
                    className="text-[11px] text-emerald-800 font-bold hover:underline cursor-pointer"
                  >
                    عرض كل الأقسام
                  </button>
                ) : (
                  <span className="text-[10px] text-stone-400 font-bold">
                    ٥ أقسام طازجة
                  </span>
                )}
              </div>

              <CategoriesNav
                activeCategory={activeCategory}
                onSelectCategory={(cat) => {
                  setActiveCategory(cat);
                  setActiveSubFilter('all');
                }}
              />
            </div>

            {/* ================= SCENARIO A: SEARCH ACTIVE ================= */}
            {searchQuery.trim() !== '' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-stone-900">
                    نتائج البحث عن "{searchQuery}":
                  </h3>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-bold">
                    {filteredProducts.length} صنف
                  </span>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-white rounded-2xl border border-stone-200">
                    <p className="text-sm font-bold text-stone-700">
                      لم يتم العثور على منتجات مطابقة لـ "{searchQuery}"
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-3 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 cursor-pointer"
                    >
                      مسح البحث
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {filteredProducts.map((prod) => {
                      const cartItem = cart.find((i) => i.product.id === prod.id);
                      const cartQty = cartItem ? cartItem.quantity : 0;
                      return (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          currency={currency}
                          cartQuantity={cartQty}
                          onAddToCart={(p) => handleAddToCart(p)}
                          onUpdateQuantity={(pid, delta) =>
                            handleUpdateCartQuantity(pid, delta)
                          }
                          onOpenDetails={(p) => setSelectedProduct(p)}
                          isFavorite={favorites.includes(prod.id)}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ) : activeCategory !== 'all' ? (
              /* ================= SCENARIO B: SINGLE DEPARTMENT VIEW ================= */
              <div className="space-y-3">
                {(() => {
                  const currentCat = CATEGORIES_CONFIG.find((c) => c.id === activeCategory);
                  return (
                    <div className="bg-gradient-to-l from-emerald-950 to-emerald-900 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                            {currentCat?.numberTag}
                          </span>
                          <span className="text-xs text-emerald-300 font-bold">
                            {currentCat?.badge || 'طازج يومياً'}
                          </span>
                        </div>
                        <h2 className="text-base font-black">{currentCat?.name}</h2>
                        <p className="text-[11px] text-emerald-200 mt-0.5">
                          {currentCat?.sub}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveCategory('all');
                          setActiveSubFilter('all');
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        عرض كل الأقسام
                      </button>
                    </div>
                  );
                })()}

                {/* Sub-filters (All, Popular, Organic) */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setActiveSubFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all text-[11px] cursor-pointer ${
                      activeSubFilter === 'all'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setActiveSubFilter('popular')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all text-[11px] flex items-center gap-1 cursor-pointer ${
                      activeSubFilter === 'popular'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>الأكثر طلباً</span>
                  </button>
                  <button
                    onClick={() => setActiveSubFilter('organic')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all text-[11px] flex items-center gap-1 cursor-pointer ${
                      activeSubFilter === 'organic'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>طبيعي / بلدي</span>
                  </button>
                </div>

                {/* Filtered Products Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {filteredProducts.map((prod) => {
                    const cartItem = cart.find((i) => i.product.id === prod.id);
                    const cartQty = cartItem ? cartItem.quantity : 0;
                    return (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        currency={currency}
                        cartQuantity={cartQty}
                        onAddToCart={(p) => handleAddToCart(p)}
                        onUpdateQuantity={(pid, delta) =>
                          handleUpdateCartQuantity(pid, delta)
                        }
                        onOpenDetails={(p) => setSelectedProduct(p)}
                        isFavorite={favorites.includes(prod.id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ================= SCENARIO C: REORGANIZED MAIN PAGE (الرئيسية) ================= */
              <div className="space-y-6">
                {/* 1. SPECIAL OFFERS SECTION: Exactly 3 to 4 items (controlled by manager) */}
                <div className="bg-gradient-to-b from-amber-500/10 via-amber-50/40 to-white rounded-3xl p-3.5 border-2 border-amber-300 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-xs">
                        <Flame className="w-5 h-5 fill-stone-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-black text-stone-900">
                            العروض الخاصة الحصرية
                          </h3>
                          <span className="bg-amber-400 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                            {specialOfferProducts.length} من {maxOfferSlots} خانات
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500">
                          أقوى عروض التوفير الطازجة المختارة اليوم
                        </p>
                      </div>
                    </div>

                    {/* Quick Manager Button to Adjust Offer Slots */}
                    <button
                      onClick={() => setIsAdminOpen(true)}
                      className="text-[10.5px] font-extrabold bg-amber-100 hover:bg-amber-200 text-amber-950 px-2.5 py-1.5 rounded-xl border border-amber-300/80 transition-all flex items-center gap-1 cursor-pointer"
                      title="التحكم في زيادة وتنقيص خانات العروض من لوحة المدير"
                    >
                      <span>تحكم الخانات</span>
                      <span className="text-[9px]">⚙️</span>
                    </button>
                  </div>

                  {/* 3 to 4 Special Offer Items Grid */}
                  {specialOfferProducts.length === 0 ? (
                    <div className="text-center py-6 px-4 bg-white/80 rounded-2xl border border-dashed border-amber-300">
                      <p className="text-xs font-bold text-amber-900">
                        لا توجد عروض مفعلة حالياً في الخانات
                      </p>
                      <button
                        onClick={() => setIsAdminOpen(true)}
                        className="mt-2 text-xs font-black text-amber-950 bg-amber-400 px-3 py-1.5 rounded-xl shadow-xs"
                      >
                        فتح لوحة تحكم المدير لإدراج أصناف العروض
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {specialOfferProducts.map((prod) => {
                        const cartItem = cart.find((i) => i.product.id === prod.id);
                        const cartQty = cartItem ? cartItem.quantity : 0;
                        return (
                          <div key={`special-offer-${prod.id}`} className="relative">
                            <ProductCard
                              product={prod}
                              currency={currency}
                              cartQuantity={cartQty}
                              onAddToCart={(p) => handleAddToCart(p)}
                              onUpdateQuantity={(pid, delta) =>
                                handleUpdateCartQuantity(pid, delta)
                              }
                              onOpenDetails={(p) => setSelectedProduct(p)}
                              isFavorite={favorites.includes(prod.id)}
                              onToggleFavorite={handleToggleFavorite}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. THE 5 DEPARTMENTS - EACH DEPARTMENT DISPLAYS ITS CONTENT DIRECTLY */}
                {CATEGORIES_CONFIG.filter((c) => c.id !== 'all').map((cat) => {
                  const deptProducts = products.filter((p) => p.category === cat.id);
                  if (deptProducts.length === 0) return null;

                  return (
                    <section
                      key={`dept-section-${cat.id}`}
                      className="bg-white rounded-3xl p-3.5 border border-stone-200/90 shadow-xs space-y-3"
                    >
                      {/* Department Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-lg shadow-xs">
                            {cat.numberTag}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-black text-stone-900">
                                {cat.name}
                              </h3>
                              {cat.badge && (
                                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200/60">
                                  {cat.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-400 line-clamp-1">
                              {cat.sub}
                            </p>
                          </div>
                        </div>

                        {/* View All of this department */}
                        <button
                          onClick={() => {
                            setActiveCategory(cat.id as CategoryType);
                            setActiveSubFilter('all');
                          }}
                          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 cursor-pointer shrink-0"
                        >
                          <span>عرض الكل ({deptProducts.length})</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Department Content: Products Grid */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {deptProducts.map((prod) => {
                          const cartItem = cart.find((i) => i.product.id === prod.id);
                          const cartQty = cartItem ? cartItem.quantity : 0;
                          return (
                            <ProductCard
                              key={prod.id}
                              product={prod}
                              currency={currency}
                              cartQuantity={cartQty}
                              onAddToCart={(p) => handleAddToCart(p)}
                              onUpdateQuantity={(pid, delta) =>
                                handleUpdateCartQuantity(pid, delta)
                              }
                              onOpenDetails={(p) => setSelectedProduct(p)}
                              isFavorite={favorites.includes(prod.id)}
                              onToggleFavorite={handleToggleFavorite}
                            />
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OFFERS (العروض) */}
        {activeTab === 'offers' && (
          <OffersView
            offers={offers}
            products={products}
            currency={currency}
            onAddToCart={(p) => handleAddToCart(p)}
            onOpenProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {/* TAB 3: CATEGORIES (التصنيفات) */}
        {activeTab === 'categories' && (
          <CategoriesView
            products={products}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              setActiveTab('home');
            }}
          />
        )}

        {/* TAB 4: CART & CHECKOUT (السلة) with Wallets Support */}
        {activeTab === 'cart' && (
          <CartView
            items={cart}
            currency={currency}
            wallets={wallets}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            selectedAddress={selectedAddress}
            onOpenAddressModal={() => setIsAddressModalOpen(true)}
            onCheckoutSuccess={handleCheckoutSuccess}
            onContinueShopping={() => setActiveTab('home')}
          />
        )}

        {/* TAB 5: PROFILE & ORDERS (حسابي) with Admin Portal */}
        {activeTab === 'profile' && (
          <ProfileView
            orders={orders}
            addresses={addresses}
            currency={currency}
            onSelectCurrency={(c) => setCurrency(c as any)}
            onOpenAddressModal={() => setIsAddressModalOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          currency={currency}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          allProducts={products}
          cartCount={totalCartCount}
          onOpenCart={() => {
            setSelectedProduct(null);
            setActiveTab('cart');
          }}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      )}

      {/* Address Switcher / Management Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={addresses}
        selectedAddressId={selectedAddress.id}
        onSelectAddress={setSelectedAddress}
        onAddAddress={handleAddAddress}
      />

      {/* Order Success Confirmation Modal with Wallet Details */}
      {placedOrder && (
        <OrderSuccessModal
          order={placedOrder}
          currency={currency}
          onClose={() => setPlacedOrder(null)}
          onViewOrders={() => {
            setPlacedOrder(null);
            setActiveTab('profile');
          }}
        />
      )}

      {/* Admin Panel Modal with Strong Password Protection */}
      {isAdminOpen && (
        <AdminPanel
          products={products}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          offers={offers}
          onAddOffer={handleAddOffer}
          onUpdateOffer={handleUpdateOffer}
          onDeleteOffer={handleDeleteOffer}
          wallets={wallets}
          onUpdateWallet={handleUpdateWallet}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          currency={currency}
          onClose={() => setIsAdminOpen(false)}
          maxOfferSlots={maxOfferSlots}
          onUpdateOfferSlots={handleUpdateOfferSlots}
          onToggleSpecialOffer={handleToggleSpecialOffer}
        />
      )}

      {/* Bottom Sticky Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={totalCartCount}
      />
    </DeviceFrame>
  );
}
