
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Performs a setDoc operation and throws a contextual error on failure.
 */
export async function setDocument(docRef: DocumentReference, data: any, options: SetOptions) {
  try {
    await setDoc(docRef, data, options);
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: options.merge ? 'update' : 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

/**
 * Performs an addDoc operation and throws a contextual error on failure.
 */
export async function addDocument(colRef: CollectionReference, data: any) {
  try {
    return await addDoc(colRef, data);
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: colRef.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}


/**
 * Performs an updateDoc operation and throws a contextual error on failure.
 */
export async function updateDocument(docRef: DocumentReference, data: any) {
  try {
    await updateDoc(docRef, data);
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}


/**
 * Performs a deleteDoc operation and throws a contextual error on failure.
 */
export async function deleteDocument(docRef: DocumentReference) {
  try {
    await deleteDoc(docRef);
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}
