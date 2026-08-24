'use client';

import React from 'react';
import { Member, MemberBalance } from '@/lib/types';
import { getWhoShouldPayNext } from '@/lib/utils';
import { Brain, ArrowRight } from 'lucide-react';

interface WhoShouldPayNextCardProps {
  members: Member[];
  balances: MemberBalance[];
  onQuickLog?: (memberId: string) => void;
}

export function WhoShouldPayNextCard({
  members,
  balances,
  onQuickLog,
}: WhoShouldPayNextCardProps) {
  const heuristic = getWhoShouldPayNext(members, balances);
  const recommended = heuristic.recommendedMember;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-secondary-container/30 to-surface-container p-4 sm:p-5 border border-secondary/15 shadow-[0_4px_24px_-8px_rgba(221,184,255,0.15)] relative overflow-hidden">
      {/* Soft background glow orb */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

      <div className="flex items-start gap-3.5 relative z-10">
        <div className="w-10 h-10 shrink-0 rounded-full bg-secondary-container/40 flex items-center justify-center border border-secondary/20 text-secondary-fixed-dim">
          <Brain size={20} />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-secondary-fixed-dim mb-0.5">
            Who Should Pay Next?
          </h3>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {recommended ? (
              <>
                Next estimated <strong>₹{heuristic.suggestedAmount}</strong>{' '}
                <ArrowRight size={13} className="inline mx-0.5 text-secondary" /> Suggest:{' '}
                <span className="text-on-surface font-semibold underline decoration-secondary/40 underline-offset-2">
                  {recommended.name}
                </span>{' '}
                to balance group spends.
              </>
            ) : (
              heuristic.message
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
