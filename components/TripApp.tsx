'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trip, Expense, Settlement, MemberBalance, UserProfile } from '@/lib/types';
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
import { FirstTripView } from '@/components/FirstTripView';
import { SyncStatusPill } from '@/components/SyncStatusPill';
import { Plus } from 'lucide-react';

interface TripAppProps {
  initialTripId?: string;
}

export function TripApp({ initialTripId }: TripAppProps) {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [activeTripId, setActiveTripId] = useState<string>(initialTripId || '');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

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

            const creatorId = storedProfile?.id || `member-${Date.now()}-1`;
            const creatorName = storedProfile?.name || 'Member 1';

            const dynamicTrip: Trip = {
              id: initialTripId,
              name: formattedName || 'New Trip',
              emoji: '✨',
              members: [
                {
                  id: creatorId,
                  name: creatorName,
                  avatarColor: '#f472b6',
                  avatarUrl: storedProfile?.avatarUrl,
                },
                { id: `member-${Date.now()}-2`, name: 'Member 2', avatarColor: '#ddb8ff' },
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
        } else {
          setTrips([]);
          setActiveTripId('');
        }
      } catch (e) {
        console.error('Storage initialization error:', e);
      } finally {
        setIsLoaded(true);
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
    if (updatedProfile.id || updatedProfile.name) {
      const updatedTrips = trips.map((t) => ({
        ...t,
        members: t.members.map((m) => {
          if (
            (updatedProfile.id && m.id === updatedProfile.id) ||
            (userProfile.name && m.name === userProfile.name)
          ) {
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
    }
  };

  // Switch trip and update URL
  const handleSelectTrip = (tripId: string) => {
    setActiveTripId(tripId);
    router.push(`/trip/${tripId}`);
  };

  // Create new trip (and optionally record creator name into user profile)
  const handleCreateTrip = (newTrip: Trip, creatorName?: string) => {
    if (creatorName && (!userProfile.name || userProfile.name !== creatorName)) {
      const creatorMember = newTrip.members[0];
      const updatedProf: UserProfile = {
        ...userProfile,
        id: creatorMember?.id || userProfile.id || `user-${Date.now()}`,
        name: creatorName,
      };
      setUserProfile(updatedProf);
      persistUserProfile(updatedProf);
    }

    const updated = [newTrip, ...trips.filter((t) => t.id !== newTrip.id)];
    saveTrips(updated);
    setActiveTripId(newTrip.id);
    setActiveTab('dashboard');
    router.push(`/trip/${newTrip.id}`);
  };

  // Delete Trip
  const handleDeleteTrip = (tripIdToDelete: string) => {
    const updated = trips.filter((t) => t.id !== tripIdToDelete);
    saveTrips(updated);

    if (activeTripId === tripIdToDelete) {
      if (updated.length > 0) {
        setActiveTripId(updated[0].id);
        router.push(`/trip/${updated[0].id}`);
      } else {
        setActiveTripId('');
        router.push('/');
      }
    }
  };

  // Add Expense
  const handleAddExpense = (newExpData: Omit<Expense, 'id'>) => {
    const activeTrip = trips.find((t) => t.id === activeTripId);
    if (!activeTrip) return;

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
    const activeTrip = trips.find((t) => t.id === activeTripId);
    if (!activeTrip) return;

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
    const activeTrip = trips.find((t) => t.id === activeTripId);
    if (!activeTrip) return;

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

  // Find active trip
  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0];

  // If no trips exist, render the clean "Create Your First Trip" onboarding screen!
  if (isLoaded && (!activeTrip || trips.length === 0)) {
    return (
      <>
        <FirstTripView
          userProfile={userProfile}
          onCreateTrip={handleCreateTrip}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Profile Modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          userProfile={userProfile}
          onSaveProfile={handleSaveProfile}
          trips={trips}
        />
      </>
    );
  }

  // Fallback while loading
  if (!activeTrip) {
    return (
      <div className="min-h-screen bg-[#091E15] flex items-center justify-center text-primary font-bold">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs uppercase tracking-widest text-on-surface-variant">Loading Nocturne...</span>
        </div>
      </div>
    );
  }

  const members = activeTrip.members || [];
  const expenses = activeTrip.expenses || [];
  const settlements = activeTrip.settlements || [];

  // Live balance calculation
  const balances: MemberBalance[] = calculateBalances(members, expenses, settlements);
  const totalGroupSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-[#091E15] text-[#d0e8d9] flex justify-center selection:bg-primary/30 selection:text-primary">
      {/* Mobile-First Constrained Wrapper */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-[#03170e] shadow-2xl border-x border-white/5 pb-24">
        {/* Sticky Top Header with Switcher, Delete Trip, Invite & Profile */}
        <Header
          trips={trips}
          activeTrip={activeTrip}
          userProfile={userProfile}
          onSelectTrip={handleSelectTrip}
          onCreateNewTrip={() => setIsCreateTripOpen(true)}
          onDeleteTrip={handleDeleteTrip}
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
          className="fixed bottom-20 right-4 sm:right-auto sm:left-[calc(50%+140px)] w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg active:scale-95 hover:scale-105 transition-transform z-30 border border-white/10 cursor-pointer"
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
          currentUser={userProfile.name ? { id: userProfile.id, name: userProfile.name } : undefined}
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
