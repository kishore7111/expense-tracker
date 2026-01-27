
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import { getSdks } from '.';

/** Helper function to create a user profile document in Firestore. */
async function createUserProfile(firestore: Firestore, user: UserCredential['user']) {
  if (!user) return;
  const userProfileRef = doc(firestore, 'users', user.uid);
  const profileData = {
    email: user.email,
    role: 'user', // Default role for new sign-ups
  };
  try {
    await setDoc(userProfileRef, profileData, { merge: true });
  } catch (error) {
    const permissionError = new FirestorePermissionError({
        path: userProfileRef.path,
        operation: 'create',
        requestResourceData: profileData,
    });
    errorEmitter.emit('permission-error', permissionError);
    // This error is thrown to be caught by the global error boundary
    // and will show the developer an error overlay in development.
    throw permissionError;
  }
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up. */
export async function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string
): Promise<UserCredential> {
    const { firestore } = getSdks(authInstance.app);
    // Create the user first
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    // Then create their profile document
    await createUserProfile(firestore, userCredential.user);
    // Return the credential
    return userCredential;
}

/** Initiate email/password sign-in. */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}
