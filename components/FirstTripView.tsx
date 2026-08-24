'use client';

import React, { useState } from 'react';
import { Trip, Member, UserProfile } from '@/lib/types';
import { triggerConfetti } from '@/lib/utils';
import { Sparkles, Compass, ShieldCheck, User } from 'lucide-react';
import { FairyAvatar } from './FairyAvatar';

interface FirstTripViewProps {
  userProfile: UserProfile;
  onCreateTrip: (newTrip: Trip, creatorName?: string) => void;
  onOpenProfile: () => void;
}

const EMOJIS = ['🌴', '🏕️', '🚗', '🏔️', '🏙️', '🍕', '🍻', '✈️', '🏖️', '🍣', '🎸', '☕'];

const MEMBER_COLORS = [
  '#f472b6', // pink
  '#ddb8ff', // lavender
  '#f9bd22', // gold
  '#62259b', // purple
  '#34d399', // emerald
  '#60a5fa', // sky blue
  '#ca9700', // amber
  '#f87171', // rose
];

export function FirstTripView({
  userProfile,
  onCreateTrip,
  onOpenProfile,
}: FirstTripViewProps) {
  const [tripName, setTripName] = useState('');
  const [hostName, setHostName] = useState(userProfile.name || '');
  const [emoji, setEmoji] = useState('🌴');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tripName.trim()) {
      setError('Please enter a trip name.');
      return;
    }

    if (!hostName.trim()) {
      setError('Please enter your name as the host.');
      return;
    }

    const slug = tripName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');

    const hostId = userProfile.id || `member-${Date.now()}`;
    const hostMember: Member = {
      id: hostId,
      name: hostName.trim(),
      avatarColor: MEMBER_COLORS[0],
      avatarUrl: userProfile.avatarUrl,
    };

    const newTrip: Trip = {
      id: `${slug || 'trip'}-${Date.now().toString().slice(-4)}`,
      name: tripName.trim(),
      emoji,
      members: [hostMember],
      expenses: [],
      settlements: [],
    };

    triggerConfetti();
    onCreateTrip(newTrip, hostName.trim());
  };

  return (
    <div className="min-h-screen bg-[#091E15] text-[#d0e8d9] flex justify-center selection:bg-primary/30 selection:text-primary">
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-[#03170e] shadow-2xl border-x border-white/5 pb-10">
        {/* Minimal Header */}
        <header className="sticky top-0 w-full z-40 pt-safe bg-surface/90 backdrop-blur-xl border-b border-white/5 px-container-padding h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0 shadow-[0_0_10px_rgba(244,114,182,0.3)]">
              <span className="text-base">✨</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                Nocturne Ledger
              </span>
              <span className="font-semibold text-sm text-on-surface">Start a Room</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            title={userProfile.name ? `Profile: ${userProfile.name}` : 'Profile'}
            className="focus:outline-none active:scale-95 transition-transform cursor-pointer"
          >
            <FairyAvatar
              name={hostName || userProfile.name}
              avatarUrl={userProfile.avatarUrl}
              size="sm"
              showWings={true}
              showHalo={true}
            />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-container-padding pt-6 pb-8 space-y-6">
          {/* Hero Banner */}
          <div className="relative w-full rounded-[24px] bg-surface-container/60 backdrop-blur-xl p-6 border border-white/5 active-glow text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-primary/30 to-secondary/30 flex items-center justify-center border border-primary/40 shadow-[0_0_20px_rgba(244,114,182,0.35)]">
              <Compass size={28} className="text-primary animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-background tracking-tight">
              Create Your Trip Room
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 max-w-xs mx-auto">
              Launch a room instantly. Friends can scan the QR code to add their own names & split bills!
            </p>
          </div>

          {/* Creation Form */}
          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 space-y-5 shadow-xl"
          >
            {error && (
              <div className="p-2.5 rounded-xl bg-error/15 border border-error/30 text-error text-xs font-semibold text-center animate-in fade-in">
                {error}
              </div>
            )}

            {/* Trip Name */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant pl-1 block">
                Trip Name
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Enter trip name (e.g. Vacation, Dinner, Roadtrip)"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="w-full bg-surface-container-lowest/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 placeholder-on-surface/40 transition-colors shadow-inner"
              />
            </div>

            {/* Host Name */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant pl-1 block">
                Host Name (Your Name)
              </label>
              <div className="relative flex items-center px-3.5 py-2.5 rounded-xl bg-surface-container-lowest/90 border border-white/10 focus-within:border-primary/50 transition-colors">
                <User size={16} className="text-on-surface-variant mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full bg-transparent text-sm text-on-surface focus:outline-none placeholder-on-surface/40"
                />
              </div>
            </div>

            {/* Emoji Selection */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant pl-1 block">
                Choose Trip Vibe
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5">
                {EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all shrink-0 cursor-pointer ${
                      emoji === em
                        ? 'bg-primary text-on-primary shadow-md scale-110'
                        : 'bg-surface-container-lowest hover:bg-surface-container border border-white/5'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Frictionless QR Note */}
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-secondary-container/15 border border-secondary/20 text-xs text-secondary-fixed-dim">
              <Sparkles size={16} className="text-tertiary shrink-0" />
              <span>
                <strong>Zero-Friction:</strong> Friends join with one tap using your room&apos;s QR code.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-[0_0_20px_rgba(244,114,182,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={18} />
              <span>Launch Trip Room ✨</span>
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
