'use server';

import { doc, collection, Timestamp, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/server-init';
import { categorizeExpense } from '@/ai/flows/categorize-expense';

type ExpenseInput = {
  userId: string;
  title: string;
  amount: number;
  category?: string;
  date: Date;
};

export async function addExpense(expenseData: ExpenseInput) {
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
  
  const collectionRef = collection(firestore, 'users', expenseData.userId, 'expenses');

  await addDoc(collectionRef, {
    ...expenseData,
    category,
    date: Timestamp.fromDate(expenseData.date),
    timestamp: new Date().getTime(),
  });

  revalidatePath('/');
}

export async function updateExpense(expenseId: string, expenseData: ExpenseInput) {
  const docRef = doc(firestore, 'users', expenseData.userId, 'expenses', expenseId);
  
  await updateDoc(docRef, {
      ...expenseData,
      date: Timestamp.fromDate(expenseData.date),
  });

  revalidatePath('/');
}

export async function deleteExpense(userId: string, expenseId: string) {
  const docRef = doc(firestore, 'users', userId, 'expenses', expenseId);
  await deleteDoc(docRef);

  revalidatePath('/');
}
