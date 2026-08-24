'use client';

import React, { useState } from 'react';
import { Trip, UserProfile, PaymentMode } from '@/lib/types';
import { calculateBalances, formatINR, triggerConfetti } from '@/lib/utils';
import { FairyAvatar } from './FairyAvatar';
import { PaymentModeToggle } from './PaymentModeToggle';
import {
  X,
  User,
  Check,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Image as ImageIcon,
  WalletCards,
  Layers,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  trips: Trip[];
}

const AVATAR_PRESETS = [
  {
    label: 'Fairy Priya',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'Aura',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'Neon Glow',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'Star',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

export function ProfileModal({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  trips,
}: ProfileModalProps) {
  const [name, setName] = useState(userProfile.name);
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl || '');
  const [preferredMode, setPreferredMode] = useState<PaymentMode>(
    userProfile.preferredPaymentMode || 'UPI'
  );
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'edit'>('overview');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Calculate summary balance across all trips for this user
  let totalYouOwe = 0;
  let totalYouAreOwed = 0;
  const tripBreakdowns: {
    id: string;
    name: string;
    emoji: string;
    netBalance: number;
    inTrip: boolean;
  }[] = [];

  trips.forEach((trip) => {
    const balances = calculateBalances(
      trip.members,
      trip.expenses,
      trip.settlements || []
    );

    // Match by ID or Name
    const userBal = balances.find(
      (b) =>
        b.member.id === userProfile.id ||
        b.member.name.trim().toLowerCase() === userProfile.name.trim().toLowerCase()
    );

    if (userBal) {
      const net = userBal.netBalance;
      if (net > 0) {
        totalYouAreOwed += net;
      } else if (net < 0) {
        totalYouOwe += Math.abs(net);
      }
      tripBreakdowns.push({
        id: trip.id,
        name: trip.name,
        emoji: trip.emoji,
        netBalance: net,
        inTrip: true,
      });
    } else {
      tripBreakdowns.push({
        id: trip.id,
        name: trip.name,
        emoji: trip.emoji,
        netBalance: 0,
        inTrip: false,
      });
    }
  });

  const netOverall = totalYouAreOwed - totalYouOwe;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: UserProfile = {
      ...userProfile,
      name: name.trim(),
      avatarUrl: avatarUrl.trim(),
      preferredPaymentMode: preferredMode,
    };

    onSaveProfile(updated);
    triggerConfetti();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-variant/95 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] shadow-[0_-8px_32px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-surface-container/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Sparkles size={16} />
            </div>
            <h2 className="font-bold text-base text-on-surface">Fairy Profile</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-on-surface-variant rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-transform"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Subtabs (Summary Overview vs Edit Profile) */}
        <div className="flex border-b border-white/5 bg-surface-container-lowest/50 px-5 pt-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('overview')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'overview'
                ? 'border-primary text-primary active-glow'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <WalletCards size={14} />
            <span>Balance Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('edit')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'edit'
                ? 'border-primary text-primary active-glow'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <User size={14} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Top Hero: Fairy Wings & Halo Avatar + Name Banner */}
          <div className="flex flex-col items-center justify-center pt-2 pb-3 relative">
            <FairyAvatar
              name={name || userProfile.name}
              avatarUrl={avatarUrl || userProfile.avatarUrl}
              size="xl"
              showWings={true}
              showHalo={true}
            />

            <h3 className="text-lg font-bold text-on-surface mt-4 flex items-center gap-1.5">
              <span>{name || userProfile.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-medium">
                You
              </span>
            </h3>

            <span className="text-xs text-on-surface-variant mt-0.5">
              Default Settlement: <strong className="text-tertiary-fixed-dim font-bold">{preferredMode}</strong>
            </span>
          </div>

          {/* TAB 1: OVERVIEW (Summary Balances Across Trips) */}
          {activeSubTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Grand Total Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Total You Owe */}
                <div className="rounded-2xl p-4 bg-surface-container/80 border border-primary/20 relative overflow-hidden shadow-sm">
                  <div className="flex items-center gap-1.5 text-primary text-[11px] font-bold uppercase tracking-wider mb-1">
                    <ArrowDownLeft size={14} />
                    <span>Total You Owe</span>
                  </div>
                  <div className="text-2xl font-extrabold text-primary drop-shadow-[0_0_8px_rgba(244,114,182,0.3)]">
                    ₹{formatINR(totalYouOwe)}
                  </div>
                  <span className="text-[10px] text-on-surface-variant mt-1 block">
                    Across all your active trips
                  </span>
                </div>

                {/* Total You Are Owed */}
                <div className="rounded-2xl p-4 bg-surface-container/80 border border-tertiary/20 relative overflow-hidden shadow-sm">
                  <div className="flex items-center gap-1.5 text-tertiary text-[11px] font-bold uppercase tracking-wider mb-1">
                    <ArrowUpRight size={14} />
                    <span>You Are Owed</span>
                  </div>
                  <div className="text-2xl font-extrabold text-tertiary-fixed-dim drop-shadow-[0_0_8px_rgba(249,189,34,0.35)]">
                    ₹{formatINR(totalYouAreOwed)}
                  </div>
                  <span className="text-[10px] text-on-surface-variant mt-1 block">
                    To be collected from friends
                  </span>
                </div>
              </div>

              {/* Net Position Pill */}
              <div
                className={`w-full rounded-xl p-3 flex items-center justify-between border ${
                  netOverall >= 0
                    ? 'bg-secondary-container/20 border-secondary/30 text-secondary-fixed-dim'
                    : 'bg-primary/15 border-primary/30 text-primary-fixed-dim'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-tertiary shrink-0" />
                  <span className="text-xs font-semibold">
                    {netOverall >= 0
                      ? `Net Positive: You get back ₹${formatINR(netOverall)} in total`
                      : `Net Negative: You owe ₹${formatINR(Math.abs(netOverall))} in total`}
                  </span>
                </div>
              </div>

              {/* Per-Trip Breakdown Section */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant flex items-center gap-1.5">
                    <Layers size={13} />
                    <span>Trip-by-Trip Ledger</span>
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    {tripBreakdowns.length} Events
                  </span>
                </div>

                <div className="space-y-2">
                  {tripBreakdowns.map((tb) => (
                    <div
                      key={tb.id}
                      className="rounded-xl p-3 bg-surface-container-lowest/70 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{tb.emoji}</span>
                        <div>
                          <h4 className="text-xs font-bold text-on-surface">{tb.name}</h4>
                          <span className="text-[10px] text-on-surface-variant">
                            {tb.inTrip ? 'Active Member' : 'Not in group'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {tb.netBalance > 0 ? (
                          <span className="text-xs font-extrabold text-tertiary-fixed-dim">
                            +₹{formatINR(tb.netBalance)}
                          </span>
                        ) : tb.netBalance < 0 ? (
                          <span className="text-xs font-extrabold text-primary">
                            -₹{formatINR(Math.abs(tb.netBalance))}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-on-surface-variant">
                            Settled ₹0
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeSubTab === 'edit' && (
            <form onSubmit={handleSave} className="space-y-4 animate-in fade-in duration-150">
              {/* Display Name */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant pl-1 block">
                  Display Name
                </label>
                <div className="relative flex items-center px-3.5 py-2.5 rounded-xl bg-surface-container-lowest/80 border border-white/10 focus-within:border-primary/50 transition-colors">
                  <User size={16} className="text-on-surface-variant mr-2.5 shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-transparent text-sm text-on-surface focus:outline-none placeholder-on-surface/40"
                  />
                </div>
              </div>

              {/* Bitmoji or Avatar URL */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant pl-1 block">
                  Custom Bitmoji / Avatar Image URL
                </label>
                <div className="relative flex items-center px-3.5 py-2.5 rounded-xl bg-surface-container-lowest/80 border border-white/10 focus-within:border-primary/50 transition-colors">
                  <ImageIcon size={16} className="text-on-surface-variant mr-2.5 shrink-0" />
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://... (Bitmoji or photo URL)"
                    className="w-full bg-transparent text-xs text-on-surface focus:outline-none placeholder-on-surface/40"
                  />
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-on-surface-variant hover:text-on-surface text-xs font-semibold ml-2"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Preset Avatars Quick Select */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant pl-1">
                    Or Choose Fairy Preset:
                  </span>
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(preset.url)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                          avatarUrl === preset.url
                            ? 'bg-primary/20 border-primary text-primary shadow-sm'
                            : 'bg-surface-container-lowest border-white/5 text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Default Preferred Settlement Mode */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant pl-1 block">
                  Default Preferred Settlement Mode
                </label>
                <PaymentModeToggle value={preferredMode} onChange={setPreferredMode} />
                <p className="text-[11px] text-on-surface-variant text-center mt-1">
                  Your default mode when paying or logging expenses.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-full border border-white/15 text-xs font-bold text-on-surface-variant active:scale-[0.98] transition-transform"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 px-4 rounded-full bg-primary text-on-primary text-xs font-bold shadow-[0_0_20px_rgba(244,114,182,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
                >
                  {savedSuccess ? (
                    <>
                      <Check size={16} />
                      <span>Saved! ✨</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
