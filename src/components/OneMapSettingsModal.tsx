import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, AlertCircle, RefreshCw, ExternalLink, Check } from 'lucide-react';

interface OneMapSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenUpdated?: () => void;
}

export const OneMapSettingsModal: React.FC<OneMapSettingsModalProps> = ({
  isOpen,
  onClose,
  onTokenUpdated,
}) => {
  const [tab, setTab] = useState<'token' | 'mint'>('token');
  const [tokenInput, setTokenInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tokenStatus, setTokenStatus] = useState<{ hasToken: boolean; tokenExpiresAt: string | null } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTokenStatus();
    }
  }, [isOpen]);

  const fetchTokenStatus = async () => {
    try {
      const res = await fetch('/api/onemap?action=status');
      const data = await res.json();
      setTokenStatus(data);
    } catch {
      // ignore
    }
  };

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/onemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save token');

      setStatusMsg({ type: 'success', text: 'OneMap token saved successfully!' });
      setTokenInput('');
      fetchTokenStatus();
      onTokenUpdated?.();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Error configuring token' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) return;

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/onemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mint token');

      setStatusMsg({ type: 'success', text: 'Token generated successfully! Lasts for 3 days.' });
      setEmailInput('');
      setPasswordInput('');
      fetchTokenStatus();
      onTokenUpdated?.();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to mint token from OneMap' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">OneMap API Configuration</h3>
            <p className="text-xs text-slate-500">Configure token for OneMap routing & reverse geocoding</p>
          </div>
        </div>

        {/* Current Status Badge */}
        <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${tokenStatus?.hasToken ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>
              Status:{' '}
              <strong className={tokenStatus?.hasToken ? 'text-emerald-700' : 'text-slate-600'}>
                {tokenStatus?.hasToken ? 'Token Active' : 'No Token (Free Search & Tiles Active)'}
              </strong>
            </span>
          </div>
          {tokenStatus?.tokenExpiresAt && (
            <span className="text-[11px] text-slate-500">
              Exp: {new Date(tokenStatus.tokenExpiresAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-slate-100 p-1 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setTab('token'); setStatusMsg(null); }}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              tab === 'token' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Direct Token
          </button>
          <button
            type="button"
            onClick={() => { setTab('mint'); setStatusMsg(null); }}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              tab === 'mint' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mint via Login (3 Days)
          </button>
        </div>

        {statusMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {tab === 'token' ? (
          <form onSubmit={handleSaveToken} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                OneMap API Token
              </label>
              <textarea
                rows={3}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste Bearer access_token from OneMap..."
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !tokenInput.trim()}
              className="w-full py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Save Token'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMintToken} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                OneMap Registered Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                OneMap Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400">
              OneMap tokens generated via <code>/api/auth/post/getToken</code> remain valid for 3 days and are cached securely on the server.
            </p>
            <button
              type="submit"
              disabled={isLoading || !emailInput.trim() || !passwordInput.trim()}
              className="w-full py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Generate Token'}
            </button>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Need an account?</span>
          <a
            href="https://www.onemap.gov.sg/apidocs/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
          >
            OneMap Developer Portal <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
