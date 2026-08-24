'use client';

import React, { useState, useEffect } from 'react';
import { Member, PaymentMode, Expense } from '@/lib/types';
import { PaymentModeToggle } from './PaymentModeToggle';
import { triggerConfetti } from '@/lib/utils';
import { X, Edit3, Check, PlusCircle } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  defaultPayerId?: string;
  defaultPaymentMode?: PaymentMode;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  members,
  onAddExpense,
  defaultPayerId,
  defaultPaymentMode = 'UPI',
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState(defaultPayerId || members[0]?.id || '');
  const [splitBetween, setSplitBetween] = useState<string[]>(members.map((m) => m.id));
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(defaultPaymentMode);
  const [error, setError] = useState('');

  // Update default payment mode, payer, and split list whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDescription('');
      setError('');
      if (defaultPaymentMode) setPaymentMode(defaultPaymentMode);
      setPaidBy(defaultPayerId || members[0]?.id || '');
      setSplitBetween(members.map((m) => m.id));
    }
  }, [isOpen, defaultPaymentMode, defaultPayerId, members]);

  if (!isOpen) return null;

  const toggleMember = (id: string) => {
    if (splitBetween.includes(id)) {
      if (splitBetween.length === 1) return;
      setSplitBetween(splitBetween.filter((mId) => mId !== id));
    } else {
      setSplitBetween([...splitBetween, id]);
    }
  };

  const handleSelectAll = () => {
    if (splitBetween.length === members.length) {
      setSplitBetween([paidBy || members[0]?.id || '']);
    } else {
      setSplitBetween(members.map((m) => m.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!description.trim()) {
      setError('Please enter a description for this expense.');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (splitBetween.length === 0) {
      setError('Please select at least one member to split with.');
      return;
    }

    // Auto assign emoji icon based on description
    let icon = '⚡';
    const lower = description.toLowerCase();
    if (
      lower.includes('food') ||
      lower.includes('lunch') ||
      lower.includes('dinner') ||
      lower.includes('cafe') ||
      lower.includes('sushi') ||
      lower.includes('restaurant') ||
      lower.includes('pizza') ||
      lower.includes('burger')
    )
      icon = '🍽️';
    else if (
      lower.includes('scooter') ||
      lower.includes('cab') ||
      lower.includes('taxi') ||
      lower.includes('uber') ||
      lower.includes('fuel') ||
      lower.includes('petrol') ||
      lower.includes('flight')
    )
      icon = '🛵';
    else if (
      lower.includes('drink') ||
      lower.includes('beer') ||
      lower.includes('bar') ||
      lower.includes('cocktail') ||
      lower.includes('coffee')
    )
      icon = '🍻';
    else if (
      lower.includes('villa') ||
      lower.includes('hotel') ||
      lower.includes('room') ||
      lower.includes('stay') ||
      lower.includes('cabin') ||
      lower.includes('resort')
    )
      icon = '🏖️';
    else if (
      lower.includes('grocer') ||
      lower.includes('snack') ||
      lower.includes('market') ||
      lower.includes('supplies')
    )
      icon = '🥥';

    onAddExpense({
      title: description.trim(),
      amount: numAmount,
      paidBy: paidBy || members[0]?.id,
      paymentMode,
      splitBetween,
      date: 'Just now',
      icon,
    });

    triggerConfetti();
    setDescription('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-variant/90 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] shadow-[0_-8px_32px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="font-bold text-base text-on-surface flex items-center gap-2">
            <PlusCircle size={18} className="text-primary" />
            <span>Add New Expense</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-on-surface-variant rounded-full bg-white/5 active:scale-90 transition-transform"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-error/15 border border-error/30 text-error text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Centered Amount Input */}
          <div className="flex flex-col items-center justify-center py-2 relative">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant mb-1">
              Amount
            </label>
            <div className="flex items-center justify-center gap-1.5 relative z-10">
              <span className="text-3xl font-bold text-primary/70">₹</span>
              <input
                type="number"
                step="any"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-36 bg-transparent text-center text-3xl font-extrabold text-on-surface focus:outline-none placeholder-on-surface/30 caret-primary"
              />
            </div>
            <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-1.5" />
          </div>

          {/* Description Input */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant pl-1 block">
              Description
            </label>
            <div className="relative flex items-center px-3.5 py-2.5 rounded-xl bg-surface-container-lowest/80 border border-white/10 focus-within:border-primary/50 transition-colors">
              <Edit3 size={16} className="text-on-surface-variant mr-2.5 shrink-0" />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What was this for? (e.g. Lunch, Cab, Groceries)"
                className="w-full bg-transparent text-sm text-on-surface focus:outline-none placeholder-on-surface/40"
              />
            </div>
          </div>

          {/* Paid By Selector */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant pl-1 block">
              Paid By
            </label>
            <div className="relative">
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full bg-surface-container-lowest/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-surface-container-highest text-on-surface">
                    {m.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-on-surface-variant">
                ▼
              </div>
            </div>
          </div>

          {/* Split Between Checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant">
                Split Between ({splitBetween.length}/{members.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold text-primary active:scale-95 transition-transform cursor-pointer"
              >
                {splitBetween.length === members.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
              {members.map((m) => {
                const isSelected = splitBetween.includes(m.id);
                return (
                  <label
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-lowest/60 border border-white/5 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-black"
                        style={{ backgroundColor: m.avatarColor || '#f472b6' }}
                      >
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-on-surface">
                        {m.name}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'border-white/20 text-transparent'
                      }`}
                    >
                      <Check size={12} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant block text-center mb-1">
              Payment Mode
            </label>
            <PaymentModeToggle value={paymentMode} onChange={setPaymentMode} />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-full border border-white/15 text-xs sm:text-sm font-bold text-on-surface-variant active:scale-[0.98] transition-transform cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 px-4 rounded-full bg-primary text-on-primary text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(244,114,182,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Save Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
