'use client';

import React, { useState } from 'react';
import { Trip, Member, UserProfile } from '@/lib/types';
import { triggerConfetti } from '@/lib/utils';
import { Sparkles, Plus, Users, UserPlus, X, Compass, ShieldCheck } from 'lucide-react';
import { FairyAvatar } from './FairyAvatar';

interface FirstTripViewProps {
  userProfile: UserProfile;
  onCreateTrip: (newTrip: Trip) => void;
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
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌴');
  const [memberNames, setMemberNames] = useState<string[]>([userProfile.name || 'You']);
  const [newMemberInput, setNewMemberInput] = useState('');
  const [error, setError] = useState('');

  const handleAddMember = () => {
    const trimmed = newMemberInput.trim();
    if (!trimmed) return;
    if (memberNames.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" is already added.`);
      return;
    }
    setMemberNames([...memberNames, trimmed]);
    setNewMemberInput('');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMember();
    }
  };

  const handleRemoveMember = (idxToRemove: number) => {
    if (memberNames.length <= 1) {
      setError('A trip needs at least one member.');
      return;
    }
    setMemberNames(memberNames.filter((_, idx) => idx !== idxToRemove));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a name for your trip.');
      return;
    }

    if (memberNames.length === 0) {
      setError('Please add at least one member to the trip.');
      return;
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');

    const formattedMembers: Member[] = memberNames.map((memName, idx) => {
      const isUser = idx === 0 || memName.toLowerCase() === userProfile.name.toLowerCase();
      return {
        id: isUser ? userProfile.id || `member-${idx}` : `member-${Date.now()}-${idx}`,
        name: memName,
        avatarColor: MEMBER_COLORS[idx % MEMBER_COLORS.length],
        avatarUrl: isUser ? userProfile.avatarUrl : undefined,
      };
    });

    const newTrip: Trip = {
      id: `${slug || 'trip'}-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      emoji,
      members: formattedMembers,
      expenses: [],
      settlements: [],
    };

    triggerConfetti();
    onCreateTrip(newTrip);
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
              <span className="font-semibold text-sm text-on-surface">Welcome</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            title="Edit Profile"
            className="focus:outline-none active:scale-95 transition-transform"
          >
            <FairyAvatar
              name={userProfile.name}
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
              Create Your First Trip
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 max-w-xs mx-auto">
              Split expenses with friends frictionlessly. Zero signup required.
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
                placeholder="e.g. Goa Vacation, Manali Weekend, Flatmates"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-lowest/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 placeholder-on-surface/40 transition-colors shadow-inner"
              />
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
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all shrink-0 ${
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

            {/* Members Tags/Chips Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant flex items-center gap-1.5">
                  <Users size={14} className="text-secondary" />
                  <span>Trip Members ({memberNames.length})</span>
                </label>
                <span className="text-[11px] text-tertiary-fixed-dim font-medium">
                  Add friends
                </span>
              </div>

              {/* Add member input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter friend's name (e.g. Aarav, Sam)..."
                  value={newMemberInput}
                  onChange={(e) => setNewMemberInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-surface-container-lowest/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary/50 placeholder-on-surface/40"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="px-4 py-2.5 rounded-xl bg-secondary/20 hover:bg-secondary/30 text-secondary-fixed-dim text-xs font-bold border border-secondary/30 active:scale-95 transition-all flex items-center gap-1 shrink-0"
                >
                  <UserPlus size={14} />
                  <span>Add</span>
                </button>
              </div>

              {/* Member Chips list */}
              <div className="flex flex-wrap gap-2 p-2.5 rounded-2xl bg-surface-container-lowest/60 border border-white/5 min-h-[54px] items-center">
                {memberNames.map((memName, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container border border-white/10 shadow-sm animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-black"
                      style={{ backgroundColor: MEMBER_COLORS[idx % MEMBER_COLORS.length] }}
                    >
                      {memName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-on-surface">
                      {memName} {idx === 0 ? '(You)' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-white/10 transition-colors ml-0.5"
                      title="Remove member"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Offline note */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-lowest/40 border border-white/5 text-[11px] text-on-surface-variant">
              <ShieldCheck size={14} className="text-primary shrink-0" />
              <span>Offline-first: Stored securely on your device & shareable via QR code.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-[0_0_20px_rgba(244,114,182,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={18} />
              <span>Launch Event</span>
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
