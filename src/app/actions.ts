'use server';

import { doc, collection, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { getSdks, initializeFirebase } from '@/firebase';
import { categorizeExpense } from '@/ai/flows/categorize-expense';
import { 
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking
} from '@/firebase/non-blocking-updates';

type ExpenseInput = {
  userId: string;
  title: string;
  amount: number;
  category?: string;
  date: Date;
};

function getDb() {
  const { firestore } = initializeFirebase();
  return firestore;
}

export async function addExpense(expenseData: ExpenseInput) {
  const db = getDb();
  let category = expenseData.category;

  if (!category) {
    try {
      const result = await categorizeExpense({ title: expenseData.title, description: '' });
      category = result.category;
    } catch (error) {
      console.error("AI categorization failed, falling back to 'Other'", error);
      category = 'Other';
    }
  }
  
  const collectionRef = collection(db, 'users', expenseData.userId, 'expenses');

  addDocumentNonBlocking(collectionRef, {
    ...expenseData,
    category,
    date: Timestamp.fromDate(expenseData.date),
    timestamp: new Date().getTime(),
  });

  revalidatePath('/');
}

export async function updateExpense(expenseId: string, expenseData: ExpenseInput) {
  const db = getDb();
  const docRef = doc(db, 'users', expenseData.userId, 'expenses', expenseId);
  
  updateDocumentNonBlocking(docRef, {
      ...expenseData,
      date: Timestamp.fromDate(expenseData.date),
  });

  revalidatePath('/');
}

export async function deleteExpense(userId: string, expenseId: string) {
  const db = getDb();
  const docRef = doc(db, 'users', userId, 'expenses', expenseId);
  deleteDocumentNonBlocking(docRef);

  revalidatePath('/');
}
