'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Expense } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { PiggyBank, ReceiptText } from 'lucide-react';

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

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const q = query(
        collection(db, 'expenses'), 
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userExpenses: Expense[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userExpenses.push({
            id: doc.id,
            ...data,
            date: data.date.toDate(),
          } as Expense);
        });
        setExpenses(userExpenses);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleGenerateSummary = async () => {
    if (expenses.length === 0) {
      setSummary("You don't have any expenses logged yet. Start adding expenses to get a summary.");
      setIsSummaryDialogOpen(true);
      return;
    }
    setIsSummaryLoading(true);
    setIsSummaryDialogOpen(true);
    try {
      const formattedExpenses = expenses.map(e => ({
        ...e,
        date: e.date.toISOString().split('T')[0],
        timestamp: e.date.getTime(),
      }));
      const result = await generateFinancialSummary({ expenses: formattedExpenses });
      setSummary(result.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Sorry, we could not generate a summary at this time.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header user={null} onGenerateSummary={() => {}} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="grid gap-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Skeleton className="h-36" />
              <Skeleton className="h-36" />
              <Skeleton className="h-36" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header user={user} onGenerateSummary={handleGenerateSummary} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <PiggyBank className="w-16 h-16 mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Welcome to SpendWise!</h2>
            <p className="text-muted-foreground">You haven&apos;t added any expenses yet. Click the &quot;Add Expense&quot; button to get started.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8">
            <StatsCards expenses={expenses} />
            <div className="grid md:grid-cols-5 gap-6 md:gap-8">
              <div className="md:col-span-2">
                <CategoryChart expenses={expenses} />
              </div>
              <div className="md:col-span-3">
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
    </div>
  );
}
