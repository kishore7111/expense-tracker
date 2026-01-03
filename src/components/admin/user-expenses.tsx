
'use client';

import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile, Expense } from '@/lib/types';
import Header from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon } from '@/lib/icons';
import ExpenseForm from '@/components/dashboard/expense-form';
import StatsCards from '../dashboard/stats-cards';
import CategoryChart from '../dashboard/category-chart';

type UserExpensesProps = {
  adminUser: FirebaseUser;
  selectedUser: UserProfile;
  onBack: () => void;
};

export default function UserExpenses({ adminUser, selectedUser, onBack }: UserExpensesProps) {
  const firestore = useFirestore();

  const expensesQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'users', selectedUser.id, 'expenses'), orderBy('date', 'desc'));
  }, [firestore, selectedUser.id]);

  const { data: expenses, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: any) => {
    return date.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Header user={adminUser} onGenerateSummary={() => {}} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Users
          </Button>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Viewing Expenses for: {selectedUser.email}</CardTitle>
            <CardDescription>This is an admin view of the selected user's financial data.</CardDescription>
          </CardHeader>
        </Card>

        {expenses && (
          <>
            <div className="grid gap-6 md:gap-8 mb-6">
                <StatsCards expenses={expenses} />
                <div className="grid md:grid-cols-5 gap-6 md:gap-8">
                    <div className="md:col-span-2">
                        <CategoryChart expenses={expenses} />
                    </div>
                    <div className="md:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Transactions</CardTitle>
                            <CardDescription>A complete list of this user's expenses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.length > 0 ? (
                                expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                    <TableCell className="font-medium">{expense.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                        {getCategoryIcon(expense.category)}
                                        {expense.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{formatDate(expense.date)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                                    <TableCell className="text-right">
                                        <ExpenseForm expense={expense} userId={selectedUser.id} />
                                    </TableCell>
                                    </TableRow>
                                ))
                                ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                    This user has no expenses.
                                    </TableCell>
                                </TableRow>
                                )}
                            </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    </div>
                </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
