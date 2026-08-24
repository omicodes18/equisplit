'use client';

import React, { useState } from 'react';
import { Expense, Member } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { ChevronRight, Trash2, X, AlertTriangle } from 'lucide-react';

interface RecentExpensesListProps {
  expenses: Expense[];
  members: Member[];
  onSeeAll?: () => void;
  onDeleteExpense?: (expenseId: string) => void;
  limit?: number;
}

export function RecentExpensesList({
  expenses,
  members,
  onSeeAll,
  onDeleteExpense,
  limit,
}: RecentExpensesListProps) {
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const displayedExpenses = limit ? expenses.slice(0, limit) : expenses;

  const handleConfirmDelete = () => {
    if (expenseToDelete && onDeleteExpense) {
      onDeleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* List Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base sm:text-lg font-bold text-on-surface">Recent Expenses</h2>
        {onSeeAll && expenses.length > (limit || 0) && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-xs text-primary-fixed-dim hover:text-primary transition-colors flex items-center font-medium"
          >
            <span>See All</span>
            <ChevronRight size={14} className="ml-0.5" />
          </button>
        )}
      </div>

      {/* Empty State vs Expense Cards */}
      {expenses.length === 0 ? (
        <div className="rounded-2xl bg-surface-container/40 border border-white/5 p-8 text-center flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-xl border border-white/5">
            ✨
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium max-w-xs">
            No expenses logged yet ✨ Tap <strong className="text-primary font-bold">+</strong> to add the first one!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayedExpenses.map((expense) => {
            const payer = memberMap.get(expense.paidBy);
            const splitCount = expense.splitBetween.length || members.length;
            const isUpi = expense.paymentMode === 'UPI';

            return (
              <div
                key={expense.id}
                className="w-full rounded-2xl bg-surface-container/60 backdrop-blur-md p-3.5 sm:p-4 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all border border-white/5 relative overflow-hidden group"
              >
                {/* Subtle Hover Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

                {/* Left: Icon + Info */}
                <div className="flex items-center gap-3 relative z-10 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-surface-bright flex items-center justify-center shrink-0 text-xl">
                    {expense.icon || (isUpi ? '⚡' : '💵')}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm sm:text-base text-on-surface truncate">
                      {expense.title}
                    </span>
                    <span className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                      Paid by{' '}
                      <strong className="text-on-surface/90 font-medium">
                        {payer?.name || 'Someone'}
                      </strong>{' '}
                      • Split {splitCount}
                    </span>

                    {/* Payment Mode Pill Badge */}
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          isUpi
                            ? 'bg-secondary-container/20 text-secondary-fixed-dim border border-secondary-fixed/15'
                            : 'bg-tertiary-container/20 text-tertiary-fixed-dim border border-tertiary/15'
                        }`}
                      >
                        {expense.paymentMode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount + Date + Delete Button */}
                <div className="flex flex-col items-end shrink-0 relative z-10 pl-2">
                  <span className="font-bold text-base sm:text-lg text-primary-fixed-dim drop-shadow-[0_0_8px_rgba(255,175,211,0.25)]">
                    ₹{formatINR(expense.amount)}
                  </span>
                  <span className="text-[11px] text-on-surface-variant mt-1 text-right truncate max-w-[90px]">
                    {expense.date}
                  </span>

                  {onDeleteExpense && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpenseToDelete(expense);
                      }}
                      className="opacity-70 hover:opacity-100 hover:text-error transition-all text-on-surface-variant mt-1.5 p-1 rounded-lg hover:bg-white/5 active:scale-90"
                      title="Delete expense"
                      aria-label={`Delete ${expense.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Expense Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-surface-variant/95 backdrop-blur-2xl rounded-3xl p-5 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-error/20 border border-error/30 flex items-center justify-center text-error shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-on-surface">Delete Expense?</h3>
                <p className="text-xs text-on-surface-variant">
                  This will remove &ldquo;{expenseToDelete.title}&rdquo; (₹{formatINR(expenseToDelete.amount)}) and update balances.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="flex-1 py-2.5 rounded-full border border-white/15 text-xs font-bold text-on-surface-variant hover:bg-white/5 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-full bg-error text-white text-xs font-bold shadow-[0_0_15px_rgba(255,180,171,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
