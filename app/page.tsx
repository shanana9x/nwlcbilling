"use client";

import { useState, useEffect } from 'react';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { AllTransactions } from '@/components/AllTransactions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, DollarSign, TrendingUp, TrendingDown, Activity, List, Filter } from 'lucide-react';
import { formatNepaliCurrency } from '@/lib/nepali-date';

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  source: string;
  amount: number;
  createdAt: string;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('billing-transactions');
    if (stored) {
      try {
        setTransactions(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    }
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('billing-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updatedTransaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === id
          ? { ...updatedTransaction, id, createdAt: t.createdAt }
          : t
      )
    );
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Source/Item', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
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
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Calculate summary statistics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Financial Dashboard</h1>
          <p className="text-lg text-slate-600">Track your income and expenses with ease</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatNepaliCurrency(totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatNepaliCurrency(totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Net Balance</CardTitle>
              <DollarSign className={`h-4 w-4 ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatNepaliCurrency(netBalance)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Transactions</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {transactions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <List className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="all-transactions" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Filter className="h-4 w-4" />
              All Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Transaction Form */}
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-800">
                      {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                    </CardTitle>
                    <CardDescription>
                      {editingTransaction ? 'Update transaction details' : 'Record a new income or expense'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TransactionForm
                      onSubmit={editingTransaction ? 
                        (transaction) => updateTransaction(editingTransaction.id, transaction) : 
                        addTransaction
                      }
                      initialData={editingTransaction}
                      onCancel={() => setEditingTransaction(null)}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transaction List */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-800">Recent Transactions</CardTitle>
                      <CardDescription>
                        View and manage your latest financial transactions
                      </CardDescription>
                    </div>
                    {transactions.length > 0 && (
                      <Button
                        onClick={exportToCSV}
                        variant="outline"
                        size="sm"
                        className="gap-2 hover:bg-slate-50"
                      >
                        <Download className="h-4 w-4" />
                        Export All
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <TransactionList
                      transactions={transactions.slice(0, 10)} // Show only recent 10
                      onEdit={setEditingTransaction}
                      onDelete={deleteTransaction}
                    />
                    {transactions.length > 10 && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('all-transactions')}
                          className="gap-2"
                        >
                          <List className="h-4 w-4" />
                          View All {transactions.length} Transactions
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="all-transactions">
            <AllTransactions
              transactions={transactions}
              onEdit={setEditingTransaction}
              onDelete={deleteTransaction}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}