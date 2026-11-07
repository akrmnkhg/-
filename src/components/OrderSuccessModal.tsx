import React from 'react';
import { Order } from '../types';
import { CheckCircle2, Clock, MapPin, Phone, ShoppingBag, X } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  currency: string;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  currency,
  onClose,
  onViewOrders,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-center shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h3 className="text-lg font-black text-emerald-950 mb-1">
          تم استلام طلبك بنجاح!
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          شكراً لتسوقك من متجر الجمل. تم تحويل طلبك لفريق التجهيز والفرز.
        </p>

        {/* Order Details Receipt Card */}
        <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 text-right space-y-2 text-xs mb-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200">
            <span className="text-stone-500">رقم الطلب</span>
            <span className="font-extrabold text-stone-900 font-mono">#{order.id}</span>
          </div>

          <div className="flex items-center gap-2 text-stone-700">
            <span className="text-stone-500 text-[11px]">طريقة الدفع:</span>
            <span className="text-[11px] font-bold text-stone-900">{order.paymentMethod}</span>
          </div>

          {order.transactionReference && (
            <div className="flex justify-between items-center bg-amber-50 p-1.5 rounded-lg border border-amber-200 text-amber-950 font-bold">
              <span>رقم العملية / الحوالة:</span>
              <span className="font-mono text-xs">{order.transactionReference}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-stone-700">
            <Clock className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            <span className="text-[11px]">{order.deliveryTimeSlot}</span>
          </div>

          <div className="flex items-center gap-2 text-stone-700">
            <MapPin className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            <span className="text-[11px] truncate">{order.address.street}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-stone-200">
            <span className="font-bold text-stone-700">المبلغ الإجمالي</span>
            <span className="font-black text-emerald-900 text-sm">
              {order.total} {currency}
            </span>
          </div>
        </div>

        {/* Quick Hotline Confirmation */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 mb-4 flex items-center gap-2 text-right">
          <Phone className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            سيتصل بك مندوب التوصيل للتأكيد عبر الرقم{' '}
            <strong className="dir-ltr font-mono">776 662 630</strong>
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onViewOrders();
            }}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all"
          >
            متابعة حالة الطلب في حسابي
          </button>
          <button
            onClick={onClose}
            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs py-2 px-4 rounded-xl transition-all"
          >
            متابعة التسوق
          </button>
        </div>
      </div>
    </div>
  );
};
