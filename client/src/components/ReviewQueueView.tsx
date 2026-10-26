import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Edit3,
  RotateCcw,
  Ban,
  FastForward,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { ReviewItem, ReviewResolutionType } from '../types';
import { api } from '../services/api';

interface ReviewQueueViewProps {
  taskId: string;
  items: ReviewItem[];
  onItemResolved: () => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  taskId,
  items,
  onItemResolved,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [correctedValue, setCorrectedValue] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const pendingItems = items.filter((i) => !i.resolved);
  const resolvedItems = items.filter((i) => i.resolved);

  const handleResolve = async (
    itemId: string,
    type: ReviewResolutionType,
    value?: string
  ) => {
    setResolvingId(itemId);
    try {
      await api.resolveReviewItem(taskId, itemId, type, value);
      setEditingId(null);
      setCorrectedValue('');
      onItemResolved();
    } catch (e: any) {
      alert(`Resolution error: ${e.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-[#0F1626] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Human-in-the-Loop Review Queue
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ProofFlow pauses and requests human validation whenever pricing is gated behind enterprise sales forms or data is ambiguous.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {pendingItems.length} Pending Actions
          </span>
        </div>
      </div>

      {/* Pending Items List */}
      <div className="space-y-3">
        {pendingItems.length === 0 ? (
          <div className="p-8 text-center bg-[#0F1626] border border-slate-800/80 rounded-xl space-y-2">
            <Check className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-200">Review Queue is Clear</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All extracted fields meet strict confidence thresholds or have already been verified by human decisions.
            </p>
          </div>
        ) : (
          pendingItems.map((item) => {
            const isEditing = editingId === item.id;
            const isWorking = resolvingId === item.id;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-amber-500/40 bg-[#0F1626] shadow-lg shadow-amber-500/5 space-y-3"
              >
                {/* Item Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {item.companyName}
                    </span>
                    <span className="text-xs font-semibold text-blue-400 font-mono">
                      Field: [{item.field}]
                    </span>
                  </div>

                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-slate-400 hover:text-blue-400 flex items-center gap-1"
                  >
                    <span>View Source Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Reason & Evidence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#070B14] border border-slate-800">
                    <span className="text-[10px] font-mono text-amber-400 uppercase block mb-1">
                      Reason for Uncertainty:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{item.reason}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#070B14] border border-slate-800">
                    <span className="text-[10px] font-mono text-blue-400 uppercase block mb-1">
                      Raw Captured DOM Evidence:
                    </span>
                    <p className="text-slate-400 italic line-clamp-3 font-mono leading-relaxed">
                      "{item.capturedEvidence}"
                    </p>
                  </div>
                </div>

                {/* Inline Editing Drawer if user wants to correct value */}
                {isEditing ? (
                  <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-600/40 space-y-2">
                    <label className="text-[11px] font-mono text-blue-300 block">
                      Enter Corrected Value for {item.companyName} [{item.field}]:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={correctedValue}
                        onChange={(e) => setCorrectedValue(e.target.value)}
                        placeholder="e.g. Free Tier + $20/mo Pro, or Enterprise Custom Pricing"
                        className="flex-1 px-3 py-1.5 rounded bg-[#070B14] border border-blue-500 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleResolve(item.id, 'CORRECTED', correctedValue)}
                        disabled={!correctedValue.trim() || isWorking}
                        className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Save Correction
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Action Buttons (Section 6 requirement: Correct, Approve, Retry, Mark Unavailable, Skip) */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                  {/* Correct Value */}
                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setCorrectedValue('');
                    }}
                    disabled={isWorking}
                    className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Correct Value</span>
                  </button>

                  {/* Approve Current Value */}
                  <button
                    onClick={() => handleResolve(item.id, 'APPROVED', item.currentValue)}
                    disabled={isWorking}
                    className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Value</span>
                  </button>

                  {/* Retry Extraction */}
                  <button
                    onClick={() => handleResolve(item.id, 'RETRIED')}
                    disabled={isWorking}
                    className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Extraction</span>
                  </button>

                  {/* Mark Unavailable */}
                  <button
                    onClick={() =>
                      handleResolve(item.id, 'MARKED_UNAVAILABLE', '[UNAVAILABLE: Custom Enterprise / Contact Sales]')
                    }
                    disabled={isWorking}
                    className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Mark Unavailable</span>
                  </button>

                  {/* Skip Field */}
                  <button
                    onClick={() => handleResolve(item.id, 'SKIPPED', '[SKIPPED: Excluded by user]')}
                    disabled={isWorking}
                    className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Skip Field</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* History of Resolved Items */}
      {resolvedItems.length > 0 && (
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">
            Resolved Items ({resolvedItems.length})
          </h4>
          <div className="space-y-2">
            {resolvedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-[#0F1626]/60 border border-slate-800/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-slate-200">{item.companyName}</span>
                  <span className="text-slate-400">[{item.field}]:</span>
                  <span className="text-blue-300 truncate max-w-sm">{item.resolutionValue || item.currentValue}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {item.resolutionType}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
