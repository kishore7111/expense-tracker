'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, Firestore } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import { getSdks } from '.';

/** Helper function to create a user profile document in Firestore. */
function createUserProfile(firestore: Firestore, user: UserCredential['user']) {
  if (!user) return;
  const userProfileRef = doc(firestore, 'users', user.uid);
  const profileData = {
    email: user.email,
    role: 'admin', // Temporarily set to 'admin' for testing
  };
  setDoc(userProfileRef, profileData, { merge: true }).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: userProfileRef.path,
        operation: 'create',
        requestResourceData: profileData,
      })
    );
  });
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string
): Promise<UserCredential> {
  const { firestore } = getSdks(authInstance.app);
  return createUserWithEmailAndPassword(authInstance, email, password).then(
    userCredential => {
      createUserProfile(firestore, userCredential.user);
      return userCredential;
    }
  );
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}
