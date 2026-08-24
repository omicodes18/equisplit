'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Trip, UserProfile } from '@/lib/types';
import { ChevronDown, Plus, Check, UserPlus, Sparkles } from 'lucide-react';
import { FairyAvatar } from './FairyAvatar';
import { SyncStatusPill } from './SyncStatusPill';

interface HeaderProps {
  trips: Trip[];
  activeTrip: Trip;
  userProfile: UserProfile;
  onSelectTrip: (tripId: string) => void;
  onCreateNewTrip: () => void;
  onOpenProfile: () => void;
  onOpenInvite: () => void;
}

export function Header({
  trips,
  activeTrip,
  userProfile,
  onSelectTrip,
  onCreateNewTrip,
  onOpenProfile,
  onOpenInvite,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 w-full z-40 pt-safe bg-surface/90 backdrop-blur-xl border-b border-white/5">
      <div className="h-16 sm:h-20 px-container-padding flex items-center justify-between gap-2">
        {/* Left Side: Brand Logo + Trip Switcher */}
        <div className="flex items-center gap-2.5 relative min-w-0" ref={dropdownRef}>
          {/* Logo SVG Icon */}
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0 shadow-[0_0_10px_rgba(244,114,182,0.3)]">
            <span className="text-base">✨</span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
              Nocturne Ledger
            </span>

            {/* Trip Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 text-left group truncate"
            >
              <span className="font-semibold text-sm sm:text-base text-on-surface group-hover:text-primary transition-colors truncate">
                {activeTrip.name} {activeTrip.emoji}
              </span>
              <ChevronDown
                size={16}
                className={`text-primary shrink-0 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Switcher Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-surface-container-highest/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-in fade-in duration-150">
              <div className="p-2 border-b border-white/5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant px-2.5 py-1 block">
                  Switch Event
                </span>
              </div>

              <div className="py-1 max-h-48 overflow-y-auto">
                {trips.map((t) => {
                  const isCurrent = t.id === activeTrip.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onSelectTrip(t.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs transition-colors ${
                        isCurrent
                          ? 'bg-primary/20 text-primary font-bold'
                          : 'text-on-surface hover:bg-white/5 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0">{t.emoji}</span>
                        <span className="truncate">{t.name}</span>
                      </div>
                      {isCurrent && <Check size={14} className="text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-white/5 bg-surface-container-low/60">
                <button
                  type="button"
                  onClick={() => {
                    onCreateNewTrip();
                    setDropdownOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus size={14} />
                  <span>Create Trip</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Invite Friends Button + Fairy Avatar Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Prominent Invite Friends / Share Trip Button */}
          <button
            type="button"
            onClick={onOpenInvite}
            title="Invite Friends / Share Trip QR Code"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-secondary-container/30 hover:bg-secondary-container/50 active:scale-95 border border-secondary/30 text-secondary-fixed-dim text-xs font-semibold shadow-[0_0_12px_rgba(192,132,252,0.2)] transition-all"
          >
            <UserPlus size={15} className="text-secondary" />
            <span className="hidden xs:inline">Invite</span>
          </button>

          {/* Fairy Avatar with Wings & Halo -> Click to open Profile */}
          <button
            type="button"
            onClick={onOpenProfile}
            title={`View profile for ${userProfile.name}`}
            className="relative focus:outline-none active:scale-95 transition-transform group"
          >
            <FairyAvatar
              name={userProfile.name}
              avatarUrl={userProfile.avatarUrl}
              size="sm"
              showWings={true}
              showHalo={true}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
