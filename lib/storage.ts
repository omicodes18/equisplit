import { Trip, UserProfile } from './types';
import { INITIAL_TRIPS } from './initialData';

const DB_NAME = 'nocturne_ledger_db';
const DB_VERSION = 1;
const TRIPS_STORE = 'trips_store';
const META_STORE = 'meta_store';

const LOCAL_STORAGE_TRIPS_KEY = 'nocturne_ledger_trips_v1';
const LOCAL_STORAGE_PROFILE_KEY = 'nocturne_ledger_user_profile_v1';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: '',
  name: '',
  avatarUrl: '',
  preferredPaymentMode: 'UPI',
};

/**
 * Open or upgrade IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(TRIPS_STORE)) {
        db.createObjectStore(TRIPS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load all trips from IndexedDB with fallback to localStorage
 */
export async function loadTripsFromStorage(): Promise<Trip[]> {
  try {
    const db = await openDB();
    const trips = await new Promise<Trip[]>((resolve, reject) => {
      const tx = db.transaction(TRIPS_STORE, 'readonly');
      const store = tx.objectStore(TRIPS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (trips && trips.length > 0) {
      // Sync to localStorage as backup
      try {
        localStorage.setItem(LOCAL_STORAGE_TRIPS_KEY, JSON.stringify(trips));
      } catch {}
      return trips;
    }
  } catch (e) {
    console.warn('IndexedDB read failed, trying localStorage fallback:', e);
  }

  // Fallback to localStorage
  try {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem(LOCAL_STORAGE_TRIPS_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Persist to IndexedDB asynchronously
          persistTripsToStorage(parsed).catch(() => {});
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error('LocalStorage read failed:', e);
  }

  // Fallback to empty trips initial state
  return INITIAL_TRIPS;
}

/**
 * Persist trips to both IndexedDB and localStorage
 */
export async function persistTripsToStorage(trips: Trip[]): Promise<void> {
  // Always write to localStorage immediately for instant synchronous fallback
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_TRIPS_KEY, JSON.stringify(trips));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  }

  // Write to IndexedDB
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(TRIPS_STORE, 'readwrite');
      const store = tx.objectStore(TRIPS_STORE);
      store.clear();
      trips.forEach((trip) => store.put(trip));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('IndexedDB write failed:', e);
  }
}

/**
 * Load User Profile with fallback
 */
export async function loadUserProfile(): Promise<UserProfile> {
  try {
    const db = await openDB();
    const profile = await new Promise<UserProfile | undefined>((resolve, reject) => {
      const tx = db.transaction(META_STORE, 'readonly');
      const store = tx.objectStore(META_STORE);
      const req = store.get('user_profile');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (profile && profile.name) {
      try {
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
      } catch {}
      return profile;
    }
  } catch (e) {
    console.warn('IndexedDB profile read failed, fallback to localStorage:', e);
  }

  // LocalStorage fallback
  try {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && parsed.name) {
          return parsed;
        }
      }
    }
  } catch {}

  return DEFAULT_USER_PROFILE;
}

/**
 * Persist User Profile
 */
export async function persistUserProfile(profile: UserProfile): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
    } catch {}
  }

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(META_STORE, 'readwrite');
      const store = tx.objectStore(META_STORE);
      store.put(profile, 'user_profile');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('IndexedDB profile write failed:', e);
  }
}
