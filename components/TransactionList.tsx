"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { Transaction } from '@/app/page';
import { adToBs, formatNepaliDate, formatEnglishDate, formatNepaliCurrency } from '@/lib/nepali-date';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return formatNepaliDate(adToBs(dateString));
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteId(null);
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
          <DollarSign className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No transactions yet</h3>
        <p className="text-slate-500">Start by adding your first income or expense transaction.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transactions.map((transaction) => (
          <Card
            key={transaction.id}
            className={`p-4 border-l-4 transition-all duration-200 hover:shadow-md ${
              transaction.type === 'income'
                ? 'border-l-green-500 bg-green-50/50 hover:bg-green-50'
                : 'border-l-red-500 bg-red-50/50 hover:bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    variant={transaction.type === 'income' ? 'default' : 'destructive'}
                    className={`${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    } border-0`}
                  >
                    {transaction.type === 'income' ? '+ Income' : '- Expense'}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(transaction.date)}
                  </div>
                </div>
                
                <h4 className="font-medium text-slate-900 truncate mb-1">
                  {transaction.source}
                </h4>
                
                <div className={`text-xl font-bold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatNepaliCurrency(transaction.amount)}
                </div>
                
                {/* Show AD date as secondary info */}
                <div className="text-xs text-slate-400 mt-1">
                  AD: {formatEnglishDate(transaction.date)}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(transaction)}
                  className="h-8 w-8 p-0 hover:bg-slate-200"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(transaction.id)}
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}