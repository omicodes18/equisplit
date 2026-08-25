'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trip, UserProfile } from '@/lib/types';
import { calculateBalances, formatINR, triggerConfetti } from '@/lib/utils';
import {
  loadTripsFromStorage,
  persistTripsToStorage,
  loadUserProfile,
  persistUserProfile,
  DEFAULT_USER_PROFILE,
} from '@/lib/storage';
import { syncTripToCloud } from '@/lib/cloudSync';
import { FairyAvatar } from './FairyAvatar';
import { SyncStatusPill } from './SyncStatusPill';
import { ProfileModal } from './ProfileModal';
import { CreateTripModal } from './CreateTripModal';
import {
  Plus,
  Sparkles,
  ArrowRight,
  Trash2,
  AlertTriangle,
  Compass,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react';

export function MyTripsHub() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);

  // Load from local storage
  useEffect(() => {
    async function loadData() {
      try {
        const [storedTrips, storedProfile] = await Promise.all([
          loadTripsFromStorage(),
          loadUserProfile(),
        ]);

        if (storedProfile) {
          setUserProfile(storedProfile);
        }

        if (storedTrips) {
          setTrips(storedTrips);
        }
      } catch (e) {
        console.error('Failed to load trips for hub:', e);
      } finally {
        setIsLoaded(true);
      }
    }

    loadData();
  }, []);

  // Save trips locally and cloud
  const saveTrips = (updatedTrips: Trip[]) => {
    setTrips(updatedTrips);
    persistTripsToStorage(updatedTrips);
  };

  // Create new trip from hub
  const handleCreateTrip = async (newTrip: Trip, creatorName?: string) => {
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
    // Push to cloud
    syncTripToCloud(newTrip).catch(() => {});
    triggerConfetti();
    router.push(`/trip/${newTrip.id}`);
  };

  // Save profile
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    persistUserProfile(updatedProfile);

    if (updatedProfile.id || updatedProfile.name) {
      const updatedTrips = trips.map((t) => ({
        ...t,
        members: t.members.map((m) => {
          if (
            (updatedProfile.id && m.id === updatedProfile.id) ||
            (userProfile.name && m.name.toLowerCase() === userProfile.name.toLowerCase())
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

  // Delete trip
  const handleConfirmDeleteTrip = async () => {
    if (!tripToDelete) return;
    const updated = trips.filter((t) => t.id !== tripToDelete.id);
    saveTrips(updated);
    // Cloud delete
    try {
      fetch(`/api/trips/${encodeURIComponent(tripToDelete.id)}`, { method: 'DELETE' }).catch(() => {});
    } catch {}
    setTripToDelete(null);
  };

  // Compute grand total summary across all trips for current user
  let totalUserOwes = 0;
  let totalUserIsOwed = 0;

  trips.forEach((trip) => {
    const balances = calculateBalances(trip.members || [], trip.expenses || [], trip.settlements || []);
    const userBal = balances.find(
      (b) =>
        (userProfile.id && b.member.id === userProfile.id) ||
        (userProfile.name && b.member.name.toLowerCase() === userProfile.name.toLowerCase())
    );

    if (userBal) {
      if (userBal.netBalance > 0) totalUserIsOwed += userBal.netBalance;
      else if (userBal.netBalance < 0) totalUserOwes += Math.abs(userBal.netBalance);
    }
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#091E15] flex items-center justify-center text-primary font-bold">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs uppercase tracking-widest text-on-surface-variant">
            Loading My Trips...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#091E15] text-[#d0e8d9] flex justify-center selection:bg-primary/30 selection:text-primary">
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-[#03170e] shadow-2xl border-x border-white/5 pb-12">
        {/* Sticky Top Header */}
        <header className="sticky top-0 w-full z-40 pt-safe bg-surface/90 backdrop-blur-xl border-b border-white/5 px-container-padding h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0 shadow-[0_0_10px_rgba(244,114,182,0.3)]">
              <span className="text-base">✨</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                Nocturne Ledger
              </span>
              <span className="font-semibold text-sm sm:text-base text-on-surface">
                My Trips Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              title={userProfile.name ? `Profile: ${userProfile.name}` : 'Profile'}
              className="focus:outline-none active:scale-95 transition-transform cursor-pointer"
            >
              <FairyAvatar
                name={userProfile.name}
                avatarUrl={userProfile.avatarUrl}
                size="sm"
                showWings={true}
                showHalo={true}
              />
            </button>
          </div>
        </header>

        {/* Main Body Content */}
        <main className="flex-1 px-container-padding pt-4 space-y-5">
          {/* Sync Status Banner Pill */}
          <div className="flex justify-center items-center">
            <SyncStatusPill />
          </div>

          {/* Quick Balance Summary Pill (if user has active trips) */}
          {trips.length > 0 && (totalUserIsOwed > 0 || totalUserOwes > 0) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-3.5 bg-surface-container/70 border border-primary/20 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-primary flex items-center gap-1">
                  <TrendingDown size={13} />
                  <span>You Owe</span>
                </span>
                <span className="text-xl font-extrabold text-primary mt-1">
                  ₹{formatINR(totalUserOwes)}
                </span>
              </div>

              <div className="rounded-2xl p-3.5 bg-surface-container/70 border border-tertiary/20 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-tertiary flex items-center gap-1">
                  <TrendingUp size={13} />
                  <span>You Are Owed</span>
                </span>
                <span className="text-xl font-extrabold text-tertiary-fixed-dim mt-1">
                  ₹{formatINR(totalUserIsOwed)}
                </span>
              </div>
            </div>
          )}

          {/* Trips Header & Action */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div>
              <h2 className="text-lg font-bold text-on-surface">Your Active Rooms</h2>
              <p className="text-xs text-on-surface-variant">
                {trips.length === 0
                  ? 'No trips joined yet'
                  : `${trips.length} saved room${trips.length === 1 ? '' : 's'}`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateTripOpen(true)}
              className="px-3.5 py-2 rounded-full bg-primary text-on-primary text-xs font-bold shadow-[0_0_15px_rgba(244,114,182,0.3)] hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} className="stroke-[2.5]" />
              <span>Create Trip</span>
            </button>
          </div>

          {/* Trips List / Empty State */}
          {trips.length === 0 ? (
            <div className="relative w-full rounded-[28px] bg-surface-container/50 backdrop-blur-xl p-8 border border-white/5 text-center flex flex-col items-center justify-center gap-3 active-glow">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary/25 to-secondary/25 flex items-center justify-center text-3xl border border-primary/30 shadow-[0_0_25px_rgba(244,114,182,0.25)]">
                🌴
              </div>

              <h3 className="text-xl font-bold text-on-surface tracking-tight mt-1">
                No Trips Yet
              </h3>
              <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
                Create a room for your vacation, party, or flatmates. Friends can scan the QR code to join and split bills in real-time!
              </p>

              <button
                type="button"
                onClick={() => setIsCreateTripOpen(true)}
                className="mt-3 w-full py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-[0_0_20px_rgba(244,114,182,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={18} />
                <span>+ Create Your First Trip</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {trips.map((trip) => {
                const members = trip.members || [];
                const expenses = trip.expenses || [];
                const settlements = trip.settlements || [];
                const balances = calculateBalances(members, expenses, settlements);
                const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

                const userBal = balances.find(
                  (b) =>
                    (userProfile.id && b.member.id === userProfile.id) ||
                    (userProfile.name && b.member.name.toLowerCase() === userProfile.name.toLowerCase())
                );

                const netBal = userBal ? userBal.netBalance : 0;

                return (
                  <div
                    key={trip.id}
                    onClick={() => router.push(`/trip/${trip.id}`)}
                    className="w-full rounded-2xl glass-panel p-4 flex flex-col gap-3 shadow-md hover:border-primary/40 active:scale-[0.99] transition-all cursor-pointer relative overflow-hidden group"
                  >
                    {/* Top Row: Emoji, Name, Spend & Delete */}
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-2xl border border-white/10 shrink-0 shadow-inner">
                          {trip.emoji || '🌴'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-bold text-base text-on-surface truncate group-hover:text-primary transition-colors">
                            {trip.name}
                          </h3>
                          <span className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                            <Users size={12} className="text-secondary" />
                            <span>
                              {members.length} member{members.length === 1 ? '' : 's'} • {expenses.length} bill{expenses.length === 1 ? '' : 's'}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTripToDelete(trip);
                          }}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-white/10 opacity-70 hover:opacity-100 transition-all"
                          title="Delete trip"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Spending Total & User Standing */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 relative z-10 text-xs">
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <Wallet size={13} className="text-tertiary" />
                        <span>Total: <strong>₹{formatINR(totalSpend)}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        {userBal ? (
                          netBal > 0 ? (
                            <span className="font-bold text-tertiary-fixed-dim bg-tertiary-container/20 px-2 py-0.5 rounded-full border border-tertiary/20">
                              +₹{formatINR(netBal)} (Owed to you)
                            </span>
                          ) : netBal < 0 ? (
                            <span className="font-bold text-primary bg-primary/20 px-2 py-0.5 rounded-full border border-primary/20">
                              -₹{formatINR(Math.abs(netBal))} (You owe)
                            </span>
                          ) : (
                            <span className="font-medium text-on-surface-variant bg-white/5 px-2 py-0.5 rounded-full">
                              Settled ₹0
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] text-on-surface-variant">
                            Click to join room
                          </span>
                        )}

                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:translate-x-0.5 transition-transform">
                          <ArrowRight size={13} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Create Trip Modal */}
        <CreateTripModal
          isOpen={isCreateTripOpen}
          onClose={() => setIsCreateTripOpen(false)}
          onCreateTrip={handleCreateTrip}
          currentUser={userProfile.name ? { id: userProfile.id, name: userProfile.name } : undefined}
        />

        {/* Profile Modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          userProfile={userProfile}
          onSaveProfile={handleSaveProfile}
          trips={trips}
        />

        {/* Delete Trip Modal */}
        {tripToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-surface-variant/95 backdrop-blur-2xl rounded-3xl p-5 border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-error/20 border border-error/30 flex items-center justify-center text-error shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">
                    Delete &ldquo;{tripToDelete.name}&rdquo;?
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Are you sure you want to delete this trip and its {tripToDelete.expenses.length} expenses? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setTripToDelete(null)}
                  className="flex-1 py-2.5 rounded-full border border-white/15 text-xs font-bold text-on-surface-variant hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteTrip}
                  className="flex-1 py-2.5 rounded-full bg-error text-white text-xs font-bold shadow-[0_0_15px_rgba(255,180,171,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Delete Trip</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
