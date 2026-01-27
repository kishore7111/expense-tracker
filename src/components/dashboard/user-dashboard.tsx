'use client';

import { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { PiggyBank, ReceiptText } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Expense } from '@/lib/types';
import Header from '@/components/dashboard/header';
import StatsCards from '@/components/dashboard/stats-cards';
import CategoryChart from '@/components/dashboard/category-chart';
import RecentExpenses from '@/components/dashboard/recent-expenses';
import { Skeleton } from '@/components/ui/skeleton';
import { generateFinancialSummary } from '@/ai/flows/generate-financial-summary';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type UserDashboardProps = {
  user: FirebaseUser;
};

export default function UserDashboard({ user }: UserDashboardProps) {
  const firestore = useFirestore();
  const [summary, setSummary] = useState('');
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const expensesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'expenses'),
      orderBy('date', 'desc'),
      limit(100)
    );
  }, [firestore, user]);

  const { data: expenses, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);

  const handleGenerateSummary = async () => {
    if (!expenses || expenses.length === 0) {
      setSummary("You don't have any expenses logged yet. Start adding expenses to get a summary.");
      setIsSummaryDialogOpen(true);
      return;
    }
    setIsSummaryLoading(true);
    setIsSummaryDialogOpen(true);
    try {
      const formattedExpenses = expenses.map(e => ({
        ...e,
        date: (e.date as unknown as { toDate: () => Date }).toDate().toISOString().split('T')[0],
        timestamp: (e.date as unknown as { toDate: () => Date }).toDate().getTime(),
      }));
      const result = await generateFinancialSummary({ expenses: formattedExpenses as any });
      setSummary(result.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Sorry, we could not generate a summary at this time.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  return (
    <>
      <Header user={user} onGenerateSummary={handleGenerateSummary} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {expensesLoading ? (
            <div className="grid gap-6">
                <div className="grid md:grid-cols-3 gap-6">
                    <Skeleton className="h-36" />
                    <Skeleton className="h-36" />
                    <Skeleton className="h-36" />
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        ) : !expenses || expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <PiggyBank className="w-16 h-16 mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Welcome to PocketGuard!</h2>
            <p className="text-muted-foreground">You haven&apos;t added any expenses yet. Click the &quot;Add Expense&quot; button to get started.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8">
            <StatsCards expenses={expenses} />
            <div className="grid lg:grid-cols-5 gap-6 md:gap-8">
              <div className="lg:col-span-2">
                <CategoryChart expenses={expenses} />
              </div>
              <div className="lg:col-span-3">
                <RecentExpenses expenses={expenses} />
              </div>
            </div>
          </div>
        )}
      </main>
      
      <AlertDialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ReceiptText className="text-primary" />
              Your Financial Summary
              </AlertDialogTitle>
            <AlertDialogDescription>
              Here is an AI-generated summary of your spending habits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {isSummaryLoading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <div className="text-sm text-foreground py-4 max-h-[300px] overflow-y-auto">
              {summary}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsSummaryDialogOpen(false)}>Got it!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
