import React, { useState } from 'react';
import { DeliveryAddress } from '../types';
import { MapPin, Check, Plus, X } from 'lucide-react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: DeliveryAddress[];
  selectedAddressId: string;
  onSelectAddress: (address: DeliveryAddress) => void;
  onAddAddress: (newAddr: Omit<DeliveryAddress, 'id'>) => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddAddress,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');
  const [phone, setPhone] = useState('776 662 630');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد الموقع غير متوفرة في متصفحك');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setGpsLoading(false);
        setGpsSuccess(true);
        if (!street) {
          setStreet(`موقع GPS مباشر (خط العرض: ${position.coords.latitude.toFixed(4)}, خط الطول: ${position.coords.longitude.toFixed(4)})`);
        }
      },
      (error) => {
        setGpsLoading(false);
        alert('تعذر تحديد الموقع تلقائياً. يرجى إدخال تفاصيل الشارع يدوياً.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !street) return;

    onAddAddress({
      title,
      area: area || title,
      street,
      city: 'صنعاء',
      phone,
      isDefault: false,
      lat,
      lng,
    });

    setTitle('');
    setArea('');
    setStreet('');
    setLat(undefined);
    setLng(undefined);
    setGpsSuccess(false);
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-800" />
            تحديد عنوان التوصيل
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Store branches banner */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-2.5 my-2 text-right">
          <div className="text-[10px] font-black text-emerald-950 mb-1">
            فرع متجر الجمل للتوصيل والاستلام:
          </div>
          <div className="text-[10px] text-stone-700 space-y-0.5">
            <div>📍 <strong>المركز الرئيسي:</strong> حدة - داخل التوفير هايبر</div>
          </div>
        </div>

        {/* List of existing addresses */}
        {!showAddForm ? (
          <div className="py-2 space-y-2 max-h-[55vh] overflow-y-auto">
            {addresses.map((addr) => {
              const isSelected = addr.id === selectedAddressId;

              return (
                <div
                  key={addr.id}
                  onClick={() => {
                    onSelectAddress(addr);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border text-right cursor-pointer transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/70 shadow-xs'
                      : 'border-stone-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-stone-900">
                        {addr.title}
                      </span>
                      {addr.isDefault && (
                        <span className="bg-emerald-100 text-emerald-900 text-[9px] font-bold px-1.5 py-0.2 rounded">
                          افتراضي
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                      {addr.street}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-1">
                      هاتف: {addr.phone}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mt-2 py-2.5 px-3 rounded-xl border border-dashed border-emerald-700/60 hover:border-emerald-700 hover:bg-emerald-50/50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عنوان توصيل جديد</span>
            </button>
          </div>
        ) : (
          /* Add New Address Form */
          <form onSubmit={handleSubmitNew} className="py-3 space-y-2.5 text-right">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                اسم العنوان (مثال: البيت، المكتب، استراحة)
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="المنزل"
                className="w-full text-xs p-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                المنطقة / الحي
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="صنعاء - حدة"
                className="w-full text-xs p-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                تفاصيل الشارع ورقم المبنى
              </label>
              <textarea
                required
                rows={2}
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="شارع الخمسين، جوار سوبرماركت..."
                className="w-full text-xs p-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
            </div>

            {/* GPS Location Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleGetGpsLocation}
                disabled={gpsLoading}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  gpsSuccess
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                <span>📍</span>
                <span>
                  {gpsLoading
                    ? 'جاري تحديد موقعك عبر GPS...'
                    : gpsSuccess
                    ? '✓ تم تحديد موقع GPS الخاص بك بنجاح'
                    : 'تحديد موقعي الحالي تلقائياً (GPS)'}
                </span>
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2 rounded-xl"
              >
                حفظ واختيار
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 bg-stone-100 text-stone-700 font-bold text-xs py-2 rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
