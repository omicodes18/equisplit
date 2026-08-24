'use client';

import React, { useState } from 'react';
import { Trip, Member } from '@/lib/types';
import { X, Plus, Sparkles } from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (newTrip: Trip) => void;
  defaultMembers: Member[];
}

const EMOJIS = ['🌴', '🏕️', '🚗', '🏔️', '🏙️', '🍕', '🍻', '✈️'];

export function CreateTripModal({
  isOpen,
  onClose,
  onCreateTrip,
  defaultMembers,
}: CreateTripModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌴');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');

    const newTrip: Trip = {
      id: `${slug}-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      emoji,
      members: defaultMembers,
      expenses: [],
      settlements: [],
    };

    onCreateTrip(newTrip);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-variant/95 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-white/10 p-5 sm:p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <span>Create New Trip</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-on-surface-variant rounded-full bg-white/5 active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant pl-1 block mb-1">
              Trip Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Manali Weekend, Gokarna Beach"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-lowest/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50"
            />
          </div>

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
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                    emoji === em
                      ? 'bg-primary text-on-primary shadow-md scale-110'
                      : 'bg-surface-container-lowest hover:bg-surface-container'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-full bg-primary text-on-primary font-bold text-sm shadow-[0_0_20px_rgba(244,114,182,0.3)] active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
          >
            <Plus size={16} />
            <span>Launch Event</span>
          </button>
        </form>
      </div>
    </div>
  );
}
