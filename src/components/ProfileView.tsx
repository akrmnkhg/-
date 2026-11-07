import React from 'react';
import { Order, DeliveryAddress } from '../types';
import {
  User,
  Phone,
  MapPin,
  Clock,
  Package,
  Award,
  ChevronLeft,
  MessageCircle,
  HelpCircle,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface ProfileViewProps {
  orders: Order[];
  addresses: DeliveryAddress[];
  currency: string;
  onSelectCurrency: (curr: string) => void;
  onOpenAddressModal: () => void;
  onOpenAdmin: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  orders,
  addresses,
  currency,
  onSelectCurrency,
  onOpenAddressModal,
  onOpenAdmin,
}) => {
  return (
    <div className="space-y-4 pb-28">
      {/* User Header Profile Card */}
      <div className="bg-gradient-to-l from-emerald-900 to-emerald-800 text-white rounded-3xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-base truncate">العميل العزيز</h2>
            <p className="text-xs text-emerald-200 mt-0.5 dir-ltr text-right">
              +967 776 662 630
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Award className="w-3 h-3" />
                عضو بريميوم • 240 نقطة
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Currency & Preferences Switcher */}
      <div className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-xs">
        <div className="text-xs font-bold text-stone-900 mb-2">عملة التسعير:</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { label: 'ريال يمني (ر.ي)', value: 'ر.ي' },
            { label: 'ريال سعودي (ر.س)', value: 'ر.س' },
            { label: 'دولار ($)', value: '$' },
          ].map((c) => (
            <button
              key={c.value}
              onClick={() => onSelectCurrency(c.value)}
              className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                currency === c.value
                  ? 'bg-emerald-900 text-white border-emerald-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders History */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-emerald-800" />
            سجل طلباتي ({orders.length})
          </h3>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-stone-400 text-center py-4">
            لا توجد طلبات سابقة حتى الآن
          </p>
        ) : (
          <div className="space-y-2.5">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-3 rounded-xl bg-stone-50 border border-stone-200/90 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-stone-900">
                    طلب رقم #{ord.id}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {ord.status === 'delivered'
                      ? 'تم التسليم'
                      : ord.status === 'on_way'
                      ? 'جاري التوصيل'
                      : 'قيد التجهيز'}
                  </span>
                </div>

                <div className="text-[11px] text-stone-500 mt-1">
                  التاريخ: {ord.date} • {ord.items.length} أصناف
                </div>

                <div className="mt-2 pt-2 border-t border-stone-200 flex items-center justify-between font-bold">
                  <span className="text-stone-700">الإجمالي:</span>
                  <span className="text-emerald-900 font-extrabold">
                    {ord.total} {currency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Addresses */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-800" />
            العناوين المحفوظة
          </h3>
          <button
            onClick={onOpenAddressModal}
            className="text-[11px] text-emerald-800 font-bold hover:underline"
          >
            إدارة العناوين
          </button>
        </div>
        <div className="space-y-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800">{addr.title}</span>
                {addr.isDefault && (
                  <span className="text-[9px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded">
                    افتراضي
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5">{addr.street}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Manager / Admin Control Panel Access Gate */}
      <div className="bg-gradient-to-r from-stone-900 to-emerald-950 text-white rounded-2xl p-4 shadow-sm border border-stone-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-xs">
              <span className="p-1 rounded bg-amber-400/20 text-amber-300">🔐</span>
              <span>صفحة المدير ولوحة التحكم</span>
            </div>
            <h4 className="text-sm font-black mt-1">إدارة المنتجات ونقاط المحافظ</h4>
            <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
              صفحة مخصصة لمدير المتجر محمية بكلمة سر قوية لتعديل أسعار الكيلو والمحاصيل وإضافة منتجات وضبط رموز نقاط جيب والكريمي وجوالي.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAdmin}
          className="mt-3 w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-stone-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>دخول لوحة تحكم المدير</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Contact Store & Hotline */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-emerald-800" />
          تواصل مع متجر الجمل
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="tel:776662630"
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs p-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>اتصال هاتفي</span>
          </a>
          <a
            href="https://wa.me/967776662630"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs p-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>واتساب مباشر</span>
          </a>
        </div>
      </div>
    </div>
  );
};
