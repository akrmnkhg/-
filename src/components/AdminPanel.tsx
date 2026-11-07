import React, { useState, useRef } from 'react';
import {
  Product,
  WalletConfig,
  Order,
  CategoryType,
  Offer,
} from '../types';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Save,
  Wallet,
  Package,
  Layers,
  Search,
  ChevronLeft,
  X,
  Phone,
  Clock,
  Sparkles,
  AlertCircle,
  LogOut,
  Camera,
  UploadCloud,
  Image as ImageIcon,
  Tag,
  Percent,
  Star,
  Check,
} from 'lucide-react';
import { CATEGORIES_CONFIG } from '../data/mockData';

interface AdminPanelProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  offers: Offer[];
  onAddOffer: (offer: Offer) => void;
  onUpdateOffer: (offer: Offer) => void;
  onDeleteOffer: (offerId: string) => void;
  wallets: WalletConfig[];
  onUpdateWallet: (wallet: WalletConfig) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  currency: string;
  onClose: () => void;
  maxOfferSlots: number;
  onUpdateOfferSlots: (count: number) => void;
  onToggleSpecialOffer: (productId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  offers,
  onAddOffer,
  onUpdateOffer,
  onDeleteOffer,
  wallets,
  onUpdateWallet,
  orders,
  onUpdateOrderStatus,
  currency,
  onClose,
  maxOfferSlots,
  onUpdateOfferSlots,
  onToggleSpecialOffer,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('aljamal_admin_auth') === 'true';
  });
  const [currentMasterPassword, setCurrentMasterPassword] = useState(() => {
    return localStorage.getItem('aljamal_admin_pwd') || 'Admin@AlJamal2026!';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Studio Image Upload ref and states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [studioUploadSuccess, setStudioUploadSuccess] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);

  // Change Password Modal
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdChangeError, setPwdChangeError] = useState('');
  const [pwdChangeSuccess, setPwdChangeSuccess] = useState('');

  // Admin Active Tab: added 'offers'
  const [activeAdminTab, setActiveAdminTab] = useState<'products' | 'offers' | 'wallets' | 'orders'>('products');

  // Search & Filter in Products
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');

  // Product Add/Edit Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({});

  // Wallet Editing
  const [editingWallet, setEditingWallet] = useState<WalletConfig | null>(null);

  // Offer Add/Edit Modal & Studio Images State
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isAddOfferMode, setIsAddOfferMode] = useState(false);
  const [offerForm, setOfferForm] = useState<Partial<Offer>>({});
  const offerFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingOfferImages, setIsUploadingOfferImages] = useState(false);
  const [offerImageSuccessMessage, setOfferImageSuccessMessage] = useState('');

  // Offer Studio Image Upload Handler (Multiple Images from Gallery/Device)
  const handleOfferStudioImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingOfferImages(true);
    const newImages: string[] = [];
    let processed = 0;
    const totalFiles = files.length;

    const safetyTimer = setTimeout(() => {
      setIsUploadingOfferImages(false);
    }, 8000);

    Array.from(files).forEach((file) => {
      const reader = new FileReader();

      reader.onerror = () => {
        processed++;
        if (processed === totalFiles) {
          clearTimeout(safetyTimer);
          setIsUploadingOfferImages(false);
        }
      };

      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        if (!rawDataUrl) {
          processed++;
          if (processed === totalFiles) {
            clearTimeout(safetyTimer);
            setIsUploadingOfferImages(false);
          }
          return;
        }

        const img = new window.Image();

        const finalizeImage = (imgUrl: string) => {
          newImages.push(imgUrl);
          processed++;
          if (processed === totalFiles) {
            clearTimeout(safetyTimer);
            setOfferForm((prev) => {
              const currentGallery = prev.gallery || (prev.image ? [prev.image] : []);
              const updatedGallery = [...currentGallery, ...newImages];
              return {
                ...prev,
                image: prev.image || newImages[0] || '',
                gallery: updatedGallery,
              };
            });
            setIsUploadingOfferImages(false);
            setOfferImageSuccessMessage(`تمت إضافة ${newImages.length} صورة من الاستديو بنجاح ✨`);
            setTimeout(() => setOfferImageSuccessMessage(''), 3000);
          }
        };

        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.85);
              finalizeImage(compressed);
            } else {
              finalizeImage(rawDataUrl);
            }
          } catch (err) {
            finalizeImage(rawDataUrl);
          }
        };

        img.onerror = () => {
          finalizeImage(rawDataUrl);
        };

        img.src = rawDataUrl;
      };

      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Remove an image from offer's studio images
  const handleRemoveOfferImage = (indexToRemove: number) => {
    setOfferForm((prev) => {
      const currentGallery = prev.gallery || (prev.image ? [prev.image] : []);
      const updatedGallery = currentGallery.filter((_, idx) => idx !== indexToRemove);
      const newPrimary =
        prev.image === currentGallery[indexToRemove]
          ? updatedGallery[0] || ''
          : prev.image || updatedGallery[0] || '';
      return {
        ...prev,
        image: newPrimary,
        gallery: updatedGallery,
      };
    });
  };

  // Set an image as primary cover for the offer
  const handleSetPrimaryOfferImage = (imgSrc: string) => {
    setOfferForm((prev) => ({
      ...prev,
      image: imgSrc,
    }));
  };

  const handleOpenAddOffer = () => {
    setIsAddOfferMode(true);
    setEditingOffer(null);
    setOfferForm({
      title: '',
      description: '',
      badge: 'عرض خاص',
      tag: 'وفر 20%',
      oldPrice: undefined,
      offerPrice: undefined,
      unit: 'كرتون',
      discountPercentage: 20,
      expiryDate: 'ساري طوال الأسبوع',
      gallery: [],
      bundleProductIds: [],
      bannerBg: 'from-emerald-900 via-emerald-800 to-stone-900',
      isActive: true,
    });
  };

  const handleOpenEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setIsAddOfferMode(false);
    setOfferForm({
      ...offer,
      gallery: offer.gallery && offer.gallery.length > 0 ? offer.gallery : (offer.image ? [offer.image] : []),
    });
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.title || offerForm.offerPrice === undefined) return;

    const oldP = offerForm.oldPrice ? Number(offerForm.oldPrice) : undefined;
    const offerP = Number(offerForm.offerPrice);
    let discPercent = offerForm.discountPercentage;
    if (oldP && oldP > offerP) {
      discPercent = Math.round(((oldP - offerP) / oldP) * 100);
    }

    const calculatedTag =
      offerForm.tag || (discPercent ? `وفر ${discPercent}%` : 'عرض خاص');

    const mainImg =
      offerForm.image ||
      offerForm.gallery?.[0] ||
      'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80';

    const allImages =
      offerForm.gallery && offerForm.gallery.length > 0
        ? offerForm.gallery
        : [mainImg];

    const finalOffer: Offer = {
      id: offerForm.id || `offer-${Date.now()}`,
      title: offerForm.title,
      description: offerForm.description || '',
      badge: offerForm.badge || 'عرض خاص',
      tag: calculatedTag,
      oldPrice: oldP,
      offerPrice: offerP,
      unit: offerForm.unit || 'عرض كامل',
      discountPercentage: discPercent,
      code: offerForm.code,
      image: mainImg,
      gallery: allImages,
      expiryDate: offerForm.expiryDate || 'ساري طوال الأسبوع',
      bundleProductIds: offerForm.bundleProductIds || [],
      bannerBg: offerForm.bannerBg || 'from-emerald-900 via-emerald-800 to-stone-900',
      isActive: offerForm.isActive !== false,
    };

    if (isAddOfferMode) {
      onAddOffer(finalOffer);
    } else {
      onUpdateOffer(finalOffer);
    }

    setEditingOffer(null);
    setIsAddOfferMode(false);
    setOfferForm({});
  };

  // Studio Image Selection & Optimization Handler
  const handleStudioImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const safetyTimer = setTimeout(() => {
      setIsUploadingImage(false);
    }, 6000);

    const reader = new FileReader();

    reader.onerror = () => {
      clearTimeout(safetyTimer);
      setIsUploadingImage(false);
    };

    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        clearTimeout(safetyTimer);
        setIsUploadingImage(false);
        return;
      }

      const img = new window.Image();

      const finish = (url: string) => {
        clearTimeout(safetyTimer);
        setProductForm((prev) => ({
          ...prev,
          image: url,
          gallery: [url, ...(prev.gallery?.filter((g) => g !== prev.image) || [])],
        }));
        setStudioUploadSuccess(true);
        setIsUploadingImage(false);
        setTimeout(() => setStudioUploadSuccess(false), 3000);
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
            finish(compressedDataUrl);
          } else {
            finish(rawDataUrl);
          }
        } catch (err) {
          finish(rawDataUrl);
        }
      };

      img.onerror = () => {
        finish(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Check password strength helper
  const evaluatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score < 3) return { level: 'ضعيفة', color: 'text-red-600 bg-red-100', width: 'w-1/4' };
    if (score < 5) return { level: 'متوسطة', color: 'text-amber-600 bg-amber-100', width: 'w-2/4' };
    return { level: 'قوية جداً', color: 'text-emerald-700 bg-emerald-100', width: 'w-full' };
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === currentMasterPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('aljamal_admin_auth', 'true');
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('كلمة المرور غير صحيحة! يرجى التأكد وإعادة المحاولة.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('aljamal_admin_auth');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdChangeError('');
    setPwdChangeSuccess('');

    if (newPassword.length < 8) {
      setPwdChangeError('يجب أن لا تقل كلمة المرور عن 8 خانات وتحتوي على أرقام ورموز وحروف.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdChangeError('كلمتا المرور غير متطابقتين!');
      return;
    }

    setCurrentMasterPassword(newPassword);
    localStorage.setItem('aljamal_admin_pwd', newPassword);
    setPwdChangeSuccess('تم تحديث كلمة المرور القوية بنجاح!');
    setTimeout(() => {
      setIsChangingPwd(false);
      setNewPassword('');
      setConfirmPassword('');
      setPwdChangeSuccess('');
    }, 1200);
  };

  // Open Edit Product Modal
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setIsAddMode(false);
    setProductForm({ ...p });
  };

  // Open Add Product Modal
  const handleOpenAdd = () => {
    const newId = `prod-${Date.now()}`;
    setEditingProduct(null);
    setIsAddMode(true);
    setProductForm({
      id: newId,
      name: '',
      arabicName: '',
      category: 'local_fruits',
      categoryLabel: 'فواكه بلدي',
      price: 15,
      originalPrice: 20,
      unit: 'كجم',
      rating: 5.0,
      reviewsCount: 1,
      origin: 'اليمن',
      description: 'محصول طازج عالي الجودة مقطوف بعناية تامة.',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
      gallery: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80'],
      isOrganic: false,
      isPopular: false,
      isSpecialOffer: false,
      offerDiscountText: 'خصم خاص',
      badge: 'بلدي طازج',
      weightOptions: [
        { label: '1 كجم', multiplier: 1 },
        { label: '2 كجم', multiplier: 2 },
      ],
    });
  };

  // Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;

    const catLabel =
      productForm.category === 'local_fruits'
        ? 'فواكه بلدي'
        : productForm.category === 'imported_fruits'
        ? 'فواكه مستوردة'
        : productForm.category === 'vegetables'
        ? 'خضروات'
        : productForm.category === 'dates'
        ? 'تمور فاخرة'
        : 'فواكه مجففة';

    const finalProduct: Product = {
      id: productForm.id || `prod-${Date.now()}`,
      name: productForm.name || '',
      arabicName: productForm.arabicName || productForm.name || '',
      category: productForm.category || 'local_fruits',
      categoryLabel: catLabel,
      subCategory: productForm.subCategory,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      unit: productForm.unit || 'كجم',
      rating: productForm.rating || 5.0,
      reviewsCount: productForm.reviewsCount || 10,
      origin: productForm.origin || 'اليمن',
      description: productForm.description || '',
      image: productForm.image || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
      gallery: productForm.gallery && productForm.gallery.length > 0 ? productForm.gallery : [productForm.image || ''],
      inStock: productForm.inStock ?? true,
      isOrganic: productForm.isOrganic,
      isPopular: productForm.isPopular,
      isSpecialOffer: productForm.isSpecialOffer,
      offerDiscountText: productForm.offerDiscountText,
      badge: productForm.badge,
      weightOptions: productForm.weightOptions || [{ label: '1 كجم', multiplier: 1 }],
    };

    if (isAddMode) {
      onAddProduct(finalProduct);
    } else {
      onUpdateProduct(finalProduct);
    }

    setEditingProduct(null);
    setIsAddMode(false);
  };

  // Save Wallet
  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallet) return;
    onUpdateWallet(editingWallet);
    setEditingWallet(null);
  };

  // Filtered Products for Admin
  const adminFilteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.arabicName.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ================= 1. Login Gate View =================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in zoom-in-95 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-emerald-950 text-amber-400 border border-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-lg font-black text-emerald-950">
            لوحة تحكم إدارة متجر الجمل
          </h2>
          <p className="text-xs text-stone-500 mt-1 mb-4">
            صفحة خاصة بالمدير لتعديل المنتجات، الأسعار، وإدارة نقاط المحافظ الإلكترونية.
          </p>

          <form onSubmit={handleLogin} className="space-y-3.5 text-right">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                كلمة المرور الأمنية للمدير:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="أدخل كلمة المرور القوية..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>تسجيل الدخول للوحة الإدارة</span>
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-stone-200 text-[10px] text-stone-400">
            كلمة المرور الافتراضية المبدئية:{' '}
            <code className="font-mono bg-stone-100 text-stone-700 px-1 py-0.5 rounded">
              {currentMasterPassword}
            </code>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. Authenticated Admin Dashboard View =================
  return (
    <div className="fixed inset-0 z-50 bg-stone-100 flex flex-col overflow-hidden">
      {/* Admin Top Navbar */}
      <div className="bg-emerald-950 text-white px-4 py-3 flex items-center justify-between border-b border-emerald-900 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 border border-emerald-700 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black leading-none">
              لوحة تحكم المدير | متجر الجمل
            </h1>
            <p className="text-[10px] text-emerald-300 mt-0.5">
              إدارة المنتجات، الأسعار، نقاط المحافظ والطلبات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChangingPwd(true)}
            className="flex items-center gap-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg border border-white/20 text-amber-300 transition-colors"
            title="تغيير كلمة المرور القوية"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">تغيير كلمة السر</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[11px] font-bold bg-red-900/40 hover:bg-red-800/80 px-2.5 py-1.5 rounded-lg border border-red-700/50 text-red-200 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
            title="العودة للمتجر"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-white border-b border-stone-200 px-4 py-2 flex items-center gap-2 shrink-0 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveAdminTab('products')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'products'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>إدارة المنتجات ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('offers')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'offers'
              ? 'bg-amber-400 text-stone-950 font-black shadow-xs'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>
            عروض القائمة الرئيسية ({products.filter((p) => p.isSpecialOffer).length}/{maxOfferSlots} خانات)
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('wallets')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'wallets'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>رموز نقاط المحافظ الإلكترونية ({wallets.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('orders')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'orders'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>طلبات الزبائن ({orders.length})</span>
        </button>
      </div>

      {/* Main Admin Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 max-w-5xl mx-auto w-full">
        {/* ================= SECTION 1: PRODUCTS MANAGEMENT ================= */}
        {activeAdminTab === 'products' && (
          <div className="space-y-4 pb-12">
            {/* Top Toolbar: Search, Category Filter, and Add Product Button */}
            <div className="bg-white rounded-2xl p-3 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن منتج لتعديله..."
                    className="w-full text-xs p-2.5 pr-8 pl-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
                  className="text-xs bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-700"
                >
                  <option value="all">كل الأقسام</option>
                  <option value="local_fruits">قسم ١: فواكه بلدي</option>
                  <option value="imported_fruits">قسم ٢: فواكه مستوردة</option>
                  <option value="vegetables">قسم ٣: خضروات</option>
                  <option value="dates">قسم ٤: تمور فاخرة</option>
                  <option value="dried_fruits">قسم ٥: فواكه مجففة</option>
                </select>
              </div>

              <button
                onClick={handleOpenAdd}
                className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد</span>
              </button>
            </div>

            {/* Products List / Table Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {adminFilteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-3 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-extrabold text-xs text-stone-900 truncate">
                        {prod.name}
                      </h3>
                      {prod.inStock ? (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          متوفر
                        </span>
                      ) : (
                        <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                          نفد
                        </span>
                      )}
                      {prod.badge && (
                        <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                          {prod.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-stone-400 mt-0.5">
                      {prod.categoryLabel} • المنشأ: {prod.origin}
                    </p>

                    <div className="flex items-baseline gap-2 mt-1 text-xs">
                      <span className="font-black text-emerald-900">
                        {prod.price} {currency} / {prod.unit}
                      </span>
                      {prod.originalPrice && (
                        <span className="text-[10px] text-stone-400 line-through">
                          {prod.originalPrice} {currency}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-emerald-100 hover:text-emerald-800 text-stone-600 transition-colors"
                      title="تعديل المنتج"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف المنتج "${prod.name}"؟`)) {
                          onDeleteProduct(prod.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-red-100 hover:text-red-700 text-stone-400 transition-colors"
                      title="حذف المنتج"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SECTION 1.5: SPECIAL OFFERS CONTROLLER (خانات العروض الخاصة) ================= */}
        {activeAdminTab === 'offers' && (
          <div className="space-y-4 pb-12 animate-in fade-in">
            {/* Header Card */}
            <div className="bg-gradient-to-l from-amber-500 via-amber-600 to-amber-700 text-stone-950 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-stone-950 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    تحكم حصري للمدير
                  </span>
                  <span className="text-xs font-black text-amber-950">
                    الصفحة الرئيسية للمتجر
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black mt-1">
                      إدارة العروض الترويجية والخصومات وخانات العروض
                    </h2>
                    <p className="text-xs font-semibold text-amber-950/90 mt-1 max-w-2xl leading-relaxed">
                      إضافة وإزالة صور العروض من الاستديو، ضبط السعر القديم وسعر العرض الجديد ونسب التوفير، والتحكم في خانات العروض الخاصة بالقائمة الرئيسية.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddOffer}
                    className="bg-stone-950 hover:bg-stone-900 active:scale-95 text-amber-300 font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>إضافة عرض جديد للقائمة</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ================= SUB-SECTION A: PROMOTIONAL OFFERS LIST (قائمة العروض) ================= */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>قائمة العروض الترويجية ({offers.length} عروض):</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    عروض مخصصة تشمل صور متعددة من الاستديو وأسعار مخفضة ونسب توفير
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddOffer}
                  className="text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ إضافة عرض جديد</span>
                </button>
              </div>

              {offers.length === 0 ? (
                <div className="text-center py-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  <p className="text-xs font-bold text-stone-500">
                    لا توجد عروض في القائمة حالياً
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddOffer}
                    className="mt-2 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    اضغط هنا لإضافة أول عرض مع صور الاستديو والأسعار
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {offers.map((offer) => {
                    const galleryCount = offer.gallery?.length || (offer.image ? 1 : 0);
                    const savingAmount =
                      offer.oldPrice && offer.offerPrice && offer.oldPrice > offer.offerPrice
                        ? offer.oldPrice - offer.offerPrice
                        : 0;

                    return (
                      <div
                        key={offer.id}
                        className="bg-stone-50/70 rounded-2xl border border-stone-200/90 p-3.5 flex flex-col justify-between hover:shadow-md transition-all gap-3"
                      >
                        <div className="space-y-2.5">
                          {/* Image & Badges */}
                          <div className="relative h-36 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 group">
                            <img
                              src={offer.image}
                              alt={offer.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                            <div className="absolute top-2 right-2 flex items-center gap-1">
                              <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                                {offer.badge}
                              </span>
                              <span className="bg-white/20 backdrop-blur-xs text-white font-bold text-[9.5px] px-2 py-0.5 rounded-md">
                                {offer.tag}
                              </span>
                            </div>

                            {/* Studio Photos Count Badge */}
                            <div className="absolute top-2 left-2 bg-stone-950/80 backdrop-blur-xs text-amber-300 font-bold text-[9.5px] px-2 py-0.5 rounded-md border border-amber-300/30 flex items-center gap-1">
                              <Camera className="w-3 h-3" />
                              <span>{galleryCount} صور من الاستديو</span>
                            </div>

                            <div className="absolute bottom-2 right-2 left-2 text-white">
                              <h4 className="font-black text-xs sm:text-sm line-clamp-1 drop-shadow-xs">
                                {offer.title}
                              </h4>
                              <p className="text-[10px] text-stone-300 line-clamp-1 opacity-90">
                                {offer.description}
                              </p>
                            </div>
                          </div>

                          {/* Gallery Thumbnail Strip (if multiple photos from studio) */}
                          {offer.gallery && offer.gallery.length > 1 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                              <span className="text-[9.5px] font-bold text-stone-500 shrink-0">
                                صور العرض:
                              </span>
                              {offer.gallery.map((gImg, gIdx) => (
                                <img
                                  key={gIdx}
                                  src={gImg}
                                  alt={`صورة ${gIdx + 1}`}
                                  className={`w-9 h-9 rounded-lg object-cover border shrink-0 ${
                                    offer.image === gImg
                                      ? 'border-amber-500 ring-2 ring-amber-300'
                                      : 'border-stone-200'
                                  }`}
                                />
                              ))}
                            </div>
                          )}

                          {/* Price & Savings Display */}
                          <div className="bg-white rounded-xl p-2.5 border border-stone-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-stone-400 block font-bold">
                                أسعار العرض:
                              </span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-base font-black text-emerald-800">
                                  {offer.offerPrice} {currency}
                                </span>
                                {offer.oldPrice && (
                                  <span className="text-xs text-stone-400 line-through font-bold">
                                    {offer.oldPrice} {currency}
                                  </span>
                                )}
                                {offer.unit && (
                                  <span className="text-[10px] text-stone-500 font-bold">
                                    / {offer.unit}
                                  </span>
                                )}
                              </div>
                            </div>

                            {savingAmount > 0 && (
                              <div className="text-left bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                                <span className="text-[9.5px] font-black text-emerald-800 block">
                                  وفر {savingAmount} {currency}
                                </span>
                                <span className="text-[9px] font-bold text-emerald-600">
                                  خصم {offer.discountPercentage}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions: Edit Offer & Studio Photos & Delete */}
                        <div className="flex items-center gap-2 pt-2 border-t border-stone-200/80">
                          <button
                            type="button"
                            onClick={() => handleOpenEditOffer(offer)}
                            className="flex-1 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>تعديل العرض والصور والأسعار</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteOffer(offer.id)}
                            className="p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-stone-200 cursor-pointer"
                            title="حذف هذا العرض"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ================= SUB-SECTION B: SPECIAL OFFER SLOTS (خانات العروض الخاصة) ================= */}

            {/* Slots Counter Controller Card (زيادة وتنقيص الخانات) */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>عدد خانات العروض في القائمة الرئيسية:</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    زيادة أو تنقيص عدد بطاقات العروض المعروضة للزبائن في واجهة التطبيق
                  </p>
                </div>

                {/* Counter Stepper: [-] [Count] [+] */}
                <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-2xl border border-stone-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateOfferSlots(maxOfferSlots - 1)}
                    disabled={maxOfferSlots <= 1}
                    className="w-9 h-9 rounded-xl bg-white border border-stone-300 text-stone-800 font-black text-lg flex items-center justify-center hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition-all active:scale-95 cursor-pointer"
                    title="تنقيص خانة"
                  >
                    -
                  </button>

                  <div className="text-center px-3">
                    <span className="text-2xl font-black text-amber-600 block leading-none">
                      {maxOfferSlots}
                    </span>
                    <span className="text-[10px] font-extrabold text-stone-600">
                      خانات عروض
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdateOfferSlots(maxOfferSlots + 1)}
                    disabled={maxOfferSlots >= 12}
                    className="w-9 h-9 rounded-xl bg-emerald-800 border border-emerald-900 text-white font-black text-lg flex items-center justify-center hover:bg-emerald-900 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition-all active:scale-95 cursor-pointer"
                    title="زيادة خانة"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons (3 إلى 4 أصناف) */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-600">خيارات سريعة:</span>
                <button
                  type="button"
                  onClick={() => onUpdateOfferSlots(3)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    maxOfferSlots === 3
                      ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300 font-black'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  3 أصناف (عرض ثلاثي)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateOfferSlots(4)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    maxOfferSlots === 4
                      ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300 font-black'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  4 أصناف (عرض رباعي - قياسي)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateOfferSlots(5)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    maxOfferSlots === 5
                      ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300 font-black'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  5 أصناف
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateOfferSlots(6)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    maxOfferSlots === 6
                      ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300 font-black'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  6 أصناف
                </button>

                <div className="mr-auto text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  الحالة: {products.filter((p) => p.isSpecialOffer).length} صنف مفعل من أصل {maxOfferSlots} خانات بالقائمة الرئيسية
                </div>
              </div>
            </div>

            {/* Current Active Offer Slots Visual Preview */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                  <span>معاينة خانات العروض الحالية ({maxOfferSlots} خانات):</span>
                </h3>
                <span className="text-[10px] text-stone-400">
                  تظهر مباشرة بهذا الترتيب في واجهة المتجر
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: maxOfferSlots }).map((_, slotIdx) => {
                  const activeOffers = products.filter((p) => p.isSpecialOffer);
                  const productInSlot = activeOffers[slotIdx];

                  return (
                    <div
                      key={`slot-${slotIdx}`}
                      className={`rounded-2xl p-3 border transition-all ${
                        productInSlot
                          ? 'border-amber-300 bg-amber-50/40 shadow-xs'
                          : 'border-dashed border-stone-300 bg-stone-50/60 flex flex-col items-center justify-center text-center min-h-[160px]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-stone-900 text-white">
                          الخانة رقم {slotIdx + 1}
                        </span>
                        {productInSlot && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            {productInSlot.offerDiscountText || 'عرض خاص'}
                          </span>
                        )}
                      </div>

                      {productInSlot ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={productInSlot.image}
                              alt={productInSlot.name}
                              className="w-14 h-14 rounded-xl object-cover border border-amber-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-black text-xs text-stone-900 truncate">
                                {productInSlot.name}
                              </h4>
                              <p className="text-[10px] text-stone-500 truncate">
                                {productInSlot.categoryLabel}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-extrabold text-xs text-emerald-800">
                                  {productInSlot.price} {currency}
                                </span>
                                {productInSlot.originalPrice && (
                                  <span className="text-[9.5px] text-stone-400 line-through">
                                    {productInSlot.originalPrice} {currency}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-amber-200/60 space-y-1.5">
                            <div className="grid grid-cols-2 gap-1.5">
                              <div>
                                <span className="text-[9px] font-bold text-stone-500 block">
                                  السعر القديم:
                                </span>
                                <input
                                  type="number"
                                  value={productInSlot.originalPrice || ''}
                                  onChange={(e) =>
                                    onUpdateProduct({
                                      ...productInSlot,
                                      originalPrice: e.target.value ? Number(e.target.value) : undefined,
                                    })
                                  }
                                  placeholder="قبل الخصم"
                                  className="w-full text-[10px] p-1 bg-white border border-stone-300 rounded font-bold"
                                />
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-emerald-800 block">
                                  سعر العرض:
                                </span>
                                <input
                                  type="number"
                                  value={productInSlot.price}
                                  onChange={(e) =>
                                    onUpdateProduct({
                                      ...productInSlot,
                                      price: Number(e.target.value),
                                    })
                                  }
                                  placeholder="سعر العرض"
                                  className="w-full text-[10px] p-1 bg-white border border-emerald-500 rounded font-black text-emerald-900"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={productInSlot.offerDiscountText || ''}
                                onChange={(e) =>
                                  onUpdateProduct({
                                    ...productInSlot,
                                    offerDiscountText: e.target.value,
                                  })
                                }
                                placeholder="تعديل شارة الخصم..."
                                className="w-full text-[10px] p-1 bg-white border border-amber-300 rounded-lg font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(productInSlot)}
                                className="p-1 text-emerald-800 hover:bg-emerald-50 rounded border border-emerald-200 shrink-0"
                                title="تعديل صورة الصنف من الاستديو"
                              >
                                <Camera className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onToggleSpecialOffer(productInSlot.id)}
                                className="text-[10px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-1 rounded shrink-0 transition-colors cursor-pointer"
                                title="إزالة من خانة العروض"
                              >
                                إلغاء
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-4">
                          <p className="text-xs font-bold text-stone-500">
                            خانة عروض شاغرة
                          </p>
                          <p className="text-[10px] text-stone-400 mt-1 max-w-[140px]">
                            اختر صنفاً من القائمة أدناه لنشره في هذه الخانة
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Products Selector to Assign / Toggle into Special Offers */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black text-stone-900">
                    قائمة أصناف المتجر (اضغط لتضمين أو إلغاء الصنف من العروض):
                  </h3>
                  <p className="text-[10px] text-stone-400">
                    يمكنك البحث في كافة الأقسام الخمسة وإدراج أي فاكهة أو خضار أو تمور مباشرة
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="بحث عن صنف..."
                      className="text-xs p-2 pr-7 pl-2 bg-stone-50 border border-stone-200 rounded-xl w-36 sm:w-48"
                    />
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2" />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
                    className="text-xs bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-stone-700"
                  >
                    <option value="all">كل الأقسام</option>
                    <option value="local_fruits">قسم ١: فواكه بلدي</option>
                    <option value="imported_fruits">قسم ٢: فواكه مستوردة</option>
                    <option value="vegetables">قسم ٣: خضروات</option>
                    <option value="dates">قسم ٤: تمور فاخرة</option>
                    <option value="dried_fruits">قسم ٥: فواكه مجففة</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="divide-y divide-stone-100 max-h-[420px] overflow-y-auto">
                {products
                  .filter((p) => {
                    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
                    if (searchQuery.trim()) {
                      const q = searchQuery.toLowerCase();
                      return (
                        p.name.toLowerCase().includes(q) ||
                        p.arabicName.toLowerCase().includes(q) ||
                        p.categoryLabel.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  })
                  .map((p) => {
                    const isOffer = !!p.isSpecialOffer;
                    const activeOffers = products.filter((item) => item.isSpecialOffer);
                    const slotNumber = isOffer
                      ? activeOffers.findIndex((item) => item.id === p.id) + 1
                      : null;

                    return (
                      <div
                        key={p.id}
                        className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                          isOffer ? 'bg-amber-50/50' : 'hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-11 h-11 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-black text-xs text-stone-900 truncate">
                                {p.name}
                              </h4>
                              {isOffer && slotNumber && slotNumber <= maxOfferSlots && (
                                <span className="bg-amber-400 text-stone-950 font-black text-[9px] px-1.5 py-0.2 rounded shadow-xs">
                                  في الخانة {slotNumber} ⭐
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                              <span>{p.categoryLabel}</span>
                              <span>•</span>
                              <span className="font-extrabold text-emerald-800">
                                {p.price} {currency} /{p.unit}
                              </span>
                              {p.originalPrice && (
                                <span className="line-through text-stone-400">
                                  {p.originalPrice} {currency}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Controls: Edit Offer Badge & Toggle Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isOffer && (
                            <input
                              type="text"
                              value={p.offerDiscountText || ''}
                              onChange={(e) =>
                                onUpdateProduct({
                                  ...p,
                                  offerDiscountText: e.target.value,
                                })
                              }
                              placeholder="شارة الخصم (مثال: خصم 20%)"
                              className="text-[11px] p-1.5 bg-white border border-amber-300 rounded-lg w-28 sm:w-36 text-center font-bold text-stone-800"
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => onToggleSpecialOffer(p.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                              isOffer
                                ? 'bg-amber-400 hover:bg-amber-500 text-stone-950 shadow-xs'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300'
                            }`}
                          >
                            <span>{isOffer ? '✓ مدرج في العروض' : '+ إدراج بالعروض'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 2: ELECTRONIC WALLETS CONFIGURATION ================= */}
        {activeAdminTab === 'wallets' && (
          <div className="space-y-4 pb-12">
            <div className="bg-emerald-900 text-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-sm font-black flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                إدارة رموز نقاط المحافظ الإلكترونية لمتجر الجمل
              </h2>
              <p className="text-xs text-emerald-200 mt-1">
                عدّل رموز النقاط (Merchant Point Codes) وأرقام الحسابات لمحافظ: جيب، الكريمي، وجوالي لتظهر للزبائن في سلة المشتريات بدقة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {wallets.map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-stone-900">
                        {w.name}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                        {w.badge}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs bg-stone-50 rounded-xl p-3 border border-stone-200 my-2">
                      <div className="flex justify-between">
                        <span className="text-stone-500">رمز النقطة:</span>
                        <strong className="text-emerald-900 font-mono text-sm">
                          {w.pointCode}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">رقم الحساب / الهاتف:</span>
                        <strong className="text-stone-800 font-mono">
                          {w.accountNumber}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">اسم النقطة المعتمَد:</span>
                        <span className="font-semibold text-stone-700">
                          {w.merchantName}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      {w.instructions}
                    </p>
                  </div>

                  <button
                    onClick={() => setEditingWallet(w)}
                    className="mt-3 w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل رمز النقطة والبيانات</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SECTION 3: ORDERS MANAGEMENT ================= */}
        {activeAdminTab === 'orders' && (
          <div className="space-y-3 pb-12">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h2 className="text-sm font-black text-stone-900">
                قائمة طلبات العملاء ({orders.length})
              </h2>
              <span className="text-xs text-stone-500">
                تأكيد ومطابقة مبالغ المحافظ وتحديث مسار التوصيل
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-stone-400">
                لا توجد طلبات واردة حالياً
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-emerald-950">
                        طلب رقم #{ord.id}
                      </span>
                      <span className="text-xs text-stone-400 mr-2">
                        {ord.date}
                      </span>
                    </div>

                    {/* Order Status Controller */}
                    <div className="flex items-center gap-1.5">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          onUpdateOrderStatus(ord.id, e.target.value as Order['status'])
                        }
                        className="text-xs font-bold rounded-lg p-1.5 border border-stone-300 bg-stone-50 text-stone-800"
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="preparing">قيد التجهيز</option>
                        <option value="on_way">جاري التوصيل</option>
                        <option value="delivered">تم التسليم</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Info & Wallet Reference Code */}
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-stone-500">طريقة الدفع: </span>
                      <strong className="text-stone-900">{ord.paymentMethod}</strong>
                    </div>

                    {ord.transactionReference && (
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-1.5 text-amber-950 font-bold">
                        <span>رقم عملية / إشعار المحفظة: </span>
                        <span className="font-mono text-sm underline">
                          {ord.transactionReference}
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="text-stone-500">العنوان: </span>
                      <span className="text-stone-800">{ord.address.street}</span>
                    </div>

                    <div>
                      <span className="text-stone-500">وقت التوصيل: </span>
                      <span className="text-stone-800">{ord.deliveryTimeSlot}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="text-xs">
                    <span className="font-bold text-stone-600">الأصناف: </span>
                    <span className="text-stone-800">
                      {ord.items
                        .map(
                          (i) =>
                            `${i.product.name} (${i.selectedWeight.label}) × ${i.quantity}`
                        )
                        .join(' ، ')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div className="text-xs">
                      <span>إجمالي الفاتورة: </span>
                      <strong className="text-sm font-black text-emerald-900">
                        {ord.total} {currency}
                      </strong>
                    </div>

                    <a
                      href={`https://wa.me/967${ord.address.phone.replace(/\D/g, '')}?text=مرحباً%20بك،%20بخصوص%20طلبك%20رقم%20${ord.id}%20من%20متجر%20الجمل`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>تواصل واتساب مع العميل</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ================= MODAL: ADD / EDIT PROMOTIONAL OFFER ================= */}
      {(editingOffer || isAddOfferMode) && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto text-right">
            <button
              type="button"
              onClick={() => {
                setEditingOffer(null);
                setIsAddOfferMode(false);
              }}
              className="absolute top-4 left-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-base text-stone-900">
                {isAddOfferMode
                  ? 'إضافة عرض ترويجي جديد إلى قائمة العروض'
                  : `تعديل العرض: ${offerForm.title}`}
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              إضافة وإزالة صور العرض من الاستديو، وتحديد السعر القديم وسعر العرض الجديد واحتساب الخصم.
            </p>

            <form onSubmit={handleSaveOffer} className="space-y-4 text-xs">
              {/* 1. STUDIO IMAGES SECTION: Multiple images upload & individual deletion */}
              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-3">
                <input
                  type="file"
                  ref={offerFileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleOfferStudioImagesSelect}
                  className="hidden"
                />

                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-stone-900 text-xs flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-800" />
                    <span>صور العرض من الاستديو (إضافة وإزالة صور):</span>
                  </label>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    من استديو الهاتف
                  </span>
                </div>

                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => offerFileInputRef.current?.click()}
                  disabled={isUploadingOfferImages}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>
                    {isUploadingOfferImages
                      ? 'جاري ضغط ومعالجة الصور من الاستديو...'
                      : '📷 اختيار صور من استديو جهازك (يمكن اختيار أكثر من صورة)'}
                  </span>
                </button>

                {offerImageSuccessMessage && (
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px] text-center">
                    {offerImageSuccessMessage}
                  </div>
                )}

                {/* Gallery Preview & Removal Grid */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10.5px] font-bold text-stone-600">
                      الصور المرفوعة للعرض ({offerForm.gallery?.length || (offerForm.image ? 1 : 0)}):
                    </span>
                    <span className="text-[10px] text-stone-400">
                      اضغط 🗑️ لإزالة أي صورة أو ⭐ لتعيينها كصورة رئيسية
                    </span>
                  </div>

                  {(!offerForm.gallery || offerForm.gallery.length === 0) && !offerForm.image ? (
                    <div className="text-center py-4 bg-white rounded-xl border border-dashed border-stone-300">
                      <ImageIcon className="w-7 h-7 text-stone-300 mx-auto mb-1" />
                      <p className="text-[11px] font-bold text-stone-500">
                        لم يتم اختيار أي صور من الاستديو بعد
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        اضغط الزر الأخضر أعلاه لاختيار صور العرض من المعرض
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {(offerForm.gallery && offerForm.gallery.length > 0
                        ? offerForm.gallery
                        : [offerForm.image || '']
                      ).map((imgUrl, imgIdx) => {
                        const isMain = offerForm.image === imgUrl || (!offerForm.image && imgIdx === 0);

                        return (
                          <div
                            key={imgIdx}
                            className={`relative rounded-xl overflow-hidden bg-stone-100 border-2 group aspect-square ${
                              isMain ? 'border-amber-400 ring-2 ring-amber-300' : 'border-stone-200'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`صورة ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />

                            {/* Main Badge */}
                            {isMain && (
                              <span className="absolute top-1 right-1 bg-amber-400 text-stone-950 font-black text-[8px] px-1.5 py-0.2 rounded shadow-xs">
                                الرئيسية ⭐
                              </span>
                            )}

                            {/* Action Buttons overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                              {!isMain && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryOfferImage(imgUrl)}
                                  className="p-1 rounded-md bg-amber-400 hover:bg-amber-300 text-stone-950 text-[10px] font-bold cursor-pointer"
                                  title="تعيين كصورة رئيسية"
                                >
                                  ⭐
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveOfferImage(imgIdx)}
                                className="p-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold cursor-pointer"
                                title="إزالة هذه الصورة من العرض"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. PRICING SECTION: Old Price vs Offer Price */}
              <div className="bg-amber-500/10 rounded-2xl p-3.5 border-2 border-amber-300/80 space-y-3">
                <div className="flex items-center gap-1.5 text-stone-900 font-extrabold text-xs">
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span>تحديد السعر القديم وسعر العرض:</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      السعر القديم ({currency}):
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={offerForm.oldPrice ?? ''}
                      onChange={(e) =>
                        setOfferForm({
                          ...offerForm,
                          oldPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="مثال: 120"
                      className="w-full p-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-700"
                    />
                    <span className="text-[9.5px] text-stone-400 mt-0.5 block">
                      قبل التخفيض
                    </span>
                  </div>

                  <div>
                    <label className="block font-black text-emerald-900 mb-1">
                      سعر العرض ({currency}) *:
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={offerForm.offerPrice ?? ''}
                      onChange={(e) =>
                        setOfferForm({
                          ...offerForm,
                          offerPrice: Number(e.target.value),
                        })
                      }
                      placeholder="مثال: 90"
                      className="w-full p-2 rounded-xl border-2 border-emerald-600 bg-white font-black text-emerald-900 text-sm"
                    />
                    <span className="text-[9.5px] text-emerald-700 mt-0.5 block font-bold">
                      السعر المخفض
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      وحدة العرض:
                    </label>
                    <input
                      type="text"
                      value={offerForm.unit || ''}
                      onChange={(e) =>
                        setOfferForm({ ...offerForm, unit: e.target.value })
                      }
                      placeholder="كرتون 5 كجم، سلة..."
                      className="w-full p-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-800"
                    />
                    <span className="text-[9.5px] text-stone-400 mt-0.5 block">
                      مثال: كرتون، كجم
                    </span>
                  </div>
                </div>

                {/* Real-time Savings Banner */}
                {offerForm.oldPrice &&
                  offerForm.offerPrice &&
                  Number(offerForm.oldPrice) > Number(offerForm.offerPrice) && (
                    <div className="bg-emerald-900 text-white rounded-xl p-2.5 flex items-center justify-between text-xs font-bold shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <Percent className="w-4 h-4 text-amber-300" />
                        <span>
                          نسبة الخصم: {Math.round(((Number(offerForm.oldPrice) - Number(offerForm.offerPrice)) / Number(offerForm.oldPrice)) * 100)}%
                        </span>
                      </div>
                      <div className="text-amber-300 font-black">
                        مقدار التوفير للعميل: {Number(offerForm.oldPrice) - Number(offerForm.offerPrice)} {currency}
                      </div>
                    </div>
                  )}
              </div>

              {/* 3. OFFER DETAILS: Title, Description, Badges */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    عنوان العرض *:
                  </label>
                  <input
                    type="text"
                    required
                    value={offerForm.title || ''}
                    onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                    placeholder="مثال: عرض الأسبوع: كرتون تمر مجدول + تفاح مجاني"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-700/20 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    تفاصيل ووصف العرض:
                  </label>
                  <textarea
                    rows={2}
                    value={offerForm.description || ''}
                    onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                    placeholder="اكتب ما يشمله العرض من كميات وأصناف طازجة..."
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-700/20"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      شارة العرض:
                    </label>
                    <input
                      type="text"
                      value={offerForm.badge || 'عرض خاص'}
                      onChange={(e) => setOfferForm({ ...offerForm, badge: e.target.value })}
                      placeholder="عرض الأسبوع، عرض حصري"
                      className="w-full p-2 rounded-xl border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      شارة التوفير:
                    </label>
                    <input
                      type="text"
                      value={offerForm.tag || ''}
                      onChange={(e) => setOfferForm({ ...offerForm, tag: e.target.value })}
                      placeholder="وفر 25%، توصيل مجاني"
                      className="w-full p-2 rounded-xl border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      مدة وسريان العرض:
                    </label>
                    <input
                      type="text"
                      value={offerForm.expiryDate || 'ساري طوال الأسبوع'}
                      onChange={(e) => setOfferForm({ ...offerForm, expiryDate: e.target.value })}
                      placeholder="ينتهي خلال 3 أيام"
                      className="w-full p-2 rounded-xl border border-stone-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    كوبون خصم إضافي (اختياري):
                  </label>
                  <input
                    type="text"
                    value={offerForm.code || ''}
                    onChange={(e) => setOfferForm({ ...offerForm, code: e.target.value })}
                    placeholder="مثال: WEEKLYDEAL"
                    className="w-full p-2 rounded-xl border border-stone-300 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-stone-200">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-black py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isAddOfferMode ? 'حفظ ونشر العرض' : 'حفظ التعديلات'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingOffer(null);
                    setIsAddOfferMode(false);
                  }}
                  className="px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {(editingProduct || isAddMode) && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto text-right">
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsAddMode(false);
              }}
              className="absolute top-4 left-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-base text-stone-900 mb-1 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-800" />
              {isAddMode ? 'إضافة صنف جديد للمتجر' : `تعديل الصنف: ${productForm.name}`}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              املأ بيانات المنتج ليظهر للزبائن في القسم المناسب بالأسعار والأوزان المحددة.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    اسم المنتج:
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="مثال: تمر سكري رطب"
                    className="w-full p-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-700/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    القسم الرئيسي:
                  </label>
                  <select
                    value={productForm.category || 'local_fruits'}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value as Product['category'],
                      })
                    }
                    className="w-full p-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-700/20 font-bold"
                  >
                    <option value="local_fruits">قسم ١: فواكه بلدي</option>
                    <option value="imported_fruits">قسم ٢: فواكه مستوردة</option>
                    <option value="vegetables">قسم ٣: خضروات</option>
                    <option value="dates">قسم ٤: تمور فاخرة</option>
                    <option value="dried_fruits">قسم ٥: فواكه مجففة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    السعر الحالي ({currency}):
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-stone-300 font-bold text-emerald-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    السعر قبل الخصم:
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={productForm.originalPrice || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        originalPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="اختياري"
                    className="w-full p-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">الوحدة:</label>
                  <input
                    type="text"
                    value={productForm.unit || 'كجم'}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="كجم، كرتون، باقة"
                    className="w-full p-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">بلد المنشأ:</label>
                  <input
                    type="text"
                    value={productForm.origin || 'اليمن'}
                    onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
                    placeholder="مثال: اليمن - صعدة"
                    className="w-full p-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">شارة ترويجية:</label>
                  <input
                    type="text"
                    value={productForm.badge || ''}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="مثال: قطاف اليوم، نخب أول"
                    className="w-full p-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              {/* Studio Image Picker Section */}
              <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleStudioImageSelect}
                  className="hidden"
                />

                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-800" />
                    <span>صورة المنتج (من استديو الهاتف / الجهاز):</span>
                  </label>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    مباشر من المعرض
                  </span>
                </div>

                {/* Image Preview & Upload Controls */}
                <div className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-stone-200">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                    <img
                      src={productForm.image || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&auto=format&fit=crop&q=80'}
                      alt="معاينة"
                      className="w-full h-full object-cover"
                    />
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                        جاري الرفع...
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-black text-xs py-2 px-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-amber-300" />
                      <span>{productForm.image ? 'تغيير الصورة من الاستديو' : 'اختر صورة من الاستديو / الكاميرا'}</span>
                    </button>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-stone-400">يدعم JPG, PNG, WebP من جهازك</span>
                      <button
                        type="button"
                        onClick={() => setShowUrlFallback(!showUrlFallback)}
                        className="text-emerald-800 font-bold hover:underline"
                      >
                        {showUrlFallback ? 'إخفاء حقل الرابط' : 'أو إدخال رابط'}
                      </button>
                    </div>
                  </div>
                </div>

                {studioUploadSuccess && (
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>تم اختيار وضغط الصورة من استديو جهازك بنجاح!</span>
                  </div>
                )}

                {/* Optional URL input fallback */}
                {showUrlFallback && (
                  <div className="pt-1.5 border-t border-stone-200 animate-in fade-in">
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">
                      رابط صورة خارجي بديل (URL):
                    </label>
                    <input
                      type="url"
                      value={productForm.image || ''}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="https://..."
                      className="w-full p-2 bg-white rounded-xl border border-stone-300 text-[11px] font-mono dir-ltr text-right"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">الوصف التفصيلي:</label>
                <textarea
                  rows={2}
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="مواصفات وطزاجة وجودة هذا المحصول..."
                  className="w-full p-2 rounded-xl border border-stone-300"
                />
              </div>

              {/* In stock and flags toggles */}
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.inStock ?? true}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="w-4 h-4 text-emerald-800 rounded"
                  />
                  <span className="font-bold text-stone-800">متوفر في المخزن</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isPopular ?? false}
                    onChange={(e) => setProductForm({ ...productForm, isPopular: e.target.checked })}
                    className="w-4 h-4 text-emerald-800 rounded"
                  />
                  <span className="font-bold text-stone-800">تمييز كـ الأكثر طلباً</span>
                </label>
              </div>

              {/* Special Offer Slot Option */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isSpecialOffer ?? false}
                    onChange={(e) => setProductForm({ ...productForm, isSpecialOffer: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded accent-amber-500"
                  />
                  <span className="font-black text-amber-950 text-xs flex items-center gap-1">
                    <span>🌟</span>
                    <span>عرض هذا الصنف في خانات "العروض الخاصة" بالقائمة الرئيسية</span>
                  </span>
                </label>

                {productForm.isSpecialOffer && (
                  <div className="pt-1.5 border-t border-amber-200/80">
                    <label className="block text-[11px] font-bold text-amber-950 mb-1">
                      نص شارة الخصم أو العرض:
                    </label>
                    <input
                      type="text"
                      value={productForm.offerDiscountText || ''}
                      onChange={(e) => setProductForm({ ...productForm, offerDiscountText: e.target.value })}
                      placeholder="مثال: خصم 25% ، اشتري 1 واحصل على 1 مجاناً"
                      className="w-full p-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-stone-200">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsAddMode(false);
                  }}
                  className="px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT WALLET ================= */}
      {editingWallet && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl relative animate-in zoom-in-95 text-right">
            <button
              onClick={() => setEditingWallet(null)}
              className="absolute top-4 left-4 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-sm text-stone-900 mb-1">
              تعديل بيانات {editingWallet.name}
            </h3>
            <p className="text-[11px] text-stone-500 mb-3">
              عدّل رمز النقطة ورقم الحساب المعتمد ليظهر لجميع العملاء.
            </p>

            <form onSubmit={handleSaveWallet} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  رمز النقطة (POS Point Code):
                </label>
                <input
                  type="text"
                  required
                  value={editingWallet.pointCode}
                  onChange={(e) =>
                    setEditingWallet({ ...editingWallet, pointCode: e.target.value })
                  }
                  className="w-full p-2 rounded-xl border border-stone-300 font-mono font-bold text-emerald-900 dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  رقم الحساب / الهاتف المرتبط:
                </label>
                <input
                  type="text"
                  required
                  value={editingWallet.accountNumber}
                  onChange={(e) =>
                    setEditingWallet({ ...editingWallet, accountNumber: e.target.value })
                  }
                  className="w-full p-2 rounded-xl border border-stone-300 font-mono font-bold dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  اسم النقطة / التاجر المسجل:
                </label>
                <input
                  type="text"
                  required
                  value={editingWallet.merchantName}
                  onChange={(e) =>
                    setEditingWallet({ ...editingWallet, merchantName: e.target.value })
                  }
                  className="w-full p-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">إرشادات السداد للعميل:</label>
                <textarea
                  rows={2}
                  value={editingWallet.instructions}
                  onChange={(e) =>
                    setEditingWallet({ ...editingWallet, instructions: e.target.value })
                  }
                  className="w-full p-2 rounded-xl border border-stone-300 text-[11px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  <span>تحديث رمز النقطة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingWallet(null)}
                  className="px-3 bg-stone-100 text-stone-700 font-bold py-2 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHANGE ADMIN PASSWORD ================= */}
      {isChangingPwd && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl relative animate-in zoom-in-95 text-right">
            <button
              onClick={() => setIsChangingPwd(false)}
              className="absolute top-4 left-4 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-sm text-stone-900 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-800" />
              تغيير كلمة المرور القوية للمدير
            </h3>
            <p className="text-[11px] text-stone-500 mb-3">
              اختر كلمة سر معقدة تحتوي على 8 خانات على الأقل مع حروف كبيرة وصغيرة وأرقام ورموز.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  كلمة المرور الجديدة:
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="مثال: AlJamal#Secure2026!"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-emerald-700/20"
                />

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-1.5">
                    <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          evaluatePasswordStrength(newPassword).level === 'قوية جداً'
                            ? 'bg-emerald-600'
                            : evaluatePasswordStrength(newPassword).level === 'متوسطة'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        } ${evaluatePasswordStrength(newPassword).width} transition-all duration-300`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-stone-500 mt-1 block">
                      مستوى القوة:{' '}
                      <strong className={evaluatePasswordStrength(newPassword).color}>
                        {evaluatePasswordStrength(newPassword).level}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  تأكيد كلمة المرور الجديدة:
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد كتابة كلمة المرور..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs"
                />
              </div>

              {pwdChangeError && (
                <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold">
                  {pwdChangeError}
                </div>
              )}

              {pwdChangeSuccess && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                  {pwdChangeSuccess}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 rounded-xl"
                >
                  حفظ كلمة السر الجديدة
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingPwd(false)}
                  className="px-3 bg-stone-100 text-stone-700 font-bold py-2 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
