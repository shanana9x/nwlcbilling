"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { PlusCircle, Save, X } from 'lucide-react';
import { Transaction } from '@/app/page';
import { adToBs, bsToAd, getCurrentBsDate } from '@/lib/nepali-date';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  initialData?: Transaction | null;
  onCancel?: () => void;
}

export function TransactionForm({ onSubmit, initialData, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    date: getCurrentBsDate(),
    type: 'expense' as 'income' | 'expense',
    source: '',
    amount: '',
    dateFormat: 'BS' as 'BS' | 'AD',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: adToBs(initialData.date), // Convert to BS for editing
        type: initialData.type,
        source: initialData.source,
        amount: initialData.amount.toString(),
        dateFormat: 'BS',
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.source.trim()) {
      newErrors.source = 'Source/Item is required';
    }

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert BS date to AD for storage
    const adDate = formData.dateFormat === 'BS' ? bsToAd(formData.date) : formData.date;

    onSubmit({
      date: adDate,
      type: formData.type,
      source: formData.source.trim(),
      amount: Number(formData.amount),
    });

    // Reset form if not editing
    if (!initialData) {
      setFormData({
        date: getCurrentBsDate(),
        type: 'expense',
        source: '',
        amount: '',
        dateFormat: 'BS',
      });
    }
    
    setErrors({});
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setFormData({
      date: getCurrentBsDate(),
      type: 'expense',
      source: '',
      amount: '',
      dateFormat: 'BS',
    });
    setErrors({});
  };

  const handleDateFormatChange = (newFormat: 'BS' | 'AD') => {
    let newDate = formData.date;
    if (formData.dateFormat === 'BS' && newFormat === 'AD') {
      newDate = bsToAd(formData.date);
    } else if (formData.dateFormat === 'AD' && newFormat === 'BS') {
      newDate = adToBs(formData.date);
    }
    setFormData(prev => ({ ...prev, date: newDate, dateFormat: newFormat }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date Format Toggle */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Date Format</Label>
        <Select
          value={formData.dateFormat}
          onValueChange={(value: 'BS' | 'AD') => handleDateFormatChange(value)}
        >
          <SelectTrigger className="border-slate-200 focus:ring-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BS">Bikram Sambat (BS)</SelectItem>
            <SelectItem value="AD">Anno Domini (AD)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm font-medium text-slate-700">
          Date ({formData.dateFormat})
        </Label>
        <Input
          id="date"
          type={formData.dateFormat === 'AD' ? 'date' : 'text'}
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          placeholder={formData.dateFormat === 'BS' ? 'YYYY-MM-DD (BS)' : ''}
          className={`${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} transition-colors`}
          max={formData.dateFormat === 'AD' ? new Date().toISOString().split('T')[0] : undefined}
        />
        {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type" className="text-sm font-medium text-slate-700">
          Type
        </Label>
        <Select
          value={formData.type}
          onValueChange={(value: 'income' | 'expense') => 
            setFormData(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger className="border-slate-200 focus:ring-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income" className="text-green-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Income
              </div>
            </SelectItem>
            <SelectItem value="expense" className="text-red-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                Expense
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source" className="text-sm font-medium text-slate-700">
          {formData.type === 'income' ? 'Income Source' : 'Expense Item'}
        </Label>
        <Input
          id="source"
          type="text"
          value={formData.source}
          onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
          placeholder={formData.type === 'income' ? 'e.g., Salary, Freelance' : 'e.g., Groceries, Rent'}
          className={`${errors.source ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} transition-colors`}
        />
        {errors.source && <p className="text-sm text-red-600">{errors.source}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-sm font-medium text-slate-700">
          Amount (रू)
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          placeholder="0.00"
          className={`${errors.amount ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} transition-colors`}
        />
        {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className={`flex-1 gap-2 ${
            formData.type === 'income' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-all duration-200`}
        >
          {initialData ? <Save className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
          {initialData ? 'Update Transaction' : 'Add Transaction'}
        </Button>
        
        {initialData && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="gap-2 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}