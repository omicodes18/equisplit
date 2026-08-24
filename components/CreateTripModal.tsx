'use client';

import React, { useState, useEffect } from 'react';
import { Trip, Member } from '@/lib/types';
import { triggerConfetti } from '@/lib/utils';
import { X, Plus, Sparkles, UserPlus, Users } from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (newTrip: Trip) => void;
  currentUser?: { id: string; name: string };
}

const EMOJIS = ['🌴', '🏕️', '🚗', '🏔️', '🏙️', '🍕', '🍻', '✈️', '🏖️', '🍣', '🎸', '☕'];

const MEMBER_COLORS = [
  '#f472b6', // pink
  '#ddb8ff', // lavender
  '#f9bd22', // gold
  '#62259b', // deep purple
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
  const [emoji, setEmoji] = useState('🌴');
  const [memberNames, setMemberNames] = useState<string[]>(
    currentUser?.name ? [currentUser.name] : []
  );
  const [newMemberInput, setNewMemberInput] = useState('');
  const [error, setError] = useState('');

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmoji('🌴');
      setMemberNames(currentUser?.name ? [currentUser.name] : []);
      setNewMemberInput('');
      setError('');
    }
  }, [isOpen, currentUser?.name]);

  if (!isOpen) return null;

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

  const handleRemoveMember = (indexToRemove: number) => {
    if (memberNames.length <= 1) {
      setError('A trip needs at least one member.');
      return;
    }
    setMemberNames(memberNames.filter((_, idx) => idx !== indexToRemove));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a trip name.');
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
      const isCurrent = currentUser?.name && memName.toLowerCase() === currentUser.name.toLowerCase();
      return {
        id: isCurrent ? currentUser?.id || `member-${idx}` : `member-${Date.now()}-${idx}`,
        name: memName,
        avatarColor: MEMBER_COLORS[idx % MEMBER_COLORS.length],
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-variant/95 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-white/10 p-5 sm:p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
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
              placeholder="e.g. Vacation, Weekend Roadtrip, Dinner"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-lowest/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 placeholder-on-surface/40"
            />
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
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all shrink-0 ${
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

          {/* Member Tags/Chips Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant flex items-center gap-1.5">
                <Users size={14} className="text-secondary" />
                <span>Trip Members ({memberNames.length})</span>
              </label>
              <span className="text-[10px] text-on-surface-variant">Add friends splitting</span>
            </div>

            {/* Input to add friend */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Add member name..."
                  value={newMemberInput}
                  onChange={(e) => setNewMemberInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-surface-container-lowest/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50 placeholder-on-surface/40"
                />
              </div>
              <button
                type="button"
                onClick={handleAddMember}
                className="px-3.5 py-2 rounded-xl bg-secondary/20 hover:bg-secondary/30 text-secondary-fixed-dim text-xs font-bold border border-secondary/30 active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <UserPlus size={14} />
                <span>Add</span>
              </button>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-2 pt-1 min-h-[48px] p-2 rounded-xl bg-surface-container-lowest/50 border border-white/5 items-center">
              {memberNames.length === 0 ? (
                <span className="text-xs text-on-surface-variant/60 px-1">
                  No members added yet. Type a name above to add.
                </span>
              ) : (
                memberNames.map((memName, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-white/10 shadow-sm animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-black"
                      style={{ backgroundColor: MEMBER_COLORS[idx % MEMBER_COLORS.length] }}
                    >
                      {memName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-on-surface">
                      {memName} {currentUser?.name && memName.toLowerCase() === currentUser.name.toLowerCase() ? '(You)' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-white/10 transition-colors ml-0.5"
                      title="Remove member"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-3 py-3 rounded-full bg-primary text-on-primary font-bold text-sm shadow-[0_0_20px_rgba(244,114,182,0.3)] active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            <span>Launch Event</span>
          </button>
        </form>
      </div>
    </div>
  );
}
