import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronDown, ChevronUp, CheckCircle, MapPin, Building, Eye, Globe } from 'lucide-react';
import { TransactionRecord } from '../types';

interface TransactionsTableProps {
  records: TransactionRecord[];
  maxBudget: number | null;
  town: string;
  flatType: string;
  selectedRecordId?: string | number | null;
  onSelectRecord?: (record: TransactionRecord) => void;
  filterToMapBounds?: boolean;
  onToggleFilterToMapBounds?: (val: boolean) => void;
  visibleRecordIds?: Set<string | number> | null;
}

type SortField = 'resalePrice' | 'month' | 'floorAreaSqm' | 'remainingLeaseYears' | 'pricePerSqm';
type SortOrder = 'asc' | 'desc';

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  records,
  maxBudget,
  town,
  flatType,
  selectedRecordId,
  onSelectRecord,
  filterToMapBounds = true,
  onToggleFilterToMapBounds,
  visibleRecordIds,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('month');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [visibleCount, setVisibleCount] = useState(15);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const isMapFiltered = Boolean(filterToMapBounds && visibleRecordIds && visibleRecordIds.size > 0);

  const filteredAndSortedRecords = useMemo(() => {
    let list = records;

    // Filter by visible map bounds if active
    if (isMapFiltered && visibleRecordIds) {
      list = list.filter((r) => visibleRecordIds.has(r.id));
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.streetName.toLowerCase().includes(q) ||
          r.block.toLowerCase().includes(q) ||
          r.flatModel.toLowerCase().includes(q) ||
          r.storeyRange.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [records, searchTerm, sortField, sortOrder, isMapFiltered, visibleRecordIds]);

  const displayedRecords = filteredAndSortedRecords.slice(0, visibleCount);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Recent Resale Transactions
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
              {filteredAndSortedRecords.length} {isMapFiltered ? 'in visible map area' : `in ${town}`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isMapFiltered
              ? `Following along map area: showing properties located in current view. Pan map to explore other areas.`
              : `Showing official historical resale records in ${town} from data.gov.sg.`}
          </p>
        </div>

        {/* Search Input & Map Filter Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {onToggleFilterToMapBounds && (
            <button
              type="button"
              onClick={() => onToggleFilterToMapBounds(!filterToMapBounds)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                filterToMapBounds
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {filterToMapBounds ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Map Area Only ({visibleRecordIds ? visibleRecordIds.size : records.length})</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>All in {town}</span>
                </>
              )}
            </button>
          )}

          <div className="relative">
            <input
              type="text"
              placeholder="Search street, blk, model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-52"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('month')}
              >
                <div className="flex items-center gap-1">
                  Registration Month
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">
                Location & Model
              </th>
              <th className="py-3 px-4">
                Storey Range
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('floorAreaSqm')}
              >
                <div className="flex items-center gap-1">
                  Floor Area
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('remainingLeaseYears')}
              >
                <div className="flex items-center gap-1">
                  Remaining Lease
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('pricePerSqm')}
              >
                <div className="flex items-center gap-1">
                  Price / Sqm
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('resalePrice')}
              >
                <div className="flex items-center justify-end gap-1">
                  Resale Price
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {displayedRecords.map((r) => {
              const inBudget = maxBudget === null || r.resalePrice <= maxBudget;
              const isSelected = selectedRecordId === r.id;
              return (
                <tr
                  key={r.id}
                  onClick={() => onSelectRecord?.(r)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/90 font-medium'
                      : inBudget
                      ? 'hover:bg-slate-50/80'
                      : 'opacity-60 bg-slate-50/30 hover:bg-slate-50/60'
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                    {r.month}
                  </td>
                  <td className="py-3 px-4 text-slate-900 font-medium">
                    <div>
                      {r.block ? `Blk ${r.block} ` : ''}
                      {r.streetName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      {r.flatModel} · {r.town}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                    {r.storeyRange}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-900">{r.floorAreaSqm} sqm</span>
                    <span className="text-[11px] text-slate-400 block font-normal">
                      ~{r.floorAreaSqft} sqft
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-slate-800 font-medium">
                      {r.remainingLeaseYears} yrs
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      {r.remainingLease}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                    ${r.pricePerSqm.toLocaleString()} / sqm
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-900">
                      ${r.resalePrice.toLocaleString()}
                    </span>
                    {maxBudget !== null && (
                      <span className="block text-[10px]">
                        {inBudget ? (
                          <span className="text-emerald-700 font-medium inline-flex items-center gap-0.5 justify-end">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Within budget
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            +${(r.resalePrice - maxBudget).toLocaleString()}
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {displayedRecords.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  <div className="max-w-md mx-auto space-y-2">
                    <MapPin className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="font-medium text-slate-700">
                      No transactions in current map view
                    </p>
                    <p className="text-xs text-slate-400">
                      Try panning the map or zooming out, or switch to view all transactions in {town}.
                    </p>
                    {onToggleFilterToMapBounds && isMapFiltered && (
                      <button
                        type="button"
                        onClick={() => onToggleFilterToMapBounds(false)}
                        className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        Show All Transactions in {town} ({records.length})
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination / Load More Footer */}
      {filteredAndSortedRecords.length > visibleCount && (
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {displayedRecords.length} of {filteredAndSortedRecords.length} transactions
          </span>
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 15)}
            className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Show more (+15)
          </button>
        </div>
      )}
    </div>
  );
};
