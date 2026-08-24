'use client';

import React from 'react';
import { Expense, Member } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { ChevronRight, Trash2 } from 'lucide-react';

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
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const displayedExpenses = limit ? expenses.slice(0, limit) : expenses;

  return (
    <div className="flex flex-col gap-3.5 w-full">
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

      {expenses.length === 0 ? (
        <div className="rounded-2xl bg-surface-container/40 border border-white/5 p-8 text-center text-xs text-on-surface-variant">
          No expenses logged yet for this trip. Tap <strong className="text-primary">+</strong> below to add one!
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
                className="w-full rounded-2xl bg-surface-container/60 backdrop-blur-md p-3.5 sm:p-4 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all border border-white/5 relative overflow-hidden group"
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

                {/* Right: Amount + Date */}
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
                        onDeleteExpense(expense.id);
                      }}
                      className="opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity text-on-surface-variant hover:text-error mt-1 p-0.5"
                      title="Delete expense"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
