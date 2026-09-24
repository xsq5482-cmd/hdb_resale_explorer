import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronDown, ChevronUp, CheckCircle, MapPin, Building } from 'lucide-react';
import { TransactionRecord } from '../types';

interface TransactionsTableProps {
  records: TransactionRecord[];
  maxBudget: number | null;
  town: string;
  flatType: string;
  selectedRecordId?: string | number | null;
  onSelectRecord?: (record: TransactionRecord) => void;
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

  const filteredAndSortedRecords = useMemo(() => {
    let list = records;

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
  }, [records, searchTerm, sortField, sortOrder]);

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
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {filteredAndSortedRecords.length} records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Official registration records from HDB via data.gov.sg
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search street, block, model..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisibleCount(15);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Table Responsive Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 select-none">
            <tr>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('month')}
              >
                <div className="flex items-center gap-1">
                  Month
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Location (Block & Street)</th>
              <th className="py-3 px-4">Storey Range</th>
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
                    <span className="font-medium text-slate-800">
                      {r.remainingLeaseYears} yrs
                    </span>
                    <span className="text-[11px] text-slate-400 block font-normal">
                      Commenced {r.leaseCommenceDate}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                    ${r.pricePerSqm.toLocaleString()} / sqm
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-slate-900">
                      ${r.resalePrice.toLocaleString()}
                    </div>
                    {maxBudget !== null && (
                      <span
                        className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${
                          inBudget
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {inBudget ? 'Within Budget' : 'Over Budget'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination / Load more */}
      {displayedRecords.length < filteredAndSortedRecords.length && (
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 25)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors py-1.5 px-4 rounded-lg hover:bg-white border border-transparent hover:border-slate-200"
          >
            Show More Records ({filteredAndSortedRecords.length - displayedRecords.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
};
