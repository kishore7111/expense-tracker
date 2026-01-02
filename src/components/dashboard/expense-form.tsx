'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  collection,
  doc,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore';

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon, Edit, PlusCircle, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Expense } from '@/lib/types';
import { expenseCategories } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getAICategory, revalidateDashboard } from '@/app/actions';
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
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { Textarea } from '../ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { CommandList } from 'cmdk';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  description: z.string().optional(),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  category: z.string().min(1, { message: 'Category is required.' }),
  date: z.date(),
});

type ExpenseFormProps = {
  expense?: Expense;
  userId?: string; // Optional userId for admin edits
};

export default function ExpenseForm({ expense, userId: adminUserId }: ExpenseFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  
  const userId = adminUserId || user?.uid;

  const expensesQuery = useMemoFirebase(() => {
    if (!userId) return null;
    return query(collection(firestore, 'users', userId, 'expenses'), orderBy('date', 'desc'));
  }, [firestore, userId]);
  
  const { data: userExpenses } = useCollection<Expense>(expensesQuery);

  const allCategories = useMemo(() => {
    const categories = new Set(expenseCategories);
    if (userExpenses) {
      userExpenses.forEach(exp => categories.add(exp.category));
    }
    return Array.from(categories).sort();
  }, [userExpenses]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: expense?.title ?? '',
      description: expense?.description ?? '',
      amount: expense?.amount ?? 0,
      category: expense?.category ?? '',
      date: expense?.date ? expense.date.toDate() : new Date(),
    },
  });

  const resetForm = () => {
    form.reset({
      title: expense?.title ?? '',
      description: expense?.description ?? '',
      amount: expense?.amount ?? 0,
      category: expense?.category ?? '',
      date: expense?.date ? expense.date.toDate() : new Date(),
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not found.' });
      return;
    }

    setIsSubmitting(true);

    let category = values.category;
    if (!category || category === '') {
      category = await getAICategory(values.title, values.description);
    }

    const expenseData = {
      ...values,
      userId: userId,
      category,
      date: Timestamp.fromDate(values.date),
      timestamp: new Date().getTime(),
    };

    try {
      if (expense) {
        const docRef = doc(firestore, 'users', userId, 'expenses', expense.id);
        updateDocumentNonBlocking(docRef, expenseData);
        toast({ title: 'Success', description: 'Expense updated successfully.' });
      } else {
        const collectionRef = collection(firestore, 'users', userId, 'expenses');
        addDocumentNonBlocking(collectionRef, expenseData);
        toast({ title: 'Success', description: 'Expense added successfully.' });
      }
      
      await revalidateDashboard();
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
    if (!userId || !expense || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete expense.' });
      return;
    }
    const docRef = doc(firestore, 'users', userId, 'expenses', expense.id);
    deleteDocumentNonBlocking(docRef);
    await revalidateDashboard();
    toast({ title: 'Success', description: 'Expense deleted.' });
    setIsDeleteDialogOpen(false);
    setIsOpen(false);
  };

  const onOpenChange = (open: boolean) => {
    if (open) {
      resetForm();
    }
    setIsOpen(open);
  };

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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Morning latte with a friend" {...field} />
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
                <FormItem className="flex flex-col">
                  <FormLabel>Category</FormLabel>
                   <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? allCategories.find(
                                (category) => category === field.value
                              )
                            : "Select or type a category..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                       <Command>
                        <CommandInput 
                          placeholder="Search or add category..."
                          onValueChange={(value) => {
                            if (!allCategories.find(c => c.toLowerCase() === value.toLowerCase())) {
                              form.setValue('category', value)
                            }
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>No category found. Type to add a new one.</CommandEmpty>
                          <CommandGroup>
                            {allCategories.map((category) => (
                              <CommandItem
                                value={category}
                                key={category}
                                onSelect={() => {
                                  form.setValue("category", category)
                                  setIsCategoryPopoverOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    category === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {category}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                        This action cannot be undone. This will permanently delete this expense.
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
