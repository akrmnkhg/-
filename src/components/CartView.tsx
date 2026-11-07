import React, { useState } from 'react';
import { CartItem, DeliveryAddress, WalletConfig, WalletType } from '../types';
import {
  Trash2,
  Plus,
  Minus,
  MapPin,
  Clock,
  Banknote,
  Smartphone,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface CartViewProps {
  items: CartItem[];
  currency: string;
  wallets: WalletConfig[];
  onUpdateQuantity: (productId: string, delta: number, weightLabel?: string) => void;
  onRemoveItem: (productId: string, weightLabel?: string) => void;
  onClearCart: () => void;
  selectedAddress: DeliveryAddress;
  onOpenAddressModal: () => void;
  onCheckoutSuccess: (orderData: {
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
  }) => void;
  onContinueShopping: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  items,
  currency,
  wallets,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedAddress,
  onOpenAddressModal,
  onCheckoutSuccess,
  onContinueShopping,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPct: number; fixedDiscount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('اليوم: الفترة المسائية (4:00 م - 7:00 م)');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [recipientInfo, setRecipientInfo] = useState('');
  const [customLat, setCustomLat] = useState<number | undefined>(selectedAddress.lat);
  const [customLng, setCustomLng] = useState<number | undefined>(selectedAddress.lng);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  const handleFetchCartGps = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد الموقع غير متوفرة في متصفحك');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomLat(pos.coords.latitude);
        setCustomLng(pos.coords.longitude);
        setGpsLoading(false);
        setGpsSuccess(true);
      },
      (err) => {
        setGpsLoading(false);
        alert('تعذر تحديد الموقع تلقائياً.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };
  
  // Payment methods: cash or electronic wallets (jeeb, kuraimi, jawali)
  const [selectedPaymentType, setSelectedPaymentType] = useState<WalletType>('cash');
  const [transactionReference, setTransactionReference] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    const itemPrice = Math.round(item.product.price * item.selectedWeight.multiplier);
    return sum + itemPrice * item.quantity;
  }, 0);

  const baseDeliveryFee = 10;
  const deliveryFee = subtotal > 150 || appliedCoupon?.code === 'FREEDEL' ? 0 : baseDeliveryFee;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPct > 0) {
      discount = Math.round((subtotal * appliedCoupon.discountPct) / 100);
    } else if (appliedCoupon.fixedDiscount > 0) {
      discount = Math.min(subtotal, appliedCoupon.fixedDiscount);
    }
  }

  const grandTotal = Math.max(0, subtotal + deliveryFee - discount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setCouponError('يرجى إدخال رمز الكوبون');
      return;
    }

    if (code === 'ALJAMAL10' || code === 'JAMAL10') {
      setAppliedCoupon({ code, discountPct: 10, fixedDiscount: 0 });
      setCouponInput('');
    } else if (code === 'RAMADAN' || code === 'WEEKLYDEAL') {
      setAppliedCoupon({ code, discountPct: 15, fixedDiscount: 0 });
      setCouponInput('');
    } else if (code === 'TAWFEER') {
      setAppliedCoupon({ code, discountPct: 0, fixedDiscount: 20 });
      setCouponInput('');
    } else if (code === 'FREEDEL') {
      setAppliedCoupon({ code, discountPct: 0, fixedDiscount: 0 });
      setCouponInput('');
    } else {
      setCouponError('رمز الكوبون غير صالح. جرب: ALJAMAL10 أو RAMADAN');
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => {
      setCopyFeedback(null);
    }, 2000);
  };

  const currentWallet = wallets.find((w) => w.id === selectedPaymentType);

  const handleCheckout = () => {
    if (items.length === 0) return;
    setPaymentError('');

    // If electronic wallet is selected, validate transaction reference
    if (selectedPaymentType !== 'cash' && !transactionReference.trim()) {
      setPaymentError(
        `يرجى كتابة رقم العملية المرجعي بعد إتمام التحويل عبر محفظة ${currentWallet?.shortName || ''} للتحقق من السداد.`
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      let methodLabel = 'الدفع نقداً عند الاستلام';
      if (selectedPaymentType === 'jeeb') {
        methodLabel = `محفظة جيب (رمز النقطة: ${currentWallet?.pointCode})`;
      } else if (selectedPaymentType === 'kuraimi') {
        methodLabel = `الكريمي جوال / إم فلوس (حساب: ${currentWallet?.accountNumber})`;
      } else if (selectedPaymentType === 'jawali') {
        methodLabel = `محفظة جوالي (رمز النقطة: ${currentWallet?.pointCode})`;
      }

      // Format WhatsApp Message with Google Maps Location & Order Details
      const itemsText = items
        .map(
          (i) =>
            `• ${i.product.name} (${i.selectedWeight.label}) × ${i.quantity} = ${Math.round(i.product.price * i.selectedWeight.multiplier * i.quantity)} ${currency}`
        )
        .join('\n');

      const activeLat = customLat || selectedAddress.lat;
      const activeLng = customLng || selectedAddress.lng;

      const mapsUrl = (activeLat && activeLng)
        ? `https://www.google.com/maps?q=${activeLat},${activeLng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            detailedAddress.trim() || selectedAddress.street ? `صنعاء، ${detailedAddress || selectedAddress.street}` : `صنعاء، ${selectedAddress.area}`
          )}`;

      const finalPhone = customerPhone.trim() || selectedAddress.phone || '776 662 630';
      const finalAddress: DeliveryAddress = {
        ...selectedAddress,
        phone: finalPhone,
        street: detailedAddress.trim() || selectedAddress.street,
        lat: activeLat,
        lng: activeLng,
      };

      const whatsappMessage = `🛒 *طلب جديد عبر متجر الجمل للخضار والفواكه والتمور*
----------------------------------
👤 *اسم الزبون الكريم:* ${customerName.trim() || 'العميل الكريم'}
📞 *اسم ورقم المستلم / الشخص المسؤول:* ${recipientInfo.trim() || 'غير محدد'}
📱 *رقم هاتف الزبون الأساسي:* ${finalPhone}

🏢 *العنوان الكتابي التفصيلي:*
${detailedAddress.trim() || selectedAddress.street || 'غير محدد'}
المنطقة: ${selectedAddress.area}

📍 *لكيشن موقع الزبون (عبر خرائط جوجل):*
${mapsUrl}

📦 *تفاصيل الأصناف المطلوبة:*
${itemsText}

----------------------------------
💰 *ملخص الحساب:*
• المجموع الفرعي: ${subtotal} ${currency}
• رسوم التوصيل: ${deliveryFee} ${currency}
${discount > 0 ? `• الخصم: -${discount} ${currency}\n` : ''}• *الإجمالي الكلي: ${grandTotal} ${currency}*

💳 *طريقة الدفع:*
${methodLabel}
${transactionReference ? `رقم الإشعار المرجعي: ${transactionReference}` : ''}

⏰ *وقت التوصيل المختار:*
${selectedTimeSlot}
----------------------------------
يرجى تأكيد الطلب وتجهيزه للتوصيل الفوري. شكراً لاختياركم متجر الجمل! 🌴🍎`;

      // Open WhatsApp Direct Link to 776662630
      window.open(`https://wa.me/967776662630?text=${encodeURIComponent(whatsappMessage)}`, '_blank');

      onCheckoutSuccess({
        items,
        subtotal,
        deliveryFee,
        discount,
        total: grandTotal,
        address: finalAddress,
        paymentMethod: methodLabel,
        walletType: selectedPaymentType,
        walletPointCode: currentWallet?.pointCode,
        transactionReference: transactionReference.trim() || undefined,
        deliveryTimeSlot: selectedTimeSlot,
      });
    }, 600);
  };

  if (items.length === 0) {
    return (
      <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 mb-4 shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-black text-stone-900 mb-1">سلة التسوق فارغة</h2>
        <p className="text-xs text-stone-500 max-w-xs mb-6">
          لم تقم بإضافة أي أصناف من الخضار، الفواكه أو التمور بعد. تسوق تشكيلتنا الطازجة الآن!
        </p>
        <button
          onClick={onContinueShopping}
          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <span>تصفح الأقسام والمنتجات</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28">
      {/* Top Header matching Screen 4 & 5 */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold text-stone-900">سلة التسوق</h2>
          <span className="bg-emerald-100 text-emerald-900 font-bold text-[11px] px-2 py-0.5 rounded-full">
            {items.reduce((s, i) => s + i.quantity, 0)} عناصر
          </span>
        </div>
        <button
          onClick={onClearCart}
          className="text-stone-400 hover:text-red-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>إفراغ السلة</span>
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const itemUnitPrice = Math.round(item.product.price * item.selectedWeight.multiplier);
          const itemTotal = itemUnitPrice * item.quantity;

          return (
            <div
              key={`${item.product.id}-${item.selectedWeight.label}-${idx}`}
              className="bg-white rounded-2xl p-3 border border-stone-200/90 shadow-xs flex items-center justify-between gap-3"
            >
              {/* Product Thumbnail */}
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-16 h-16 rounded-xl object-cover border border-stone-100 shrink-0"
              />

              {/* Title, Weight, and Unit Price */}
              <div className="flex-1 min-w-0 text-right">
                <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                  {item.product.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                    {item.selectedWeight.label}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {itemUnitPrice} {currency} / عبوة
                  </span>
                </div>
                <div className="text-xs font-extrabold text-emerald-800 mt-1">
                  الإجمالي: {itemTotal} {currency}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center bg-stone-50 border border-stone-200/90 rounded-xl px-1.5 py-1 shrink-0">
                <button
                  onClick={() =>
                    onUpdateQuantity(item.product.id, -1, item.selectedWeight.label)
                  }
                  className="w-6 h-6 rounded-lg bg-white text-stone-800 border border-stone-200 flex items-center justify-center font-bold hover:bg-stone-100 active:scale-95 transition-all cursor-pointer"
                  title="تقليل"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-extrabold text-xs text-stone-900 w-7 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    onUpdateQuantity(item.product.id, 1, item.selectedWeight.label)
                  }
                  className="w-6 h-6 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold hover:bg-emerald-900 active:scale-95 transition-all cursor-pointer"
                  title="زيادة"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coupon Box */}
      <div className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-xs">
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="أدخل كود الكوبون (مثال: ALJAMAL10)"
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700/20 text-stone-800 font-semibold"
          />
          <button
            type="submit"
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            تطبيق كوبون
          </button>
        </form>

        {appliedCoupon && (
          <div className="mt-2 text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center justify-between">
            <span>تم تطبيق الكوبون بنجاح ({appliedCoupon.code})</span>
            <button
              onClick={() => setAppliedCoupon(null)}
              className="text-stone-400 hover:text-red-600 text-xs font-bold"
            >
              إلغاء
            </button>
          </div>
        )}
        {couponError && (
          <p className="text-[11px] text-red-600 font-medium mt-1.5">{couponError}</p>
        )}
      </div>

      {/* Delivery Address & Customer Details Card */}
      <div className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-800" />
            بيانات الزبون والمستلم وعنوان التوصيل
          </span>
          <button
            onClick={onOpenAddressModal}
            className="text-[11px] text-emerald-800 font-bold hover:underline cursor-pointer"
          >
            اختيار عنوان محفوظ
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              اسم الزبون الكريم:
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="مثال: محمد أحمد علي"
              className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              رقم هاتف الزبون الأساسي:
            </label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="مثال: 771234567"
              className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              اسم ورقم المستلم / الشخص المسؤول عند الاستلام:
            </label>
            <input
              type="text"
              value={recipientInfo}
              onChange={(e) => setRecipientInfo(e.target.value)}
              placeholder="مثال: حارس البناية (عمي صالح - 77xxxxxxx) أو أخي"
              className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              العنوان الكتابي التفصيلي (عمارة رقم، الشارع، جوار...):
            </label>
            <input
              type="text"
              required
              value={detailedAddress}
              onChange={(e) => setDetailedAddress(e.target.value)}
              placeholder="مثال: عمارة رقم 4، الدور 2، شارع حدة الرئيسي"
              className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>

          {/* GPS Location Button */}
          <div>
            <button
              type="button"
              onClick={handleFetchCartGps}
              disabled={gpsLoading}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                gpsSuccess
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span>📍</span>
              <span>
                {gpsLoading
                  ? 'جاري تحديد لكيشن موقعك الحالي...'
                  : gpsSuccess
                  ? '✓ تم تحديد لكيشن موقع الزبون بدقة (GPS)'
                  : 'تحديد لكيشن موقع الزبون الحالي تلقائياً (GPS)'}
              </span>
            </button>
          </div>

          <div className="bg-stone-50 rounded-xl p-2.5 text-[11px] text-stone-600 border border-stone-200 flex items-center justify-between">
            <span>المنطقة: <strong>{selectedAddress.area}</strong></span>
            <span className="text-stone-400">هاتف رئيسي: {selectedAddress.phone || '776 662 630'}</span>
          </div>
        </div>
      </div>

      {/* Delivery Time Slot Picker */}
      <div className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-stone-900">
          <Clock className="w-4 h-4 text-emerald-800" />
          وقت التوصيل المفضل
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            'اليوم: المساء (4:00 م - 7:00 م)',
            'غداً: الصباح (9:00 ص - 1:00 م)',
          ].map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedTimeSlot(slot)}
              className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                selectedTimeSlot === slot
                  ? 'bg-emerald-900 text-white border-emerald-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* ================= PAYMENT METHODS: ELECTRONIC WALLETS WITH POINT CODES ================= */}
      <div className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-800" />
            طريقة الدفع (المحافظ الإلكترونية اليمنية أو كاش):
          </span>
        </div>

        {/* 4 Payment Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {/* Option 1: Cash */}
          <button
            type="button"
            onClick={() => {
              setSelectedPaymentType('cash');
              setPaymentError('');
            }}
            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              selectedPaymentType === 'cash'
                ? 'bg-emerald-50 border-emerald-700 text-emerald-900 ring-2 ring-emerald-700/20 shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Banknote className="w-4 h-4 text-emerald-700" />
            <span className="text-[11px] font-bold">كاش عند الاستلام</span>
            <span className="text-[9px] text-stone-400">نقداً للمندوب</span>
          </button>

          {/* Option 2: Jeeb */}
          <button
            type="button"
            onClick={() => {
              setSelectedPaymentType('jeeb');
              setPaymentError('');
            }}
            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              selectedPaymentType === 'jeeb'
                ? 'bg-emerald-50 border-emerald-700 text-emerald-900 ring-2 ring-emerald-700/20 shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center">
              ج
            </div>
            <span className="text-[11px] font-bold">محفظة جيب</span>
            <span className="text-[9px] text-emerald-700 font-mono font-semibold">رمز النقطة</span>
          </button>

          {/* Option 3: Kuraimi */}
          <button
            type="button"
            onClick={() => {
              setSelectedPaymentType('kuraimi');
              setPaymentError('');
            }}
            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              selectedPaymentType === 'kuraimi'
                ? 'bg-blue-50 border-blue-700 text-blue-900 ring-2 ring-blue-700/20 shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-blue-700 text-white text-[9px] font-black flex items-center justify-center">
              ك
            </div>
            <span className="text-[11px] font-bold">الكريمي / إم فلوس</span>
            <span className="text-[9px] text-blue-700 font-mono font-semibold">حساب وسداد</span>
          </button>

          {/* Option 4: Jawali */}
          <button
            type="button"
            onClick={() => {
              setSelectedPaymentType('jawali');
              setPaymentError('');
            }}
            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              selectedPaymentType === 'jawali'
                ? 'bg-amber-50 border-amber-600 text-amber-950 ring-2 ring-amber-600/20 shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] font-black flex items-center justify-center">
              و
            </div>
            <span className="text-[11px] font-bold">محفظة جوالي</span>
            <span className="text-[9px] text-amber-700 font-mono font-semibold">رمز النقطة</span>
          </button>
        </div>

        {/* Detailed Card for Selected Electronic Wallet */}
        {currentWallet && selectedPaymentType !== 'cash' && (
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-2.5 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <strong className="text-stone-900">{currentWallet.name}</strong>
              </div>
              <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-full border border-stone-200">
                {currentWallet.badge}
              </span>
            </div>

            {/* Merchant Point Code & Account Card */}
            <div className="bg-white rounded-xl p-3 border border-stone-200/90 space-y-2 shadow-2xs">
              {/* Point Code */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block">
                    رمز النقطة المعتمد (Merchant Point Code):
                  </span>
                  <span className="font-mono text-sm font-black text-emerald-900 tracking-wider">
                    {currentWallet.pointCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(currentWallet.pointCode, 'code')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold py-1 px-2.5 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copyFeedback === 'code' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>نسخ رمز النقطة</span>
                    </>
                  )}
                </button>
              </div>

              {/* Account Number */}
              <div className="flex items-center justify-between pt-1.5 border-t border-stone-100">
                <div>
                  <span className="text-[10px] text-stone-400 block">
                    رقم الحساب / الهاتف المرتبط:
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-800">
                    {currentWallet.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(currentWallet.accountNumber, 'acc')}
                  className="bg-stone-50 hover:bg-stone-100 text-stone-700 text-[11px] font-bold py-1 px-2.5 rounded-lg border border-stone-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copyFeedback === 'acc' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>نسخ الرقم</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                اسم النقطة المسجل:{' '}
                <strong className="text-stone-800">{currentWallet.merchantName}</strong>
              </div>
            </div>

            {/* Amount to transfer banner */}
            <div className="flex items-center justify-between bg-emerald-950 text-white rounded-xl p-2.5">
              <span className="text-[11px]">المبلغ المطلوب تحويله:</span>
              <span className="font-black text-sm text-amber-300">
                {grandTotal} {currency}
              </span>
            </div>

            {/* Transaction Reference Input */}
            <div>
              <label className="block text-[11px] font-black text-stone-900 mb-1">
                أدخل رقم العملية / إشعار السداد بعد التحويل:
              </label>
              <input
                type="text"
                value={transactionReference}
                onChange={(e) => {
                  setTransactionReference(e.target.value);
                  setPaymentError('');
                }}
                placeholder="مثال: 94821038 أو رقم الحوالة"
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
              <span className="text-[10px] text-stone-500 mt-1 block">
                {currentWallet.instructions}
              </span>
            </div>
          </div>
        )}

        {paymentError && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold mt-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{paymentError}</span>
          </div>
        )}
      </div>

      {/* Price Summary Breakdown matching Screen 4 & 5 */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-2 text-xs">
        <div className="flex justify-between text-stone-600">
          <span>المجموع الفرعي</span>
          <span className="font-bold">{subtotal} {currency}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>رسوم التوصيل</span>
          <span className="font-bold">
            {deliveryFee === 0 ? (
              <span className="text-emerald-700 font-extrabold">مجاناً</span>
            ) : (
              `${deliveryFee} ${currency}`
            )}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-amber-700 font-bold">
            <span>الخصم المطبق</span>
            <span>- {discount} {currency}</span>
          </div>
        )}
        <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline text-stone-900">
          <span className="text-sm font-black">الإجمالي</span>
          <span className="text-lg font-black text-emerald-900">
            {grandTotal} {currency}
          </span>
        </div>
      </div>

      {/* Checkout Action Button matching Screen 4 & 5 */}
      <button
        onClick={handleCheckout}
        disabled={isSubmitting}
        className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-400 text-white font-black text-sm py-3.5 px-4 rounded-2xl shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
      >
        <ShieldCheck className="w-5 h-5" />
        <span>
          {isSubmitting
            ? 'جاري تجهيز وتأكيد الطلب...'
            : selectedPaymentType === 'cash'
            ? 'إتمام الطلب (الدفع كاش عند الاستلام)'
            : `تأكيد الطلب عبر محفظة ${currentWallet?.shortName || ''}`}
        </span>
      </button>
    </div>
  );
};
