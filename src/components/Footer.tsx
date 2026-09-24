import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white/80 py-8 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-4xl mx-auto space-y-3">
        <p className="text-xs text-slate-500 leading-relaxed">
          Contains information from Singapore HDB Resale Flat Prices accessed on 24 September 2026 from data.gov.sg, which is made available under the terms of the Singapore Open Data Licence version 1.0{' '}
          <a
            href="https://data.gov.sg/open-data-licence"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 transition-colors font-medium"
          >
            https://data.gov.sg/open-data-licence
          </a>
          . This is an SMU course project and is not affiliated with or endorsed by the Housing & Development Board.
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span>Singapore Management University Course Project</span>
          <span>·</span>
          <span>Dataset: d_8b84c4ee58e3cfc0ece0d773c8ca6abc</span>
        </div>
      </div>
    </footer>
  );
};
