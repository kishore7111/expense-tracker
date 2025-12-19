'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon, Edit, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useUser } from '@/firebase';
import type { Expense } from '@/lib/types';
import { expenseCategories } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addExpense, updateExpense, deleteExpense } from '@/app/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  category: z.string().optional(),
  date: z.date(),
});

type ExpenseFormProps = {
  expense?: Expense;
};

export default function ExpenseForm({ expense }: ExpenseFormProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: expense?.title ?? '',
      amount: expense?.amount ?? 0,
      category: expense?.category ?? '',
      date: expense?.date ? (expense.date as unknown as { toDate: () => Date }).toDate() : new Date(),
    },
  });
  
  const resetForm = () => {
    form.reset({
      title: expense?.title ?? '',
      amount: expense?.amount ?? 0,
      category: expense?.category ?? '',
      date: expense?.date ? (expense.date as unknown as { toDate: () => Date }).toDate() : new Date(),
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    
    setIsSubmitting(true);
    
    const expenseData = {
      ...values,
      userId: user.uid,
    };

    try {
      if (expense) {
        await updateExpense(expense.id, expenseData);
        toast({ title: 'Success', description: 'Expense updated successfully.' });
      } else {
        await addExpense(expenseData);
        toast({ title: 'Success', description: 'Expense added successfully.' });
      }
      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Something went wrong.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = async () => {
    if (!user || !expense) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete expense.' });
      return;
    }
    try {
      await deleteExpense(user.uid, expense.id);
      toast({ title: 'Success', description: 'Expense deleted.' });
      setIsDeleteDialogOpen(false);
      setIsOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete expense.' });
    }
  };

  const onOpenChange = (open: boolean) => {
    if (open) {
      resetForm();
    }
    setIsOpen(open);
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {expense ? (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</SheetTitle>
          <SheetDescription>
            {expense ? 'Update the details of your expense.' : 'Enter the details of your new expense.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Coffee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category (or let AI decide)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="pt-4">
              {expense && (
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="mr-auto">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your expense.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Expense'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
