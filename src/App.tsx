import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { SummaryCards } from './components/SummaryCards';
import { TrendChart } from './components/TrendChart';
import { BudgetAffordabilityCard } from './components/BudgetAffordabilityCard';
import { MapNavigator } from './components/MapNavigator';
import { TransactionsTable } from './components/TransactionsTable';
import { Footer } from './components/Footer';
import { FlatsApiResponse, TransactionRecord } from './types';
import { AlertCircle, RefreshCw, SearchX, MapPin, BarChart3 } from 'lucide-react';

export default function App() {
  const [town, setTown] = useState<string>('TAMPINES');
  const [flatType, setFlatType] = useState<string>('4 ROOM');
  const [budget, setBudget] = useState<number | null>(650000);
  const [data, setData] = useState<FlatsApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | number | null>(null);

  // Fetch data from backend API endpoint (/api/flats)
  const fetchFlatsData = useCallback(async (targetTown: string, targetFlatType: string, targetBudget: number | null) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        town: targetTown,
        flat_type: targetFlatType,
      });

      if (targetBudget !== null && targetBudget > 0) {
        params.set('maxBudget', String(targetBudget));
      }

      const res = await fetch(`/api/flats?${params.toString()}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const json: FlatsApiResponse = await res.json();
      setData(json);
      // Reset selected record if no longer in new records
      setSelectedRecordId(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load HDB resale flat data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and on town / flatType change
  useEffect(() => {
    fetchFlatsData(town, flatType, budget);
  }, [town, flatType, budget, fetchFlatsData]);

  const handleReset = () => {
    setTown('TAMPINES');
    setFlatType('4 ROOM');
    setBudget(null);
  };

  const handleSelectRecord = (record: TransactionRecord | null) => {
    setSelectedRecordId(record ? record.id : null);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans antialiased text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Search & Filter Panel */}
        <FilterPanel
          town={town}
          setTown={setTown}
          flatType={flatType}
          setFlatType={setFlatType}
          budget={budget}
          setBudget={setBudget}
          isLoading={isLoading}
          onReset={handleReset}
        />

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-800">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold">Unable to fetch resale data</h3>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => fetchFlatsData(town, flatType, budget)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 hover:bg-rose-100/60 transition-colors shrink-0 shadow-2xs"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !data && (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-28 bg-white rounded-2xl border border-slate-200" />
              ))}
            </div>
            <div className="h-96 bg-white rounded-2xl border border-slate-200" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-white rounded-2xl border border-slate-200" />
              <div className="h-80 bg-white rounded-2xl border border-slate-200" />
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {data && (
          <div className={`space-y-6 transition-opacity duration-200 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
            {/* Plain sentence summary when no flats match filters */}
            {data.noMatchMessage ? (
              <div className="bg-white rounded-2xl p-8 border border-amber-200 bg-amber-50/40 text-center shadow-xs flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-3">
                  <SearchX className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  No Matching Flats Found
                </h3>
                <p className="text-sm text-slate-700 mt-2 max-w-xl mx-auto leading-relaxed">
                  {data.noMatchMessage}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => setBudget(null)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 transition-colors shadow-2xs"
                  >
                    Clear Budget Filter
                  </button>
                  <button
                    type="button"
                    onClick={() => setTown('TAMPINES')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs"
                  >
                    View Tampines Listings
                  </button>
                </div>
              </div>
            ) : null}

            {/* Top Level Summary KPI Cards */}
            <SummaryCards
              summary={data.summary}
              budgetAnalysis={data.budgetAnalysis}
              town={town}
              flatType={flatType}
            />

            {/* SLA OneMap Interactive Geospatial Navigator */}
            <MapNavigator
              records={data.records}
              town={town}
              flatType={flatType}
              maxBudget={budget}
              selectedRecordId={selectedRecordId}
              onSelectRecord={handleSelectRecord}
            />

            {/* Middle Grid: Trend Chart & Budget Affordability Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Monthly Trend Chart */}
              <div className="lg:col-span-7">
                <TrendChart
                  data={data.monthlyTrends}
                  town={town}
                  flatType={flatType}
                />
              </div>

              {/* What Does My Budget Buy Section */}
              <div className="lg:col-span-5">
                <BudgetAffordabilityCard
                  analysis={data.budgetAnalysis}
                  town={town}
                  flatType={flatType}
                />
              </div>
            </div>

            {/* Bottom: Filtered Recent Resale Transactions Table */}
            {data.records.length > 0 && (
              <TransactionsTable
                records={data.records}
                maxBudget={budget}
                town={town}
                flatType={flatType}
                selectedRecordId={selectedRecordId}
                onSelectRecord={handleSelectRecord}
              />
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
