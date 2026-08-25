import { Trip } from './types';

const BROADCAST_CHANNEL_NAME = 'nocturne_ledger_sync_channel';
const PENDING_SYNC_KEY = 'nocturne_pending_sync_queue_v1';

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel initialization error:', e);
  }
}

/**
 * Sync a trip to the cloud server and broadcast locally
 */
export async function syncTripToCloud(
  trip: Trip,
  isFullOverwrite: boolean = false
): Promise<Trip | null> {
  if (!trip || !trip.id) return null;

  // Broadcast to other local browser tabs immediately
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'TRIP_UPDATED',
        tripId: trip.id,
        trip,
        timestamp: Date.now(),
      });
    } catch {}
  }

  // If offline, queue for sync when back online
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    queuePendingTripSync(trip, isFullOverwrite);
    return trip;
  }

  try {
    const res = await fetch(`/api/trips/${encodeURIComponent(trip.id)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trip, isFullOverwrite }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.trip || trip;
    } else {
      queuePendingTripSync(trip, isFullOverwrite);
    }
  } catch (err) {
    console.warn('Cloud sync post failed, queued locally:', err);
    queuePendingTripSync(trip, isFullOverwrite);
  }

  return trip;
}

/**
 * Fetch latest trip data from cloud server
 */
export async function fetchTripFromCloud(tripId: string): Promise<Trip | null> {
  if (!tripId || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return null;
  }

  try {
    const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.found && data.trip) {
        return data.trip;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch trip from cloud:', e);
  }

  return null;
}

/**
 * Queue a trip for sync upon network reconnection
 */
function queuePendingTripSync(trip: Trip, isFullOverwrite: boolean = false) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(PENDING_SYNC_KEY);
    const queue: { trip: Trip; isFullOverwrite: boolean; timestamp: number }[] = raw
      ? JSON.parse(raw)
      : [];

    // Replace if already in queue
    const filtered = queue.filter((item) => item.trip.id !== trip.id);
    filtered.push({ trip, isFullOverwrite, timestamp: Date.now() });

    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to queue pending sync:', e);
  }
}

/**
 * Flush pending sync queue when back online
 */
export async function flushPendingSyncQueue(): Promise<void> {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  try {
    const raw = localStorage.getItem(PENDING_SYNC_KEY);
    if (!raw) return;

    const queue: { trip: Trip; isFullOverwrite: boolean; timestamp: number }[] = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) return;

    localStorage.removeItem(PENDING_SYNC_KEY);

    for (const item of queue) {
      await syncTripToCloud(item.trip, item.isFullOverwrite);
    }
  } catch (e) {
    console.error('Failed to flush sync queue:', e);
  }
}

// Auto-flush pending queue on window online event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushPendingSyncQueue().catch(() => {});
  });
}

/**
 * Subscribe to real-time live trip updates (BroadcastChannel + Live Polling)
 */
export function subscribeToTripUpdates(
  tripId: string,
  onUpdate: (trip: Trip) => void
): () => void {
  let isSubscribed = true;

  // 1. BroadcastChannel listener (0ms latency for tabs on same device)
  const handleBroadcastMessage = (event: MessageEvent) => {
    if (!isSubscribed) return;
    if (
      event.data &&
      event.data.type === 'TRIP_UPDATED' &&
      event.data.tripId === tripId &&
      event.data.trip
    ) {
      onUpdate(event.data.trip);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  // 2. Storage event listener for cross-window fallback
  const handleStorageEvent = (event: StorageEvent) => {
    if (!isSubscribed) return;
    if (event.key === 'nocturne_ledger_trips_v1' && event.newValue) {
      try {
        const parsed: Trip[] = JSON.parse(event.newValue);
        const found = parsed.find((t) => t.id === tripId);
        if (found) onUpdate(found);
      } catch {}
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageEvent);
  }

  // 3. Live cloud polling (every 2.5 seconds for cross-device sync)
  const pollCloud = async () => {
    if (!isSubscribed) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    try {
      const remoteTrip = await fetchTripFromCloud(tripId);
      if (remoteTrip && isSubscribed) {
        onUpdate(remoteTrip);
      }
    } catch {}
  };

  // Immediate initial poll
  pollCloud();

  // Recurring polling timer
  const intervalId = setInterval(pollCloud, 2500);

  // Poll when window regains focus or reconnects
  const handleFocus = () => pollCloud();
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleFocus);
  }

  // Unsubscribe / cleanup
  return () => {
    isSubscribed = false;
    clearInterval(intervalId);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleFocus);
    }
  };
}
