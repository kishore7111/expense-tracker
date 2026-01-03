'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Expense, ExpenseCategory } from '@/lib/types';
import { expenseCategories } from '@/lib/types';
import Header from '@/components/dashboard/header';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon } from '@/lib/icons';
import ExpenseForm from '@/components/dashboard/expense-form';
import { ReceiptText, Search, FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getYear, getMonth, format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ExpensesPage() {
  const { user, isUserLoading: authLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const expensesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'expenses'), orderBy('date', 'desc'));
  }, [firestore, user]);

  const { data: expenses, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);
  
  useEffect(() => {
    if (expenses) {
      const years = new Set(expenses.map(e => getYear(e.date.toDate())));
      const currentYear = new Date().getFullYear();
      if (!years.has(currentYear)) {
        years.add(currentYear);
      }
      setAvailableYears(Array.from(years).sort((a, b) => b - a));
    }
  }, [expenses]);
  
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter(expense => {
      const expenseDate = expense.date.toDate();
      const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      const matchesMonth = getMonth(expenseDate) === selectedMonth;
      const matchesYear = getYear(expenseDate) === selectedYear;
      return matchesSearch && matchesCategory && matchesMonth && matchesYear;
    });
  }, [expenses, searchTerm, selectedCategory, selectedMonth, selectedYear]);


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
  
  const formatDateForExport = (date: any) => {
    return date.toDate().toLocaleDateString('en-US');
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const monthName = months[selectedMonth];
    doc.setFontSize(18);
    doc.text(`Expenses for ${monthName} ${selectedYear}`, 14, 22);

    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Title', 'Category', 'Amount']],
      body: filteredExpenses.map(expense => [
        formatDateForExport(expense.date),
        expense.title,
        expense.category,
        formatCurrency(expense.amount)
      ]),
      foot: [['Total', '', '', formatCurrency(total)]],
      headStyles: { fillColor: [22, 163, 74] }, // Primary color
      footStyles: { fillColor: [210, 214, 218] }, // Muted color
    });

    doc.save(`expenses-${selectedYear}-${selectedMonth + 1}.pdf`);
  };

  const handleDownloadXlsx = () => {
    const monthName = months[selectedMonth];
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const dataToExport = filteredExpenses.map(expense => ({
      Date: formatDateForExport(expense.date),
      Title: expense.title,
      Category: expense.category,
      Amount: expense.amount
    }));

    dataToExport.push({
        Date: 'Total',
        Title: '',
        Category: '',
        Amount: total
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Style the total row
    const totalRowIndex = dataToExport.length; // 1-based index
    worksheet[`A${totalRowIndex}`]!.s = { font: { bold: true } };
    worksheet[`D${totalRowIndex}`]!.s = { font: { bold: true } };
    worksheet[`D${totalRowIndex}`]!.t = 'n';
    worksheet[`D${totalRowIndex}`]!.z = '$#,##0.00';


    // Set column widths
    worksheet['!cols'] = [
        { wch: 12 }, // Date
        { wch: 30 }, // Title
        { wch: 15 }, // Category
        { wch: 10 }  // Amount
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
    XLSX.writeFile(workbook, `expenses-${selectedYear}-${selectedMonth + 1}.xlsx`);
  };

  if (authLoading || expensesLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header user={null} onGenerateSummary={() => {}} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="grid gap-6">
            <Skeleton className="h-96" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header user={user} onGenerateSummary={() => {}} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ReceiptText className="h-6 w-6 text-primary" />
                  All Expenses
                </CardTitle>
                <CardDescription>A complete history of your transactions.</CardDescription>
              </div>
              <Link href="/" passHref>
                  <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by title..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as ExpenseCategory | 'all')}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
               <Select
                value={String(selectedMonth)}
                onValueChange={(value) => setSelectedMonth(Number(value))}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(selectedYear)}
                onValueChange={(value) => setSelectedYear(Number(value))}
              >
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={handleDownloadPdf} disabled={filteredExpenses.length === 0}>
                    <FileDown className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button onClick={handleDownloadXlsx} disabled={filteredExpenses.length === 0} variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </Button>
              </div>
            </div>
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
                {filteredExpenses && filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
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
                        <ExpenseForm expense={expense} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No expenses found for the selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}