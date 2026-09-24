import React, { useEffect, useState } from 'react';
import { Building2, Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { HealthStatus } from '../types';

export const Header: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'checking',
    backend: 'ok',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkHealth = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth({
        status: 'unhealthy',
        backend: 'ok',
        upstream: {
          source: 'data.gov.sg',
          status: 503,
          reachable: false,
          reason: 'Network request to backend failed',
        },
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                HDB Resale Flat Price Explorer
              </h1>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Data.gov.sg Live
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Interactive price trends, affordability analytics, and lease breakdown for Singapore public housing
            </p>
          </div>
        </div>

        {/* Backend & Upstream Health Indicator */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              health.status === 'healthy'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : health.status === 'degraded'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : health.status === 'checking'
                ? 'bg-slate-100 text-slate-600 border-slate-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
            title={
              health.upstream
                ? `Upstream: data.gov.sg (HTTP ${health.upstream.status})${health.latencyMs ? ` · ${health.latencyMs}ms` : ''}`
                : 'Checking upstream connectivity...'
            }
          >
            {health.status === 'healthy' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : health.status === 'degraded' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            ) : health.status === 'checking' ? (
              <Activity className="w-3.5 h-3.5 text-slate-500 animate-pulse shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            )}

            <span className="whitespace-nowrap">
              {health.status === 'healthy'
                ? `data.gov.sg Connected ${health.latencyMs ? `(${health.latencyMs}ms)` : ''}`
                : health.status === 'degraded'
                ? 'Upstream Degraded'
                : health.status === 'checking'
                ? 'Verifying API...'
                : 'Service Offline'}
            </span>

            <button
              onClick={checkHealth}
              disabled={isRefreshing}
              className="ml-1 p-0.5 hover:bg-black/5 rounded-full transition-colors text-slate-500 hover:text-slate-800"
              title="Recheck data.gov.sg reachability"
              aria-label="Recheck API health"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
