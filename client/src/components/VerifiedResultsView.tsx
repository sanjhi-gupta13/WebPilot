import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Hash,
  AlertTriangle,
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
    <div className="space-y-6">
      {/* Top Banner: Verification Result & Download */}
      <div
        className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isPassed
            ? 'bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-emerald-200'
            : 'bg-gradient-to-r from-amber-50 via-white to-orange-50 border-amber-200'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`p-3 rounded-xl shrink-0 shadow-sm ${
              isPassed
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {isPassed ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {isPassed ? 'Independent Verification Passed' : 'Verification In Progress or Pending'}
              </h2>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  isPassed
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {result?.overallStatus || 'PENDING'}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {result?.summary ||
                'The workbook is automatically generated with ExcelJS and independently verified across 6 integrity checks.'}
            </p>

            {result?.ledgerChecksum && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500">
                <Hash className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium">Cryptographic Proof Checksum:</span>
                <span className="text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px] shadow-sm">
                  {result.ledgerChecksum}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleReverify}
            disabled={isReverifying}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReverifying ? 'animate-spin' : ''}`} />
            <span>Re-Verify</span>
          </button>

          <a
            href={api.getDownloadExcelUrl(task.id)}
            download
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel (.xlsx)</span>
          </a>
        </div>
      </div>

      {/* 6-Point Independent Integrity Checklist Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
          Independent Verification Checklist (6 Checks)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {result?.checks?.map((check, idx) => {
            const passed = check.status === 'PASSED';
            const warning = check.status === 'WARNING';

            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      {check.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        passed
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : warning
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {check.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {check.details}
                  </p>
                </div>

                {check.evidenceReference && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-blue-700 font-medium">
                    Evidence: {check.evidenceReference}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Full 10-Column Excel Live Preview Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Excel Workbook Preview ({companies.length} rows, 10 columns)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {result?.excelFileName || 'webpilot-proof.xlsx'} ({Math.round((result?.excelFileSize || 12000) / 1024)} KB)
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="p-3.5 border-r border-slate-200">#</th>
                <th className="p-3.5 border-r border-slate-200">Company Name</th>
                <th className="p-3.5 border-r border-slate-200 min-w-[200px]">Product Description</th>
                <th className="p-3.5 border-r border-slate-200 min-w-[160px]">Pricing</th>
                <th className="p-3.5 border-r border-slate-200 min-w-[150px]">Target Users</th>
                <th className="p-3.5 border-r border-slate-200">Official Website</th>
                <th className="p-3.5 border-r border-slate-200">Pricing Source URL</th>
                <th className="p-3.5 border-r border-slate-200 min-w-[220px]">Captured Evidence</th>
                <th className="p-3.5 border-r border-slate-200">Verification Status</th>
                <th className="p-3.5 min-w-[180px]">Missing Fields / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {companies.map((c, i) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 text-slate-400 border-r border-slate-100 font-mono">{i + 1}</td>
                  <td className="p-3.5 font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                    {c.companyName}
                  </td>
                  <td className="p-3.5 text-slate-700 border-r border-slate-100 leading-relaxed">{c.productDescription}</td>
                  <td className="p-3.5 text-blue-700 font-semibold border-r border-slate-100">{c.pricing}</td>
                  <td className="p-3.5 text-slate-700 border-r border-slate-100">{c.targetUsers}</td>
                  <td className="p-3.5 border-r border-slate-100 text-[11px]">
                    <a
                      href={c.officialWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      Visit Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="p-3.5 border-r border-slate-100 text-[11px]">
                    <a
                      href={c.pricingSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      Pricing Page <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="p-3.5 text-slate-600 italic text-[11px] font-mono border-r border-slate-100">
                    "{c.capturedEvidence}"
                  </td>
                  <td className="p-3.5 border-r border-slate-100 whitespace-nowrap">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        c.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : c.verificationStatus === 'RECOVERED'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : c.verificationStatus === 'NEEDS_REVIEW'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {c.verificationStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 text-[11px]">{c.notes || 'Fully Grounded'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
