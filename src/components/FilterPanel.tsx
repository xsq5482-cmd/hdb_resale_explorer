import React from 'react';
import { MapPin, Home, DollarSign, SlidersHorizontal, RotateCcw } from 'lucide-react';

export const HDB_TOWNS = [
  'ANG MO KIO',
  'BEDOK',
  'BISHAN',
  'BUKIT BATOK',
  'BUKIT MERAH',
  'BUKIT PANJANG',
  'BUKIT TIMAH',
  'CENTRAL AREA',
  'CHOA CHU KANG',
  'CLEMENTI',
  'GEYLANG',
  'HOUGANG',
  'JURONG EAST',
  'JURONG WEST',
  'KALLANG/WHAMPOA',
  'MARINE PARADE',
  'PASIR RIS',
  'PUNGGOL',
  'QUEENSTOWN',
  'SEMBAWANG',
  'SENGKANG',
  'SERANGOON',
  'TAMPINES',
  'TOA PAYOH',
  'WOODLANDS',
  'YISHUN',
];

export const FLAT_TYPES = [
  '2 ROOM',
  '3 ROOM',
  '4 ROOM',
  '5 ROOM',
  'EXECUTIVE',
  'MULTI-GENERATION',
  '1 ROOM',
];

const POPULAR_TOWNS = ['TAMPINES', 'BEDOK', 'JURONG WEST', 'BISHAN', 'PUNGGOL', 'WOODLANDS', 'YISHUN'];
const BUDGET_PRESETS = [
  { label: '$450k', value: 450000 },
  { label: '$550k', value: 550000 },
  { label: '$650k', value: 650000 },
  { label: '$750k', value: 750000 },
  { label: '$900k', value: 900000 },
  { label: 'No Limit', value: null },
];

interface FilterPanelProps {
  town: string;
  setTown: (town: string) => void;
  flatType: string;
  setFlatType: (flatType: string) => void;
  budget: number | null;
  setBudget: (budget: number | null) => void;
  isLoading: boolean;
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  town,
  setTown,
  flatType,
  setFlatType,
  budget,
  setBudget,
  isLoading,
  onReset,
}) => {
  const currentSliderValue = budget !== null ? budget : 1500000;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val >= 1500000) {
      setBudget(null);
    } else {
      setBudget(val);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setBudget(null);
      return;
    }
    const val = parseInt(raw, 10);
    setBudget(val);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Explorer Controls & Budget Filter
          </h2>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
          title="Reset to default filters (Tampines, 4 Room)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Town Selector */}
        <div>
          <label htmlFor="town-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              Town / Estate
            </span>
          </label>
          <div className="relative">
            <select
              id="town-select"
              value={town}
              onChange={(e) => setTown(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs font-medium cursor-pointer"
            >
              {HDB_TOWNS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Town Chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {POPULAR_TOWNS.map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => setTown(pt)}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                  town === pt
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pt}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Flat Type Selector */}
        <div>
          <label htmlFor="flat-type-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-indigo-500" />
              Flat Type
            </span>
          </label>
          <div className="relative">
            <select
              id="flat-type-select"
              value={flatType}
              onChange={(e) => setFlatType(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs font-medium cursor-pointer"
            >
              {FLAT_TYPES.map((ft) => (
                <option key={ft} value={ft}>
                  {ft}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Flat Type Chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {['3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE'].map((ft) => (
              <button
                key={ft}
                type="button"
                onClick={() => setFlatType(ft)}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                  flatType === ft
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ft}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Max Budget Slider & Direct Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="budget-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <span className="inline-flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Max Budget (SGD)
              </span>
            </label>
            <span className="text-xs font-bold text-emerald-700">
              {budget !== null ? `$${budget.toLocaleString()}` : 'No Budget Limit'}
            </span>
          </div>

          {/* Budget direct numeric input */}
          <div className="relative mb-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-medium">
              $
            </span>
            <input
              id="budget-input"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 650000 or leave empty for all"
              value={budget !== null ? budget.toLocaleString() : ''}
              onChange={handleInputChange}
              className="w-full pl-7 pr-3 py-1.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium"
            />
          </div>

          {/* Budget Slider */}
          <input
            type="range"
            min={300000}
            max={1500000}
            step={10000}
            value={currentSliderValue}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-hidden"
          />

          {/* Budget Preset Chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {BUDGET_PRESETS.map((preset) => {
              const isSelected =
                (preset.value === null && budget === null) ||
                (preset.value !== null && budget === preset.value);
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setBudget(preset.value)}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
