// src/app/actions.ts
'use server';

import { categorizeExpense } from '@/ai/flows/categorize-expense';
import { revalidatePath } from 'next/cache';

/**
 * Server action to get an AI-inferred category for an expense.
 * This runs on the server to protect the AI API key.
 * @param title The title of the expense.
 * @param description The description of the expense.
 * @returns The category name.
 */
export async function getAICategory(title: string, description?: string): Promise<string> {
  try {
    const result = await categorizeExpense({ title, description });
    return result.category;
  } catch (error) {
    console.error("AI categorization failed, falling back to 'Other'", error);
    return 'Other';
  }
}

/**
 * Server action to revalidate the cache for the dashboard page.
 * This is called from the client after a successful data mutation.
 */
export async function revalidateDashboard() {
  revalidatePath('/');
}
