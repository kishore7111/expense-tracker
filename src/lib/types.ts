export type Expense = {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
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
