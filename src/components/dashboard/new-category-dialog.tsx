'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type NewCategoryDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (newCategory: string) => void;
};

export default function NewCategoryDialog({ isOpen, onOpenChange, onSave }: NewCategoryDialogProps) {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!categoryName.trim()) {
      setError('Category name cannot be empty.');
      return;
    }
    // Simple capitalization: "new category" -> "New Category"
    const formattedCategory = categoryName
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
      
    onSave(formattedCategory);
    setCategoryName('');
    setError('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setCategoryName('');
    setError('');
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Category</DialogTitle>
          <DialogDescription>
            Enter the name for your new expense category.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Subscriptions"
            />
          </div>
          {error && <p className="col-span-4 text-center text-sm font-medium text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Category</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
