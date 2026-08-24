'use client';

import React, { useState } from 'react';
import { Member, MemberBalance, SimplifiedDebt, Settlement, Expense } from '@/lib/types';
import { formatINR, simplifyDebts, triggerConfetti } from '@/lib/utils';
import { CheckCircle, Lightbulb, History, Check } from 'lucide-react';

interface SettleUpViewProps {
  members: Member[];
  balances: MemberBalance[];
  expenses: Expense[];
  onConfirmSettlement: (settlement: Omit<Settlement, 'id'>) => void;
}

export function SettleUpView({
  members,
  balances,
  expenses,
  onConfirmSettlement,
}: SettleUpViewProps) {
  const [settledCardIds, setSettledCardIds] = useState<string[]>([]);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const simplifiedDebts = simplifyDebts(members, balances, expenses);
  const activeDebts = simplifiedDebts.filter((d) => !settledCardIds.includes(d.id));

  const handleMarkPaid = (debt: SimplifiedDebt) => {
    setSettlingId(debt.id);
    triggerConfetti();

    setTimeout(() => {
      setSettledCardIds((prev) => [...prev, debt.id]);
      setSettlingId(null);
      onConfirmSettlement({
        fromId: debt.fromId,
        toId: debt.toId,
        amount: debt.amount,
        paymentMode: debt.suggestedMode,
        date: new Date().toISOString().split('T')[0],
      });
    }, 600);
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-xl sm:text-2xl font-bold text-on-background tracking-tight">
          Settle Debts
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm">
          Simplify your trip balances. Here&apos;s the easiest way to make everyone whole.
        </p>
      </div>

      {/* Simplified Settlement Cards List */}
      {activeDebts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-2xl bg-surface-container/40 border border-white/5">
          <div className="w-20 h-20 mb-4 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="w-full h-full bg-surface-container rounded-full flex items-center justify-center relative z-10 border border-white/10 text-3xl">
              🕊️
            </div>
          </div>
          <h2 className="text-lg font-bold text-on-surface mb-1">All Squared Up!</h2>
          <p className="text-xs text-on-surface-variant max-w-xs">
            No one owes anything. Time to grab a drink and relax.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {activeDebts.map((debt) => {
            const isSettling = settlingId === debt.id;

            return (
              <div
                key={debt.id}
                className={`relative glass-panel rounded-2xl p-4 overflow-hidden group transition-all duration-300 ${
                  isSettling ? 'opacity-50 scale-95' : 'opacity-100'
                }`}
              >
                {/* Top Row: Debtor/Creditor Info & Amount in ₹ */}
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-base text-primary shrink-0 border border-white/10">
                      {debt.fromMember.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm sm:text-base text-on-surface">
                        {debt.fromMember.name} owes {debt.toMember.name}
                      </span>
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <History size={12} className="text-on-surface-variant" />
                        <span>{debt.contextNote}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-lg sm:text-xl text-tertiary-fixed-dim drop-shadow-[0_0_8px_rgba(249,189,34,0.35)]">
                      ₹{formatINR(debt.amount)}
                    </span>
                  </div>
                </div>

                {/* Dynamic Recommendation Tip Banner */}
                <div className="bg-tertiary-container/15 border border-tertiary/20 rounded-xl p-3 mb-3.5 flex items-start gap-2 relative z-10">
                  <Lightbulb size={16} className="text-tertiary shrink-0 mt-0.5" />
                  <p className="text-xs leading-snug text-tertiary-fixed-dim font-medium">
                    {debt.suggestionReason}
                  </p>
                </div>

                {/* Single Clean Button: "Mark as Settled" */}
                <div className="relative z-10">
                  <button
                    type="button"
                    onClick={() => handleMarkPaid(debt)}
                    disabled={isSettling}
                    className="w-full bg-primary text-on-primary hover:bg-primary/90 active:scale-[0.98] transition-all rounded-full py-3 px-4 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(244,114,182,0.3)] text-xs font-bold uppercase tracking-wider disabled:opacity-70 cursor-pointer"
                  >
                    {isSettling ? (
                      <>
                        <Check size={16} className="animate-bounce" />
                        <span>Settling...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Mark as Settled</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
