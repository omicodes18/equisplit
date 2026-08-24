export type PaymentMode = 'UPI' | 'CASH';

export interface Member {
  id: string;
  name: string;
  avatarColor?: string;
  avatarUrl?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // member id
  paymentMode: PaymentMode;
  splitBetween: string[]; // member ids involved in the split
  date: string;
  icon?: string;
}

export interface Settlement {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  paymentMode: PaymentMode;
  date: string;
}

export interface Trip {
  id: string;
  name: string;
  emoji: string;
  members: Member[];
  expenses: Expense[];
  settlements: Settlement[];
}

export interface MemberBalance {
  member: Member;
  totalPaid: number;
  totalShare: number;
  netBalance: number; // positive = gets back, negative = owes
  cashPaid: number;
  upiPaid: number;
}

export interface SimplifiedDebt {
  id: string;
  fromId: string;
  toId: string;
  fromMember: Member;
  toMember: Member;
  amount: number;
  suggestedMode: PaymentMode;
  suggestionReason: string;
  contextNote: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  preferredPaymentMode: PaymentMode;
}
