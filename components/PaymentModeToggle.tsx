'use client';

import React from 'react';
import { PaymentMode } from '@/lib/types';
import { QrCode, Banknote } from 'lucide-react';

interface PaymentModeToggleProps {
  value: PaymentMode;
  onChange: (mode: PaymentMode) => void;
}

export function PaymentModeToggle({ value, onChange }: PaymentModeToggleProps) {
  const isUpi = value === 'UPI';

  return (
    <div className="flex items-center justify-center pt-2">
      <div className="flex p-1 bg-surface-container-lowest/90 backdrop-blur-md rounded-full border border-white/10 relative w-56">
        {/* Sliding Indicator */}
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 ${
            isUpi ? 'translate-x-0' : 'translate-x-full'
          }`}
        />

        {/* UPI Button */}
        <button
          type="button"
          onClick={() => onChange('UPI')}
          className={`w-1/2 py-2 rounded-full relative z-10 flex items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
            isUpi ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <QrCode size={16} className={isUpi ? 'text-primary' : 'text-on-surface-variant'} />
          <span>UPI</span>
        </button>

        {/* Cash Button */}
        <button
          type="button"
          onClick={() => onChange('CASH')}
          className={`w-1/2 py-2 rounded-full relative z-10 flex items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
            !isUpi ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Banknote size={16} className={!isUpi ? 'text-primary' : 'text-on-surface-variant'} />
          <span>Cash</span>
        </button>
      </div>
    </div>
  );
}
