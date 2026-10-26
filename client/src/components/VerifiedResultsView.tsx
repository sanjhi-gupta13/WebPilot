import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Hash,
} from 'lucide-react';
import { WebPilotTask } from '../types';
import { api } from '../services/api';

interface VerifiedResultsViewProps {
  task: WebPilotTask;
}

export const VerifiedResultsView: React.FC<VerifiedResultsViewProps> = ({ task }) => {
  const [isReverifying, setIsReverifying] = useState(false);
  const result = task.verificationResult;
  const companies = task.companies || [];

  const handleReverify = async () => {
    setIsReverifying(true);
    try {
      await api.reVerifyTask(task.id);
    } catch (e: any) {
      alert(`Verification error: ${e.message}`);
    } finally {
      setIsReverifying(false);
    }
  };

  const isPassed = result?.overallStatus === 'PASSED';

  return (
    <div className="space-y-5">
      {/* Top Banner: Verification Result & Download */}
      <div
        className={`p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isPassed
            ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#0F1626] border-emerald-500/40'
            : 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-[#0F1626] border-rose-500/40'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`p-3 rounded-xl border shrink-0 ${
              isPassed
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400'
                : 'bg-rose-500/20 border-rose-400/40 text-rose-400'
            }`}
          >
            {isPassed ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {isPassed ? 'Independent Verification Passed' : 'Verification Pending or Failed'}
              </h2>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isPassed
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}
              >
                {result?.overallStatus || 'PENDING'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {result?.summary ||
                'Workbook will be generated with ExcelJS and independently verified against 6 integrity checkpoints.'}
            </p>

            {result?.ledgerChecksum && (
              <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <Hash className="w-3.5 h-3.5 text-blue-400" />
                <span>Ledger Proof Checksum:</span>
                <span className="text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {result.ledgerChecksum}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleReverify}
            disabled={isReverifying}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReverifying ? 'animate-spin' : ''}`} />
            <span>Re-Verify</span>
          </button>

          <a
            href={api.getDownloadExcelUrl(task.id)}
            download
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel (.xlsx)</span>
          </a>
        </div>
      </div>

      {/* 6-Point Independent Integrity Checklist Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
          Independent Verification Checklist (6 / 6 Checks)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {result?.checks?.map((check, idx) => {
            const passed = check.status === 'PASSED';
            const warning = check.status === 'WARNING';

            return (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-800 bg-[#0F1626] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-200">
                      {check.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                        passed
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : warning
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {check.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {check.details}
                  </p>
                </div>

                {check.evidenceReference && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-blue-400">
                    Ref: {check.evidenceReference}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Full 10-Column Excel Live Preview Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0B0F19] overflow-hidden">
        <div className="p-3 bg-[#0F1626] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 font-mono">
              Excel Workbook Preview ({companies.length} rows, 10 columns)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Artifact: {result?.excelFileName || 'webpilot-proof.xlsx'} ({Math.round((result?.excelFileSize || 12000) / 1024)} KB)
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 font-mono text-[11px] text-slate-400">
                <th className="p-3 font-semibold border-r border-slate-800">#</th>
                <th className="p-3 font-semibold border-r border-slate-800">Company Name</th>
                <th className="p-3 font-semibold border-r border-slate-800 min-w-[200px]">Product Description</th>
                <th className="p-3 font-semibold border-r border-slate-800 min-w-[160px]">Pricing</th>
                <th className="p-3 font-semibold border-r border-slate-800 min-w-[150px]">Target Users</th>
                <th className="p-3 font-semibold border-r border-slate-800">Official Website</th>
                <th className="p-3 font-semibold border-r border-slate-800">Pricing Source URL</th>
                <th className="p-3 font-semibold border-r border-slate-800 min-w-[220px]">Captured Evidence</th>
                <th className="p-3 font-semibold border-r border-slate-800">Verification Status</th>
                <th className="p-3 font-semibold min-w-[180px]">Missing Fields / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {companies.map((c, i) => (
                <tr key={c.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-3 font-mono text-slate-400 border-r border-slate-800">{i + 1}</td>
                  <td className="p-3 font-semibold text-white border-r border-slate-800 whitespace-nowrap">
                    {c.companyName}
                  </td>
                  <td className="p-3 text-slate-300 border-r border-slate-800">{c.productDescription}</td>
                  <td className="p-3 font-mono text-blue-300 border-r border-slate-800">{c.pricing}</td>
                  <td className="p-3 text-slate-300 border-r border-slate-800">{c.targetUsers}</td>
                  <td className="p-3 border-r border-slate-800 font-mono text-[11px]">
                    <a
                      href={c.officialWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Visit <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>
                  <td className="p-3 border-r border-slate-800 font-mono text-[11px]">
                    <a
                      href={c.pricingSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Pricing <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>
                  <td className="p-3 text-slate-400 italic text-[11px] font-mono border-r border-slate-800">
                    "{c.capturedEvidence}"
                  </td>
                  <td className="p-3 border-r border-slate-800 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        c.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : c.verificationStatus === 'RECOVERED'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : c.verificationStatus === 'NEEDS_REVIEW'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      }`}
                    >
                      {c.verificationStatus}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px]">{c.notes || 'Fully Grounded'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
