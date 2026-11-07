export type CategoryType =
  | 'all'
  | 'local_fruits'
  | 'imported_fruits'
  | 'vegetables'
  | 'dates'
  | 'dried_fruits';

export type WalletType = 'jeeb' | 'kuraimi' | 'jawali' | 'cash';

export interface WalletConfig {
  id: WalletType;
  name: string;
  shortName: string;
  pointCode: string; // رمز النقطة
  accountNumber: string; // رقم الحساب
  merchantName: string; // اسم التاجر / النقطة
  phone: string;
  instructions: string;
  color: string;
  badge: string;
}

export interface Product {
  id: string;
  name: string;
  arabicName: string;
  category: 'local_fruits' | 'imported_fruits' | 'vegetables' | 'dates' | 'dried_fruits';
  categoryLabel: string;
  subCategory?: string;
  price: number;
  originalPrice?: number;
  unit: string; // e.g. 'كجم', 'سلة', 'كرتون', 'حزمة'
  rating: number;
  reviewsCount: number;
  origin: string; // e.g. 'اليمن', 'المدينة المنورة', 'إيطاليا', 'تركيا'
  description: string;
  image: string;
  gallery: string[];
  inStock: boolean;
  isOrganic?: boolean;
  isPopular?: boolean;
  isSpecialOffer?: boolean;
  offerDiscountText?: string;
  badge?: string; // e.g. 'بلدي طازج', 'نخب أول', 'عرض خاص', 'طازج اليوم'
  weightOptions: {
    label: string;
    multiplier: number;
  }[];
}

export interface CartItem {
  product: Product;
  selectedWeight: {
    label: string;
    multiplier: number;
  };
  quantity: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  badge: string;
  tag: string;
  oldPrice?: number; // السعر القديم
  offerPrice?: number; // سعر العرض
  unit?: string; // e.g. 'كجم', 'كرتون', 'سلة', 'حزمة', 'صينية'
  discountPercentage?: number;
  code?: string;
  image: string; // الصورة الرئيسية
  gallery?: string[]; // صور العرض من الاستديو (إضافة وإزالة)
  expiryDate: string;
  bundleProductIds: string[];
  bannerBg: string;
  isActive?: boolean;
}

export interface DeliveryAddress {
  id: string;
  title: string;
  area: string;
  street: string;
  city: string;
  notes?: string;
  phone: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  address: DeliveryAddress;
  status: 'pending' | 'preparing' | 'on_way' | 'delivered';
  paymentMethod: string;
  walletType?: WalletType;
  walletPointCode?: string;
  transactionReference?: string;
  deliveryTimeSlot: string;
}

