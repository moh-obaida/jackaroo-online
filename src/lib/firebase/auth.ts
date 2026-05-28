// ============================================================================
// AUTH MODULE — Firebase Authentication helpers
// Supports guest (anonymous) and email/password auth.
// ============================================================================

import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { ref, set, serverTimestamp } from 'firebase/database';
import { auth, database } from './config';

export type AuthUser = User;

/**
 * Sign in as guest (anonymous).
 */
export async function signInAsGuest(): Promise<User> {
  const result = await signInAnonymously(auth);
  return result.user;
}

/**
 * Register with email and password.
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });

  // Create user profile in database
  const userRef = ref(database, `users/${result.user.uid}/profile`);
  await set(userRef, {
    displayName,
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  });

  return result.user;
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Sign out.
 */
export async function logOut(): Promise<void> {
  await signOut(auth);
}

/**
 * Get current user.
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Check if user is guest (anonymous).
 */
export function isGuest(user: User | null): boolean {
  return user?.isAnonymous ?? true;
}

/**
 * Subscribe to auth state changes.
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Update user's last seen timestamp.
 */
export async function updateLastSeen(uid: string): Promise<void> {
  const userRef = ref(database, `users/${uid}/profile/lastSeen`);
  await set(userRef, serverTimestamp());
}
