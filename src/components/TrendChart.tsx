import React, { useState } from 'react';
import { TrendingUp, BarChart2, DollarSign, Layers } from 'lucide-react';
import { MonthlyTrend } from '../types';

interface TrendChartProps {
  data: MonthlyTrend[];
  town: string;
  flatType: string;
}

type ChartMetric = 'avgPrice' | 'medianPrice' | 'avgPsm';

export const TrendChart: React.FC<TrendChartProps> = ({ data, town, flatType }) => {
  const [metric, setMetric] = useState<ChartMetric>('avgPrice');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col items-center justify-center min-h-[300px] text-center">
        <TrendingUp className="w-10 h-10 text-slate-300 mb-2" />
        <p className="text-sm font-medium text-slate-600">No monthly trend data available</p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Try expanding your budget or adjusting your filters to see historical price movement.
        </p>
      </div>
    );
  }

  // Format month name (e.g. "2026-08" -> "Aug 2026")
  const formatMonthLabel = (m: string) => {
    if (!m || !m.includes('-')) return m;
    const [year, month] = m.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idx = parseInt(month, 10) - 1;
    return `${monthNames[idx] || month} ${year.slice(2)}`;
  };

  const getMetricValue = (item: MonthlyTrend) => {
    switch (metric) {
      case 'avgPrice':
        return item.avgPrice;
      case 'medianPrice':
        return item.medianPrice;
      case 'avgPsm':
        return item.avgPsm;
      default:
        return item.avgPrice;
    }
  };

  const metricLabel =
    metric === 'avgPrice'
      ? 'Average Resale Price'
      : metric === 'medianPrice'
      ? 'Median Resale Price'
      : 'Average Price / Sqm';

  const formatValue = (v: number) => {
    if (metric === 'avgPsm') return `$${Math.round(v).toLocaleString()} / sqm`;
    return `$${Math.round(v).toLocaleString()}`;
  };

  const values = data.map(getMetricValue);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);

  // Pad domain slightly for visual appeal
  const range = rawMax - rawMin || 10000;
  const yMin = Math.max(0, Math.floor((rawMin - range * 0.15) / 10000) * 10000);
  const yMax = Math.ceil((rawMax + range * 0.15) / 10000) * 10000;
  const ySpan = yMax - yMin || 1;

  // Chart dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const padding = { top: 20, right: 30, bottom: 45, left: 65 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Coordinate computation
  const points = data.map((d, i) => {
    const val = getMetricValue(d);
    const x =
      data.length > 1
        ? padding.left + (i / (data.length - 1)) * graphWidth
        : padding.left + graphWidth / 2;
    const y = padding.top + graphHeight - ((val - yMin) / ySpan) * graphHeight;
    return { x, y, data: d, val };
  });

  // Polyline string
  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Area fill path
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${
          padding.top + graphHeight
        } Z`
      : '';

  // Generate 4 horizontal guide lines
  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }).map((_, i) => {
    const value = yMin + (ySpan / gridSteps) * (gridSteps - i);
    const y = padding.top + (i / gridSteps) * graphHeight;
    return { y, value };
  });

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Monthly Price Trend
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
              {town} · {flatType}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated historical resale transactions by registration month
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="inline-flex rounded-lg bg-slate-100 p-1 self-start sm:self-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setMetric('avgPrice')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              metric === 'avgPrice'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Average Price
          </button>
          <button
            type="button"
            onClick={() => setMetric('medianPrice')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              metric === 'medianPrice'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Median Price
          </button>
          <button
            type="button"
            onClick={() => setMetric('avgPsm')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              metric === 'avgPsm'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Price / Sqm
          </button>
        </div>
      </div>

      {/* Metric Quick Stat Bar */}
      {activePoint && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 rounded-xl p-3 border border-slate-100">
          <div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {formatMonthLabel(activePoint.data.month)}
            </span>
            <div className="text-base sm:text-lg font-bold text-slate-900">
              {formatValue(activePoint.val)}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Volume
            </span>
            <div className="text-base sm:text-lg font-semibold text-slate-700">
              {activePoint.data.count} units
            </div>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Price Range
            </span>
            <div className="text-xs sm:text-sm font-medium text-slate-700 mt-1">
              ${(activePoint.data.minPrice / 1000).toFixed(0)}k – ${(activePoint.data.maxPrice / 1000).toFixed(0)}k
            </div>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Avg Floor Area
            </span>
            <div className="text-xs sm:text-sm font-medium text-slate-700 mt-1">
              {activePoint.data.avgFloorAreaSqm} sqm ({Math.round(activePoint.data.avgFloorAreaSqm * 10.7639)} sqft)
            </div>
          </div>
        </div>
      )}

      {/* Interactive Responsive SVG Chart */}
      <div className="mt-4 relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis Labels */}
          {gridLines.map((g, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={g.y}
                x2={svgWidth - padding.right}
                y2={g.y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={g.y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#64748b"
                fontWeight="500"
              >
                {metric === 'avgPsm'
                  ? `$${Math.round(g.value)}`
                  : `$${(g.value / 1000).toFixed(0)}k`}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          {areaPath && (
            <path d={areaPath} fill="url(#areaGradient)" />
          )}

          {/* Trend Polyline */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points and Hover Triggers */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={i}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Invisible hover hotspot */}
                <circle cx={p.x} cy={p.y} r="16" fill="transparent" />

                {/* Vertical hover line */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={padding.top}
                    x2={p.x}
                    y2={padding.top + graphHeight}
                    stroke="#818cf8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Outer halo */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? '7' : '4'}
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth={isHovered ? '3' : '2'}
                  className="transition-all duration-150"
                />

                {/* X Axis Month Label */}
                <text
                  x={p.x}
                  y={svgHeight - 14}
                  textAnchor="middle"
                  fontSize="11"
                  fill={isHovered ? '#1e293b' : '#64748b'}
                  fontWeight={isHovered ? '600' : '500'}
                >
                  {formatMonthLabel(p.data.month)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 text-right">
        <span className="text-[11px] text-slate-400">
          Showing {data.length} months of resale data · Hover points to view breakdown
        </span>
      </div>
    </div>
  );
};
