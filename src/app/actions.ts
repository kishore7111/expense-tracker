'use server';

import { doc, addDoc, updateDoc, deleteDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client'; // Server can use client config for this app
import { categorizeExpense } from '@/ai/flows/categorize-expense';
import { revalidatePath } from 'next/cache';

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

  await addDoc(collection(db, 'expenses'), {
    ...expenseData,
    category,
    date: Timestamp.fromDate(expenseData.date),
  });

  revalidatePath('/');
}

export async function updateExpense(id: string, expenseData: ExpenseInput) {
  const docRef = doc(db, 'expenses', id);
  await updateDoc(docRef, {
      ...expenseData,
      date: Timestamp.fromDate(expenseData.date),
  });

  revalidatePath('/');
}

export async function deleteExpense(id: string) {
  const docRef = doc(db, 'expenses', id);
  await deleteDoc(docRef);

  revalidatePath('/');
}
