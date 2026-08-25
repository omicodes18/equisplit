import { NextRequest, NextResponse } from 'next/server';
import { Trip } from '@/lib/types';

// In-memory server store for zero-config live room synchronization
declare global {
  // eslint-disable-next-line no-var
  var __NOCTURNE_TRIPS_STORE: Map<string, { trip: Trip; updatedAt: number }> | undefined;
}

if (!globalThis.__NOCTURNE_TRIPS_STORE) {
  globalThis.__NOCTURNE_TRIPS_STORE = new Map();
}

const tripsStore = globalThis.__NOCTURNE_TRIPS_STORE;

export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  const { tripId } = params;
  if (!tripId) {
    return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
  }

  const record = tripsStore.get(tripId);
  if (!record) {
    return NextResponse.json({ found: false, trip: null }, { status: 404 });
  }

  return NextResponse.json({
    found: true,
    trip: record.trip,
    updatedAt: record.updatedAt,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  const { tripId } = params;
  try {
    const body = await request.json();
    const trip: Trip = body.trip || body;

    if (!trip || !trip.id) {
      return NextResponse.json({ error: 'Invalid trip data' }, { status: 400 });
    }

    const updatedAt = Date.now();
    const existing = tripsStore.get(tripId);

    // Merge members, expenses, and settlements to avoid race conditions
    let mergedTrip = trip;
    if (existing && existing.trip) {
      const prevTrip = existing.trip;

      // Merge members uniquely by ID
      const memberMap = new Map();
      (prevTrip.members || []).forEach((m) => memberMap.set(m.id, m));
      (trip.members || []).forEach((m) => memberMap.set(m.id, m));

      // Merge expenses uniquely by ID
      const expenseMap = new Map();
      (prevTrip.expenses || []).forEach((e) => expenseMap.set(e.id, e));
      (trip.expenses || []).forEach((e) => expenseMap.set(e.id, e));

      // Merge settlements uniquely by ID
      const settlementMap = new Map();
      (prevTrip.settlements || []).forEach((s) => settlementMap.set(s.id, s));
      (trip.settlements || []).forEach((s) => settlementMap.set(s.id, s));

      // Check if this was a deletion request (explicit full overwrite)
      if (body.isFullOverwrite) {
        mergedTrip = trip;
      } else {
        mergedTrip = {
          ...trip,
          members: Array.from(memberMap.values()),
          expenses: Array.from(expenseMap.values()),
          settlements: Array.from(settlementMap.values()),
        };
      }
    }

    tripsStore.set(tripId, { trip: mergedTrip, updatedAt });

    return NextResponse.json({
      success: true,
      trip: mergedTrip,
      updatedAt,
    });
  } catch (err) {
    console.error('Failed to sync trip in API:', err);
    return NextResponse.json({ error: 'Server error processing trip sync' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  const { tripId } = params;
  if (tripId) {
    tripsStore.delete(tripId);
  }
  return NextResponse.json({ success: true });
}
