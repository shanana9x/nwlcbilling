"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Calendar, DollarSign } from 'lucide-react';
import { adToBs, bsToAd, getCurrentBsDate } from '@/lib/nepali-date';

export interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  type: 'all' | 'income' | 'expense';
  amountFrom: string;
  amountTo: string;
  dateFormat: 'BS' | 'AD';
}

interface TransactionFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

export function TransactionFilters({ 
  filters, 
  onFiltersChange, 
  onReset, 
  activeFiltersCount 
}: TransactionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    let newFilters = { ...filters, [key]: value };
    
    // Convert dates when format changes
    if (key === 'dateFormat') {
      if (value === 'BS' && filters.dateFormat === 'AD') {
        newFilters.dateFrom = filters.dateFrom ? adToBs(filters.dateFrom) : '';
        newFilters.dateTo = filters.dateTo ? adToBs(filters.dateTo) : '';
      } else if (value === 'AD' && filters.dateFormat === 'BS') {
        newFilters.dateFrom = filters.dateFrom ? bsToAd(filters.dateFrom) : '';
        newFilters.dateTo = filters.dateTo ? bsToAd(filters.dateTo) : '';
      }
    }
    
    onFiltersChange(newFilters);
  };

  const getDateInputType = () => {
    return filters.dateFormat === 'AD' ? 'date' : 'text';
  };

  const getDatePlaceholder = () => {
    return filters.dateFormat === 'BS' ? 'YYYY-MM-DD (BS)' : '';
  };

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-lg font-semibold text-slate-800">
              Filters
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="gap-1 text-slate-600 hover:text-slate-800"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-600 hover:text-slate-800"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Date Format Toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Date Format</Label>
            <Select
              value={filters.dateFormat}
              onValueChange={(value: 'BS' | 'AD') => handleFilterChange('dateFormat', value)}
            >
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BS">Bikram Sambat (BS)</SelectItem>
                <SelectItem value="AD">Anno Domini (AD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                From Date ({filters.dateFormat})
              </Label>
              <Input
                type={getDateInputType()}
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                placeholder={getDatePlaceholder()}
                className="border-slate-200 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                To Date ({filters.dateFormat})
              </Label>
              <Input
                type={getDateInputType()}
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                placeholder={getDatePlaceholder()}
                className="border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Transaction Type</Label>
            <Select
              value={filters.type}
              onValueChange={(value: 'all' | 'income' | 'expense') => handleFilterChange('type', value)}
            >
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="income" className="text-green-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Income Only
                  </div>
                </SelectItem>
                <SelectItem value="expense" className="text-red-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    Expense Only
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Min Amount (रू)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={filters.amountFrom}
                onChange={(e) => handleFilterChange('amountFrom', e.target.value)}
                placeholder="0.00"
                className="border-slate-200 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Max Amount (रू)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={filters.amountTo}
                onChange={(e) => handleFilterChange('amountTo', e.target.value)}
                placeholder="0.00"
                className="border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}