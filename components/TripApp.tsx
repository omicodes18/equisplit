'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trip, Member, Expense, Settlement, MemberBalance, UserProfile } from '@/lib/types';
import { INITIAL_TRIPS } from '@/lib/initialData';
import { calculateBalances, formatINR } from '@/lib/utils';
import {
  loadTripsFromStorage,
  persistTripsToStorage,
  loadUserProfile,
  persistUserProfile,
  DEFAULT_USER_PROFILE,
} from '@/lib/storage';
import { Header } from '@/components/Header';
import { BottomNav, TabType } from '@/components/BottomNav';
import { WhoShouldPayNextCard } from '@/components/WhoShouldPayNextCard';
import { RecentExpensesList } from '@/components/RecentExpensesList';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { SettleUpView } from '@/components/SettleUpView';
import { CreateTripModal } from '@/components/CreateTripModal';
import { ProfileModal } from '@/components/ProfileModal';
import { InviteModal } from '@/components/InviteModal';
import { SyncStatusPill } from '@/components/SyncStatusPill';
import { Plus } from 'lucide-react';

interface TripAppProps {
  initialTripId?: string;
}

export function TripApp({ initialTripId }: TripAppProps) {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [activeTripId, setActiveTripId] = useState<string>(
    initialTripId || INITIAL_TRIPS[0].id
  );
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Load from IndexedDB / localStorage on client mount
  useEffect(() => {
    async function initializeEngine() {
      try {
        const [storedTrips, storedProfile] = await Promise.all([
          loadTripsFromStorage(),
          loadUserProfile(),
        ]);

        if (storedProfile) {
          setUserProfile(storedProfile);
        }

        if (storedTrips && storedTrips.length > 0) {
          // If initialTripId is specified and not present in stored trips, create it dynamically
          let currentTrips = storedTrips;
          if (initialTripId && !storedTrips.some((t) => t.id === initialTripId)) {
            const formattedName = initialTripId
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');

            const dynamicTrip: Trip = {
              id: initialTripId,
              name: formattedName || 'New Trip',
              emoji: '✨',
              members: [
                {
                  id: storedProfile.id || 'member-priya',
                  name: storedProfile.name || 'Priya',
                  avatarColor: '#f472b6',
                  avatarUrl: storedProfile.avatarUrl,
                },
                { id: 'member-friend-1', name: 'Alex', avatarColor: '#ddb8ff' },
                { id: 'member-friend-2', name: 'Sam', avatarColor: '#f9bd22' },
              ],
              expenses: [],
              settlements: [],
            };
            currentTrips = [dynamicTrip, ...storedTrips];
            await persistTripsToStorage(currentTrips);
          }

          setTrips(currentTrips);

          if (initialTripId && currentTrips.some((t) => t.id === initialTripId)) {
            setActiveTripId(initialTripId);
          } else {
            setActiveTripId(currentTrips[0].id);
          }
        }
      } catch (e) {
        console.error('Storage initialization error:', e);
      }
    }

    initializeEngine();
  }, [initialTripId]);

  // Save trips to state & IndexedDB / LocalStorage
  const saveTrips = (updatedTrips: Trip[]) => {
    setTrips(updatedTrips);
    persistTripsToStorage(updatedTrips);
  };

  // Save user profile to state & storage
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    persistUserProfile(updatedProfile);

    // Synchronize member display name across trips for the user
    const updatedTrips = trips.map((t) => ({
      ...t,
      members: t.members.map((m) => {
        if (m.id === updatedProfile.id || m.id === 'member-priya') {
          return {
            ...m,
            name: updatedProfile.name,
            avatarUrl: updatedProfile.avatarUrl,
          };
        }
        return m;
      }),
    }));

    saveTrips(updatedTrips);
  };

  // Find active trip or fallback
  const activeTrip =
    trips.find((t) => t.id === activeTripId) ||
    trips[0] ||
    INITIAL_TRIPS[0];

  const members = activeTrip.members;
  const expenses = activeTrip.expenses;
  const settlements = activeTrip.settlements || [];

  // Live balance calculation
  const balances: MemberBalance[] = calculateBalances(members, expenses, settlements);
  const totalGroupSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Switch trip and update URL
  const handleSelectTrip = (tripId: string) => {
    setActiveTripId(tripId);
    router.push(`/trip/${tripId}`);
  };

  // Create new trip
  const handleCreateTrip = (newTrip: Trip) => {
    const updated = [newTrip, ...trips];
    saveTrips(updated);
    setActiveTripId(newTrip.id);
    setActiveTab('dashboard');
    router.push(`/trip/${newTrip.id}`);
  };

  // Add Expense
  const handleAddExpense = (newExpData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}`,
    };

    const updated = trips.map((t) => {
      if (t.id === activeTrip.id) {
        return {
          ...t,
          expenses: [newExpense, ...t.expenses],
        };
      }
      return t;
    });

    saveTrips(updated);
  };

  // Delete Expense
  const handleDeleteExpense = (expenseId: string) => {
    const updated = trips.map((t) => {
      if (t.id === activeTrip.id) {
        return {
          ...t,
          expenses: t.expenses.filter((e) => e.id !== expenseId),
        };
      }
      return t;
    });

    saveTrips(updated);
  };

  // Settle Debt
  const handleConfirmSettlement = (settlementData: Omit<Settlement, 'id'>) => {
    const newSettlement: Settlement = {
      ...settlementData,
      id: `settle-${Date.now()}`,
    };

    const updated = trips.map((t) => {
      if (t.id === activeTrip.id) {
        return {
          ...t,
          settlements: [...(t.settlements || []), newSettlement],
        };
      }
      return t;
    });

    saveTrips(updated);
  };

  return (
    <div className="min-h-screen bg-[#091E15] text-[#d0e8d9] flex justify-center selection:bg-primary/30 selection:text-primary">
      {/* Mobile-First Constrained Wrapper (max-w-md on desktop, full-width on mobile) */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-[#03170e] shadow-2xl border-x border-white/5 pb-24">
        {/* Sticky Top Header with Switcher, Invite & Profile */}
        <Header
          trips={trips}
          activeTrip={activeTrip}
          userProfile={userProfile}
          onSelectTrip={handleSelectTrip}
          onCreateNewTrip={() => setIsCreateTripOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenInvite={() => setIsInviteOpen(true)}
        />

        {/* Main Body Content */}
        <main className="flex-1 px-container-padding pt-4 space-y-5">
          {/* Sync Status Banner Pill */}
          <div className="flex justify-center items-center">
            <SyncStatusPill />
          </div>

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-5">
              {/* Group Spending Hero Card */}
              <div className="relative w-full rounded-[24px] bg-surface-container/60 backdrop-blur-xl p-5 sm:p-6 border border-white/5 active-glow">
                <div className="absolute -top-2 -right-2 text-2xl animate-pulse select-none">
                  ✨
                </div>
                <div
                  className="absolute -bottom-1 -left-2 text-xl select-none animate-bounce"
                  style={{ animationDuration: '3s', animationDelay: '1s' }}
                >
                  ✨
                </div>

                <div className="flex flex-col items-center text-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Group Spending
                  </span>

                  <h1 className="text-4xl sm:text-5xl font-extrabold text-tertiary-fixed-dim drop-shadow-[0_0_12px_rgba(249,189,34,0.35)] tracking-tight">
                    ₹{formatINR(totalGroupSpend)}
                  </h1>

                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 border border-secondary-fixed/20 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim animate-pulse" />
                    <span className="text-xs text-secondary-fixed-dim font-medium">
                      {members.length} members • {expenses.length} bills
                    </span>
                  </div>
                </div>
              </div>

              {/* Who Should Pay Next Heuristic Card */}
              <WhoShouldPayNextCard
                members={members}
                balances={balances}
              />

              {/* Recent Expenses List (Top 4) */}
              <RecentExpensesList
                expenses={expenses}
                members={members}
                limit={4}
                onSeeAll={() => setActiveTab('expenses')}
                onDeleteExpense={handleDeleteExpense}
              />
            </div>
          )}

          {/* TAB 2: EXPENSES (Full List) */}
          {activeTab === 'expenses' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h1 className="text-xl font-bold text-on-surface">All Expenses</h1>
                  <p className="text-xs text-on-surface-variant">
                    {expenses.length} logged transactions in {activeTrip.name}
                  </p>
                </div>
              </div>

              <RecentExpensesList
                expenses={expenses}
                members={members}
                onDeleteExpense={handleDeleteExpense}
              />
            </div>
          )}

          {/* TAB 3: SETTLE UP (Debt Simplification & Clean Mode) */}
          {activeTab === 'settle-up' && (
            <SettleUpView
              members={members}
              balances={balances}
              expenses={expenses}
              onConfirmSettlement={handleConfirmSettlement}
            />
          )}
        </main>

        {/* Floating Action Button (FAB) for Add Expense */}
        <button
          type="button"
          onClick={() => setIsAddExpenseOpen(true)}
          className="fixed bottom-20 right-4 sm:right-auto sm:left-[calc(50%+140px)] w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg active:scale-95 hover:scale-105 transition-transform z-30 border border-white/10"
          aria-label="Add Expense"
        >
          <Plus size={28} className="stroke-[2.5]" />
        </button>

        {/* Bottom Navigation Tabs */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Add Expense Modal */}
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          members={members}
          onAddExpense={handleAddExpense}
          defaultPaymentMode={userProfile.preferredPaymentMode}
        />

        {/* Create Trip Modal */}
        <CreateTripModal
          isOpen={isCreateTripOpen}
          onClose={() => setIsCreateTripOpen(false)}
          onCreateTrip={handleCreateTrip}
          defaultMembers={members}
        />

        {/* Profile Modal / Drawer */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          userProfile={userProfile}
          onSaveProfile={handleSaveProfile}
          trips={trips}
        />

        {/* Invite Friends / QR Code Modal */}
        <InviteModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          trip={activeTrip}
        />
      </div>
    </div>
  );
}
