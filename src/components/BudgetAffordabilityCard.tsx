import React from 'react';
import { Wallet, Maximize2, Clock, CheckCircle2, AlertCircle, PieChart, ShieldCheck } from 'lucide-react';
import { BudgetAnalysis } from '../types';

interface BudgetAffordabilityCardProps {
  analysis: BudgetAnalysis;
  town: string;
  flatType: string;
}

export const BudgetAffordabilityCard: React.FC<BudgetAffordabilityCardProps> = ({
  analysis,
  town,
  flatType,
}) => {
  const {
    maxBudget,
    unitsInBudget,
    totalUnitsSampled,
    percentageInBudget,
    avgFloorAreaSqm,
    medianFloorAreaSqm,
    avgRemainingLeaseYears,
    leaseBreakdown,
    areaBreakdown,
  } = analysis;

  const hasBudget = maxBudget !== null && maxBudget > 0;
  const hasMatches = unitsInBudget > 0;

  // Colors for lease breakdown brackets
  const bracketColors = [
    { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { bar: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    { bar: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              What Does My Budget Buy?
            </h2>
            <p className="text-xs text-slate-500">
              Purchasing power analysis combining floor area and remaining lease
            </p>
          </div>
        </div>

        {hasBudget ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Budget: ${maxBudget.toLocaleString()}
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium self-start sm:self-auto">
            Viewing All Sampled Records
          </div>
        )}
      </div>

      {/* Main Budget Headline Banner */}
      {hasMatches ? (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-emerald-800 uppercase tracking-wider">
                Affordability Rate
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                {hasBudget ? (
                  <>
                    <span className="text-emerald-700">{percentageInBudget}%</span> of recent {flatType}s in {town}
                  </>
                ) : (
                  <>100% of sampled {flatType}s in {town}</>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {unitsInBudget} out of {totalUnitsSampled} recent transactions meet your criteria.
              </p>
            </div>

            {/* Quick Average Pills */}
            <div className="flex items-center gap-3">
              <div className="bg-white/90 px-3 py-2 rounded-xl border border-slate-200 text-center shadow-xs min-w-[110px]">
                <div className="text-[11px] text-slate-500 font-medium">Avg Floor Area</div>
                <div className="text-base font-bold text-slate-900">
                  {avgFloorAreaSqm} <span className="text-xs font-normal text-slate-500">sqm</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  ~{Math.round(avgFloorAreaSqm * 10.7639)} sqft
                </div>
              </div>

              <div className="bg-white/90 px-3 py-2 rounded-xl border border-slate-200 text-center shadow-xs min-w-[110px]">
                <div className="text-[11px] text-slate-500 font-medium">Avg Lease Left</div>
                <div className="text-base font-bold text-slate-900">
                  {avgRemainingLeaseYears} <span className="text-xs font-normal text-slate-500">yrs</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {avgRemainingLeaseYears >= 80 ? 'Recent MOP' : avgRemainingLeaseYears >= 65 ? 'Good Lease' : 'Aging Lease'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-amber-900">
              No flats currently within this budget
            </div>
            <p className="text-xs text-amber-700 mt-0.5">
              Consider raising the budget slider above or checking adjacent estates to view available unit sizes and lease lengths.
            </p>
          </div>
        </div>
      )}

      {/* Remaining Lease Breakdown Section */}
      {hasMatches && leaseBreakdown && leaseBreakdown.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Remaining Lease Breakdown
              </h3>
            </div>
            <span className="text-xs text-slate-400">Distribution by Lease Age</span>
          </div>

          {/* Visual Stacked Bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
            {leaseBreakdown.map((item, idx) => {
              if (item.count === 0) return null;
              const color = bracketColors[idx % bracketColors.length];
              return (
                <div
                  key={item.bracket}
                  style={{ width: `${item.percentage}%` }}
                  className={`${color.bar} transition-all duration-300`}
                  title={`${item.bracket}: ${item.count} units (${item.percentage}%)`}
                />
              );
            })}
          </div>

          {/* Lease Bracket Cards */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {leaseBreakdown.map((item, idx) => {
              const color = bracketColors[idx % bracketColors.length];
              return (
                <div
                  key={item.bracket}
                  className={`p-3 rounded-xl border transition-all ${
                    item.count > 0
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-slate-50/30 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">
                      {item.bracket}
                    </span>
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${color.bg} ${color.text} border ${color.border}`}>
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-600 flex justify-between">
                    <span>Units:</span>
                    <span className="font-semibold text-slate-900">{item.count}</span>
                  </div>

                  {item.count > 0 && (
                    <>
                      <div className="mt-1 text-xs text-slate-600 flex justify-between">
                        <span>Avg Price:</span>
                        <span className="font-semibold text-slate-900">
                          ${(item.avgPrice / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600 flex justify-between">
                        <span>Avg Area:</span>
                        <span className="font-semibold text-slate-900">
                          {item.avgAreaSqm} sqm
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floor Area Distribution Section */}
      {hasMatches && areaBreakdown && areaBreakdown.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Floor Area Size Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-400">Space for your budget</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {areaBreakdown.map((item) => (
              <div
                key={item.bracket}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    {item.bracket}
                  </div>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    {item.count}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      units ({item.percentage}%)
                    </span>
                  </div>
                </div>

                {item.count > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600 flex justify-between items-center">
                    <span>Average Price:</span>
                    <span className="font-semibold text-slate-900">
                      ${(item.avgPrice / 1000).toFixed(0)}k
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practical Buyer Takeaway */}
      {hasMatches && (
        <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900">Buyer Takeaway: </span>
          {hasBudget ? (
            <>
              With a max budget of <span className="font-medium">${maxBudget.toLocaleString()}</span>, you have access to{' '}
              <span className="font-medium">{unitsInBudget} units</span> in <span className="font-medium">{town}</span> averaging{' '}
              <span className="font-medium">{avgFloorAreaSqm} sqm</span> with{' '}
              <span className="font-medium">{avgRemainingLeaseYears} years</span> remaining on their lease.
            </>
          ) : (
            <>
              Recent <span className="font-medium">{flatType}</span> transactions in{' '}
              <span className="font-medium">{town}</span> average{' '}
              <span className="font-medium">{avgFloorAreaSqm} sqm</span> (~{Math.round(avgFloorAreaSqm * 10.7639)} sqft) with{' '}
              <span className="font-medium">{avgRemainingLeaseYears} years</span> of remaining lease. Use the budget slider above to simulate your target purchasing range.
            </>
          )}
        </div>
      )}
    </div>
  );
};
