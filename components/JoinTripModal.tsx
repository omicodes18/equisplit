'use client';

import React, { useState } from 'react';
import { Trip } from '@/lib/types';
import { triggerConfetti } from '@/lib/utils';
import { Sparkles, User, Users, ArrowRight } from 'lucide-react';

interface JoinTripModalProps {
  isOpen: boolean;
  trip: Trip;
  onJoin: (memberName: string) => void;
}

export function JoinTripModal({ isOpen, trip, onJoin }: JoinTripModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const host = trip.members[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name to join.');
      return;
    }

    if (trip.members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" is already in this trip. Please use a unique name or nickname.`);
      return;
    }

    triggerConfetti();
    onJoin(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-surface-variant/95 backdrop-blur-2xl rounded-[32px] p-6 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] space-y-5 text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

        {/* Trip Badge */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="w-16 h-16 rounded-3xl bg-surface-container flex items-center justify-center text-3xl border border-white/10 shadow-[0_0_20px_rgba(244,114,182,0.3)]">
            {trip.emoji || '✨'}
          </div>

          <h2 className="text-xl font-extrabold text-on-surface tracking-tight mt-1">
            Join {trip.name} ✨
          </h2>

          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface-container-lowest/60 px-3 py-1 rounded-full border border-white/5">
            <Users size={13} className="text-secondary" />
            <span>
              {host ? `Hosted by ${host.name}` : ''} {trip.members.length > 0 ? `• ${trip.members.length} member(s)` : ''}
            </span>
          </div>
        </div>

        {/* Join Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="p-2.5 rounded-xl bg-error/15 border border-error/30 text-error text-xs font-semibold text-center animate-in fade-in">
              {error}
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant pl-1 block">
              What&apos;s your name?
            </label>
            <div className="relative flex items-center px-4 py-3 rounded-2xl bg-surface-container-lowest/90 border border-white/10 focus-within:border-primary/50 transition-colors shadow-inner">
              <User size={18} className="text-on-surface-variant mr-2.5 shrink-0" />
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-transparent text-sm text-on-surface focus:outline-none placeholder-on-surface/40"
              />
            </div>
          </div>

          <p className="text-[11px] text-on-surface-variant leading-relaxed px-1">
            You&apos;ll be able to log shared expenses, split bills, and settle balances instantly.
          </p>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-[0_0_20px_rgba(244,114,182,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Enter Trip</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
