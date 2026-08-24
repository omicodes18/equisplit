'use client';

import React from 'react';
import { LayoutDashboard, Wallet, Sparkles } from 'lucide-react';

export type TabType = 'dashboard' | 'expenses' | 'settle-up';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { key: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'expenses' as TabType, label: 'Expenses', icon: Wallet },
    { key: 'settle-up' as TabType, label: 'Settle Up', icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-surface/90 backdrop-blur-2xl border-t border-white/5">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${
                isActive
                  ? 'text-primary active-glow font-bold scale-105'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon size={19} className={isActive ? 'text-primary' : 'text-on-surface-variant'} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
