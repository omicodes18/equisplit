'use client';

import React, { useState, useEffect } from 'react';
import { Trip, Member } from '@/lib/types';
import { triggerConfetti } from '@/lib/utils';
import { X, Sparkles, User } from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (newTrip: Trip, creatorName?: string) => void;
  currentUser?: { id: string; name: string };
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

export function CreateTripModal({
  isOpen,
  onClose,
  onCreateTrip,
  currentUser,
}: CreateTripModalProps) {
  const [name, setName] = useState('');
  const [hostName, setHostName] = useState(currentUser?.name || '');
  const [emoji, setEmoji] = useState('🌴');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setHostName(currentUser?.name || '');
      setEmoji('🌴');
      setError('');
    }
  }, [isOpen, currentUser?.name]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a trip name.');
      return;
    }

    if (!hostName.trim()) {
      setError('Please enter your name as the host.');
      return;
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');

    const hostId = currentUser?.id || `member-${Date.now()}`;
    const hostMember: Member = {
      id: hostId,
      name: hostName.trim(),
      avatarColor: MEMBER_COLORS[0],
    };

    const newTrip: Trip = {
      id: `${slug || 'trip'}-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      emoji,
      members: [hostMember],
      expenses: [],
      settlements: [],
    };

    triggerConfetti();
    onCreateTrip(newTrip, hostName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-variant/95 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-white/10 p-5 sm:p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
          <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <span>Create Trip Room</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-on-surface-variant rounded-full bg-white/5 active:scale-90 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
          {error && (
            <div className="p-2.5 rounded-xl bg-error/15 border border-error/30 text-error text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Trip Name */}
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant pl-1 block mb-1">
              Trip Name
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Goa Vacation, Manali Weekend, Flatmates"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-lowest/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 placeholder-on-surface/40"
            />
          </div>

          {/* Host Name */}
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant pl-1 block mb-1">
              Host Name (Your Name)
            </label>
            <div className="relative flex items-center px-3.5 py-2.5 rounded-xl bg-surface-container-lowest/80 border border-white/10 focus-within:border-primary/50">
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
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant pl-1 block mb-1">
              Select Emoji
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all shrink-0 cursor-pointer ${
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

          <div className="p-3 rounded-2xl bg-surface-container-lowest/60 border border-white/5 text-xs text-on-surface-variant flex items-center gap-2">
            <Sparkles size={15} className="text-tertiary shrink-0" />
            <span>Friends can scan your room QR code to add their own names.</span>
          </div>

          <button
            type="submit"
            className="w-full mt-3 py-3 rounded-full bg-primary text-on-primary font-bold text-sm shadow-[0_0_20px_rgba(244,114,182,0.3)] active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={16} />
            <span>Launch Trip Room ✨</span>
          </button>
        </form>
      </div>
    </div>
  );
}
