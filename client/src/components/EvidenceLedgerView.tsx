import React, { useState } from 'react';
import { BookOpen, Download, Search, Hash, ExternalLink, ShieldCheck } from 'lucide-react';
import { WebPilotTask } from '../types';
import { api } from '../services/api';

interface EvidenceLedgerViewProps {
  task: WebPilotTask;
}

export const EvidenceLedgerView: React.FC<EvidenceLedgerViewProps> = ({ task }) => {
  const [filter, setFilter] = useState('');
  const ledger = task.ledger || [];

  const filtered = ledger.filter(
    (entry) =>
      entry.action.toLowerCase().includes(filter.toLowerCase()) ||
      (entry.companyName && entry.companyName.toLowerCase().includes(filter.toLowerCase())) ||
      entry.sourceUrl.toLowerCase().includes(filter.toLowerCase()) ||
      entry.capturedText.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#0F1626] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Immutable Evidence Ledger</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographically hashed append-only audit trail of every browser interaction, recovery attempt, and human decision.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={api.getDownloadEvidenceUrl(task.id)}
            download
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Ledger JSON</span>
          </a>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0F1626] border border-slate-800 text-xs">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter ledger entries by company, action, URL, or captured evidence text..."
          className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-500 focus:outline-none font-mono"
        />
        <span className="text-[11px] font-mono text-slate-400">
          Showing {filtered.length} of {ledger.length} entries
        </span>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0B0F19] overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 font-mono text-[11px] text-slate-400">
                <th className="p-3 font-semibold border-r border-slate-800">Hash Checksum</th>
                <th className="p-3 font-semibold border-r border-slate-800">Timestamp</th>
                <th className="p-3 font-semibold border-r border-slate-800">Action / Phase</th>
                <th className="p-3 font-semibold border-r border-slate-800">Company</th>
                <th className="p-3 font-semibold border-r border-slate-800 min-w-[180px]">Source URL</th>
                <th className="p-3 font-semibold border-r border-slate-800 min-w-[240px]">Captured Grounding Snippet</th>
                <th className="p-3 font-semibold border-r border-slate-800">Status</th>
                <th className="p-3 font-semibold">Human Decision / Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500 font-mono">
                    No ledger entries match current filter.
                  </td>
                </tr>
              ) : (
                filtered
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-mono text-blue-400 text-[11px] border-r border-slate-800 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-900/60">
                          {entry.hash}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[11px] border-r border-slate-800 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3 font-semibold text-white border-r border-slate-800">
                        {entry.action}
                      </td>
                      <td className="p-3 font-medium text-slate-300 border-r border-slate-800">
                        {entry.companyName || '—'}
                      </td>
                      <td className="p-3 border-r border-slate-800 font-mono text-[11px] truncate max-w-[200px]">
                        <a
                          href={entry.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <span className="truncate">{entry.sourceUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="p-3 text-slate-300 italic font-mono text-[11px] border-r border-slate-800">
                        "{entry.capturedText}"
                      </td>
                      <td className="p-3 border-r border-slate-800 whitespace-nowrap font-mono text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                          {entry.status}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-amber-300/90 font-mono">
                        {entry.humanDecisions || 'Autonomous pass (no human intervention required)'}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
