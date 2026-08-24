import confetti from 'canvas-confetti';
import { Member, Expense, Settlement, MemberBalance, SimplifiedDebt, PaymentMode } from './types';

/**
 * Format currency strictly to Indian Rupee (₹) standard: 24,850
 */
export function formatINR(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  return new Intl.NumberFormat('en-IN').format(abs);
}

/**
 * Calculate balances for all members accounting for expenses and settlements
 */
export function calculateBalances(
  members: Member[],
  expenses: Expense[],
  settlements: Settlement[] = []
): MemberBalance[] {
  const paidMap: Record<string, number> = {};
  const shareMap: Record<string, number> = {};
  const cashPaidMap: Record<string, number> = {};
  const upiPaidMap: Record<string, number> = {};

  members.forEach((m) => {
    paidMap[m.id] = 0;
    shareMap[m.id] = 0;
    cashPaidMap[m.id] = 0;
    upiPaidMap[m.id] = 0;
  });

  // Calculate expense contributions and consumption
  expenses.forEach((expense) => {
    if (paidMap[expense.paidBy] !== undefined) {
      paidMap[expense.paidBy] += expense.amount;
      if (expense.paymentMode === 'CASH') {
        cashPaidMap[expense.paidBy] += expense.amount;
      } else {
        upiPaidMap[expense.paidBy] += expense.amount;
      }
    }

    const participants =
      expense.splitBetween.length > 0
        ? expense.splitBetween
        : members.map((m) => m.id);

    const sharePerPerson = expense.amount / participants.length;

    participants.forEach((memberId) => {
      if (shareMap[memberId] !== undefined) {
        shareMap[memberId] += sharePerPerson;
      }
    });
  });

  // Account for settlements
  settlements.forEach((s) => {
    if (paidMap[s.fromId] !== undefined) {
      paidMap[s.fromId] += s.amount;
    }
    if (shareMap[s.toId] !== undefined) {
      shareMap[s.toId] += s.amount;
    }
  });

  return members.map((member) => {
    const totalPaid = paidMap[member.id] || 0;
    const totalShare = shareMap[member.id] || 0;
    const netBalance = Math.round((totalPaid - totalShare) * 100) / 100;
    const cashPaid = cashPaidMap[member.id] || 0;
    const upiPaid = upiPaidMap[member.id] || 0;

    return {
      member,
      totalPaid,
      totalShare,
      netBalance,
      cashPaid,
      upiPaid,
    };
  });
}

/**
 * Min-Cash-Flow Debt Simplification Algorithm with Dynamic Mode Rebalancing Suggestion
 */
export function simplifyDebts(
  members: Member[],
  balances: MemberBalance[],
  expenses: Expense[] = []
): SimplifiedDebt[] {
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const debtors: { memberId: string; amount: number }[] = [];
  const creditors: { memberId: string; amount: number }[] = [];

  balances.forEach((b) => {
    const bal = Math.round(b.netBalance);
    if (bal < -1) {
      debtors.push({ memberId: b.member.id, amount: -bal });
    } else if (bal > 1) {
      creditors.push({ memberId: b.member.id, amount: bal });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const simplified: SimplifiedDebt[] = [];
  let dIdx = 0;
  let cIdx = 0;

  // Calculate group-wide cash vs upi ratio for intelligent mode rebalancing
  const totalCashExpenses = expenses
    .filter((e) => e.paymentMode === 'CASH')
    .reduce((sum, e) => sum + e.amount, 0);

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settledAmount = Math.min(debtor.amount, creditor.amount);

    if (settledAmount > 0) {
      const fromMember = memberMap.get(debtor.memberId);
      const toMember = memberMap.get(creditor.memberId);

      if (fromMember && toMember) {
        // Find recent expenses related to these two members
        const relatedExpense = expenses.find(
          (e) => e.paidBy === creditor.memberId || e.splitBetween.includes(debtor.memberId)
        );
        const contextNote = relatedExpense ? relatedExpense.title : 'Trip Expenses';

        // Intelligent Payment Mode Suggestion & Rebalancing heuristic
        let suggestedMode: PaymentMode = 'UPI';
        let suggestionReason = 'Suggestion: Pay via UPI for instant settlement and zero cash friction.';

        const creditorBal = balances.find((b) => b.member.id === creditor.memberId);
        if (creditorBal && creditorBal.cashPaid > 500) {
          suggestedMode = 'UPI';
          suggestionReason = `Suggestion: Pay via UPI to balance out previous cash payments of ₹${formatINR(creditorBal.cashPaid)} paid by ${toMember.name}.`;
        } else if (totalCashExpenses > 0 && Math.random() > 0.5) {
          suggestedMode = 'UPI';
          suggestionReason = `Suggestion: Pay via UPI to balance out recent cash splits.`;
        } else {
          suggestedMode = 'UPI';
          suggestionReason = `Suggestion: Pay via UPI to quickly settle this ${contextNote.toLowerCase()} balance.`;
        }

        simplified.push({
          id: `debt-${debtor.memberId}-${creditor.memberId}-${settledAmount}`,
          fromId: debtor.memberId,
          toId: creditor.memberId,
          fromMember,
          toMember,
          amount: settledAmount,
          suggestedMode,
          suggestionReason,
          contextNote,
        });
      }

      debtor.amount -= settledAmount;
      creditor.amount -= settledAmount;
    }

    if (debtor.amount <= 1) dIdx++;
    if (creditor.amount <= 1) cIdx++;
  }

  return simplified;
}

/**
 * "Who Should Pay Next?" Recommendation Heuristic
 */
export function getWhoShouldPayNext(
  members: Member[],
  balances: MemberBalance[]
): {
  recommendedMember: Member | null;
  suggestedAmount: number;
  message: string;
} {
  if (!balances.length) {
    return {
      recommendedMember: null,
      suggestedAmount: 500,
      message: 'Add group expenses to see payment suggestions.',
    };
  }

  const sorted = [...balances].sort((a, b) => a.netBalance - b.netBalance);
  const lowest = sorted[0];

  if (!lowest || lowest.netBalance >= 0) {
    return {
      recommendedMember: null,
      suggestedAmount: 500,
      message: 'All members are currently even! Anyone can grab the next bill.',
    };
  }

  const estimatedBill = 500;
  return {
    recommendedMember: lowest.member,
    suggestedAmount: estimatedBill,
    message: `Next estimated ₹${estimatedBill} → Suggest: ${lowest.member.name} to balance group spends.`,
  };
}

/**
 * Subtle celebration sparkle
 */
export function triggerConfetti() {
  if (typeof window === 'undefined') return;
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.65 },
    colors: ['#F472B6', '#C084FC', '#FBBF24', '#d0e8d9'],
    disableForReducedMotion: true,
  });
}
