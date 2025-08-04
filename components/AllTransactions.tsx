"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Edit, Trash2, Calendar, Eye, EyeOff } from 'lucide-react';
import { Transaction } from '@/app/page';
import { TransactionFilters, FilterOptions } from '@/components/TransactionFilters';
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
import { adToBs, bsToAd, formatNepaliDate, formatEnglishDate, formatNepaliCurrency } from '@/lib/nepali-date';

interface AllTransactionsProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function AllTransactions({ transactions, onEdit, onDelete }: AllTransactionsProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDateFormat, setShowDateFormat] = useState<'BS' | 'AD'>('BS');
  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: '',
    dateTo: '',
    type: 'all',
    amountFrom: '',
    amountTo: '',
    dateFormat: 'BS'
  });

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Convert transaction date to filter format for comparison
      const transactionDate = filters.dateFormat === 'BS' ? adToBs(transaction.date) : transaction.date;
      
      // Date range filter
      if (filters.dateFrom && transactionDate < filters.dateFrom) return false;
      if (filters.dateTo && transactionDate > filters.dateTo) return false;
      
      // Type filter
      if (filters.type !== 'all' && transaction.type !== filters.type) return false;
      
      // Amount range filter
      if (filters.amountFrom && transaction.amount < Number(filters.amountFrom)) return false;
      if (filters.amountTo && transaction.amount > Number(filters.amountTo)) return false;
      
      return true;
    });
  }, [transactions, filters]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.type !== 'all') count++;
    if (filters.amountFrom) count++;
    if (filters.amountTo) count++;
    return count;
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      type: 'all',
      amountFrom: '',
      amountTo: '',
      dateFormat: 'BS'
    });
  };

  const exportFilteredToCSV = () => {
    const headers = ['Date (BS)', 'Date (AD)', 'Type', 'Source/Item', 'Amount (NPR)'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        adToBs(t.date),
        t.date,
        t.type,
        `"${t.source}"`,
        t.amount.toString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filtered-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <TransactionFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Results Summary and Export */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-800">
              All Transactions
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Showing {filteredTransactions.length} of {transactions.length} transactions
              {activeFiltersCount > 0 && ` (${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied)`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDateFormat(showDateFormat === 'BS' ? 'AD' : 'BS')}
              className="gap-2"
            >
              {showDateFormat === 'BS' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Show {showDateFormat === 'BS' ? 'AD' : 'BS'}
            </Button>
            {filteredTransactions.length > 0 && (
              <Button
                onClick={exportFilteredToCSV}
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Export Filtered
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {activeFiltersCount > 0 ? 'No transactions match your filters' : 'No transactions found'}
              </h3>
              <p className="text-slate-500">
                {activeFiltersCount > 0 
                  ? 'Try adjusting your filter criteria to see more results.'
                  : 'Start by adding your first transaction.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTransactions.map((transaction) => (
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
                          {showDateFormat === 'BS' 
                            ? formatNepaliDate(adToBs(transaction.date))
                            : formatEnglishDate(transaction.date)
                          }
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

                      {/* Show both dates when different format is selected */}
                      <div className="text-xs text-slate-400 mt-1">
                        {showDateFormat === 'BS' 
                          ? `AD: ${formatEnglishDate(transaction.date)}`
                          : `BS: ${formatNepaliDate(adToBs(transaction.date))}`
                        }
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
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}