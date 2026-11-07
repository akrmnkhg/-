import React, { useState } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  return (
    <div className="min-h-screen bg-stone-200/70 text-stone-900 flex flex-col items-center justify-start p-0 sm:py-6 selection:bg-emerald-600 selection:text-white">
      {/* Top Floating Controls Bar */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-4xl px-4 py-2 mb-3 bg-white/90 backdrop-blur-md rounded-2xl border border-stone-300 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-stone-800">
            متجر الجمل • خضار وفواكه وتمور طازجة
          </span>
          <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono">
            صنعاء - حدة
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setIsMobileFrame(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isMobileFrame
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>عرض متجاوب</span>
          </button>
          <button
            onClick={() => setIsMobileFrame(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isMobileFrame
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>محاكي هاتف آيفون (مطابق للمرفق)</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      {isMobileFrame ? (
        /* Realistic Phone Frame matching Screen 1-6 */
        <div className="relative mx-auto my-2 w-full max-w-[420px] rounded-[48px] bg-stone-950 p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] ring-1 ring-white/10">
          {/* Dynamic Island / Speaker cutout */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-end px-3">
            <div className="w-3 h-3 rounded-full bg-stone-900 border border-stone-800" />
          </div>

          {/* Screen Content Wrapper */}
          <div className="relative rounded-[40px] bg-stone-50 overflow-hidden flex flex-col h-[850px] border border-stone-800/80">
            {/* Top Status Bar (9:41, icons) */}
            <div className="bg-white px-7 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-stone-800 select-none z-40 border-b border-stone-100">
              <span className="font-mono">9:41</span>
              <div className="flex items-center gap-1.5 opacity-80">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4 fill-stone-800" />
              </div>
            </div>

            {/* Inner App Container with custom scrollbar */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-300 relative bg-stone-50">
              {children}
            </div>

            {/* Bottom Home Indicator */}
            <div className="h-4 bg-white flex items-center justify-center pointer-events-none select-none z-50">
              <div className="w-28 h-1 bg-stone-300 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        /* Standard View: Clean Mobile-First Container that centers comfortably */
        <div className="w-full max-w-lg min-h-screen sm:min-h-[850px] bg-stone-50 sm:rounded-3xl sm:border sm:border-stone-200/90 sm:shadow-xl overflow-hidden flex flex-col relative">
          {children}
        </div>
      )}
    </div>
  );
};
