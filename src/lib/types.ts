
import { Timestamp } from 'firebase/firestore';

export type Expense = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  amount: number;
  category: string;
  date: Timestamp;
};

export const expenseCategories = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Groceries',
  'Other',
] as const;

export type ExpenseCategory = typeof expenseCategories[number];

export type UserProfile = {
  id: string;
  email: string;
  role?: 'user' | 'admin';
};
