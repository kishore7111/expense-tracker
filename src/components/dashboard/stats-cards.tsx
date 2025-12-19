'use client';

import type { Expense } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { useMemo } from 'react';

type StatsCardsProps = {
  expenses: Expense[];
};

export default function StatsCards({ expenses }: StatsCardsProps) {
  const { totalExpenses, monthlyExpenses, transactionCount } = useMemo(() => {
    if (!expenses) return { totalExpenses: 0, monthlyExpenses: 0, transactionCount: 0 };
    
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const now = new Date();
    const monthly = expenses
      .filter((expense) => {
          const expenseDate = (expense.date as any).toDate();
          return expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        }
      )
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      totalExpenses: total,
      monthlyExpenses: monthly,
      transactionCount: expenses.length,
    };
  }, [expenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 md:gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">All-time spending</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(monthlyExpenses)}</div>
          <p className="text-xs text-muted-foreground">Expenses this month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{transactionCount}</div>
          <p className="text-xs text-muted-foreground">Total transactions logged</p>
        </CardContent>
      </Card>
    </div>
  );
}
