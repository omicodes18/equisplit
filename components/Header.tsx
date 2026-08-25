'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trip, UserProfile } from '@/lib/types';
import { ChevronDown, Plus, Check, UserPlus, Trash2, AlertTriangle, Home } from 'lucide-react';
import { FairyAvatar } from './FairyAvatar';

interface HeaderProps {
  trips: Trip[];
  activeTrip: Trip;
  userProfile: UserProfile;
  onSelectTrip: (tripId: string) => void;
  onCreateNewTrip: () => void;
  onDeleteTrip?: (tripId: string) => void;
  onOpenProfile: () => void;
  onOpenInvite: () => void;
}

export function Header({
  trips,
  activeTrip,
  userProfile,
  onSelectTrip,
  onCreateNewTrip,
  onDeleteTrip,
  onOpenProfile,
  onOpenInvite,
}: HeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
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

  const handleConfirmDeleteTrip = () => {
    if (tripToDelete && onDeleteTrip) {
      onDeleteTrip(tripToDelete.id);
      setTripToDelete(null);
      setDropdownOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 w-full z-40 pt-safe bg-surface/90 backdrop-blur-xl border-b border-white/5">
        <div className="h-16 sm:h-20 px-container-padding flex items-center justify-between gap-2">
          {/* Left Side: Home Button + Brand Logo + Trip Switcher */}
          <div className="flex items-center gap-2 relative min-w-0" ref={dropdownRef}>
            {/* Back to My Trips Hub Button */}
            <button
              type="button"
              onClick={() => router.push('/')}
              title="Back to My Trips Hub"
              className="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/10 flex items-center justify-center text-on-surface hover:text-primary shrink-0 active:scale-95 transition-all cursor-pointer"
            >
              <Home size={15} />
            </button>

            <div className="flex flex-col min-w-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-primary">
                Nocturne Ledger
              </span>

              {/* Trip Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 text-left group truncate cursor-pointer"
              >
                <span className="font-semibold text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors truncate max-w-[130px] sm:max-w-[170px]">
                  {activeTrip.name} {activeTrip.emoji}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-primary shrink-0 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Switcher Dropdown */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-surface-container-highest/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-in fade-in duration-150">
                <div className="p-2.5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant px-1">
                    Your Rooms ({trips.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      router.push('/');
                      setDropdownOpen(false);
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    View All Hub →
                  </button>
                </div>

                <div className="py-1 max-h-56 overflow-y-auto">
                  {trips.map((t) => {
                    const isCurrent = t.id === activeTrip.id;
                    return (
                      <div
                        key={t.id}
                        className={`w-full px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors group ${
                          isCurrent
                            ? 'bg-primary/15 text-primary font-bold'
                            : 'text-on-surface hover:bg-white/5 font-medium'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTrip(t.id);
                            setDropdownOpen(false);
                          }}
                          className="flex items-center gap-2 truncate flex-1 text-left cursor-pointer"
                        >
                          <span className="text-sm shrink-0">{t.emoji}</span>
                          <span className="truncate">{t.name}</span>
                          {isCurrent && <Check size={14} className="text-primary shrink-0 ml-1" />}
                        </button>

                        {/* Delete Trip Icon */}
                        {onDeleteTrip && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTripToDelete(t);
                            }}
                            className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-white/10 opacity-70 hover:opacity-100 transition-all shrink-0 ml-1"
                            title={`Delete trip "${t.name}"`}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Actions: Create Trip */}
                <div className="p-2 border-t border-white/5 bg-surface-container-low/60 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onCreateNewTrip();
                      setDropdownOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create New Trip</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Invite Friends Button + Fairy Avatar Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Prominent Invite Friends / Share Trip Button */}
            <button
              type="button"
              onClick={onOpenInvite}
              title="Invite Friends / Share Trip QR Code"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-secondary-container/30 hover:bg-secondary-container/50 active:scale-95 border border-secondary/30 text-secondary-fixed-dim text-xs font-semibold shadow-[0_0_12px_rgba(192,132,252,0.2)] transition-all cursor-pointer"
            >
              <UserPlus size={14} className="text-secondary" />
              <span className="hidden xs:inline">Invite</span>
            </button>

            {/* Fairy Avatar with Wings & Halo -> Click to open Profile */}
            <button
              type="button"
              onClick={onOpenProfile}
              title={userProfile.name ? `Profile: ${userProfile.name}` : 'Profile'}
              className="relative focus:outline-none active:scale-95 transition-transform group cursor-pointer"
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

      {/* Delete Trip Confirmation Modal */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-surface-variant/95 backdrop-blur-2xl rounded-3xl p-5 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-error/20 border border-error/30 flex items-center justify-center text-error shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-on-surface">
                  Delete &ldquo;{tripToDelete.name}&rdquo;?
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Are you sure you want to delete this trip and its {tripToDelete.expenses.length} expenses? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="flex-1 py-2.5 rounded-full border border-white/15 text-xs font-bold text-on-surface-variant hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTrip}
                className="flex-1 py-2.5 rounded-full bg-error text-white text-xs font-bold shadow-[0_0_15px_rgba(255,180,171,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete Trip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
