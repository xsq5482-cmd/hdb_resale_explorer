import React from 'react';
import { DollarSign, Layers, Maximize2, Clock, CheckCircle2 } from 'lucide-react';
import { MarketSummary, BudgetAnalysis } from '../types';

interface SummaryCardsProps {
  summary: MarketSummary;
  budgetAnalysis: BudgetAnalysis;
  town: string;
  flatType: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  budgetAnalysis,
  town,
  flatType,
}) => {
  const {
    totalTransactions,
    totalMarketTransactions,
    filteredAvgPrice,
    filteredMedianPrice,
    minPrice,
    maxPrice,
    avgFloorAreaSqm,
    avgRemainingLeaseYears,
  } = summary;

  const hasBudget = budgetAnalysis.maxBudget !== null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Average Price */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {hasBudget ? 'Avg Price (In Budget)' : 'Average Price'}
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {totalTransactions > 0 ? `$${filteredAvgPrice.toLocaleString()}` : '$0'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {totalTransactions > 0
              ? `Range: $${(minPrice / 1000).toFixed(0)}k – $${(maxPrice / 1000).toFixed(0)}k`
              : 'No matching records'}
          </p>
        </div>
      </div>

      {/* 2. Median Price */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Median Price
          </span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {totalTransactions > 0 ? `$${filteredMedianPrice.toLocaleString()}` : '$0'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {hasBudget && summary.marketMedianPrice > 0
              ? `Overall market median: $${summary.marketMedianPrice.toLocaleString()}`
              : `Based on ${totalTransactions} recent records`}
          </p>
        </div>
      </div>

      {/* 3. Average Floor Area */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Avg Floor Area
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {avgFloorAreaSqm > 0 ? `${avgFloorAreaSqm} sqm` : '0 sqm'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {avgFloorAreaSqm > 0
              ? `~${Math.round(avgFloorAreaSqm * 10.7639)} sqft floor area`
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* 4. Average Remaining Lease */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Remaining Lease
          </span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {avgRemainingLeaseYears > 0 ? `${avgRemainingLeaseYears} yrs` : '0 yrs'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {totalTransactions} units available in {town}
          </p>
        </div>
      </div>
    </div>
  );
};
