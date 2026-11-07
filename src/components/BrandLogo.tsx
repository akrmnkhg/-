import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const dimensions = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  }[size];

  return (
    <div className="flex flex-col items-center select-none">
      <div
        className={`${dimensions} relative rounded-full border-2 border-emerald-600/40 bg-white p-0.5 flex items-center justify-center shadow-md overflow-hidden hover:scale-105 transition-transform duration-300`}
      >
        <img
          src="/assets/aistudio/IMG_1918_6b43c639.PNG"
          alt="شعار الجمل للخضار والفواكه والتمور"
          className="w-full h-full object-contain rounded-full"
          loading="eager"
        />
      </div>

      {showSubtitle && size !== 'sm' && (
        <div className="text-center mt-1 space-y-0.5">
          <div className="text-[10.5px] text-stone-900 font-black">
            الجمل للخضار والفواكه والتمور
          </div>
          <div className="text-[9.5px] text-stone-600 font-bold">
            صنعاء - حدة داخل التوفير هايبر
          </div>
          <a
            href="tel:776662630"
            className="inline-flex items-center gap-1 dir-ltr text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-0.5 hover:bg-emerald-100 transition-colors"
          >
            <span>📞</span>
            <span>776 662 630</span>
          </a>
        </div>
      )}
    </div>
  );
};
