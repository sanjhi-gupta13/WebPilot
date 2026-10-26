import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Edit3,
  RotateCcw,
  Ban,
  FastForward,
  ExternalLink,
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
      <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500 text-white shadow-sm shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              Human Review & Guidance
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Instead of guessing or hallucinating missing details, the AI pauses and asks you for confirmation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-amber-200 text-amber-900 font-bold border border-amber-300">
            {pendingItems.length} {pendingItems.length === 1 ? 'Item Needs Input' : 'Items Need Input'}
          </span>
        </div>
      </div>

      {/* Pending Items List */}
      <div className="space-y-3">
        {pendingItems.length === 0 ? (
          <div className="p-10 text-center bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">All Clear! No Reviews Pending</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All website data was cleanly verified with high confidence. The AI can proceed automatically.
            </p>
          </div>
        ) : (
          pendingItems.map((item) => {
            const isEditing = editingId === item.id;
            const isWorking = resolvingId === item.id;

            return (
              <div
                key={item.id}
                className="p-5 rounded-xl border border-amber-300 bg-white shadow-md space-y-4"
              >
                {/* Item Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                      {item.companyName}
                    </span>
                    <span className="text-xs font-semibold text-blue-700">
                      Field: {item.field}
                    </span>
                  </div>

                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  >
                    <span>View Official Web Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Reason & Evidence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-100">
                    <span className="text-[10px] font-bold text-amber-900 uppercase block mb-1">
                      Why the AI is Asking:
                    </span>
                    <p className="text-slate-800 leading-relaxed">{item.reason}</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Raw Text Found on Website:
                    </span>
                    <p className="text-slate-600 italic line-clamp-3 font-mono leading-relaxed">
                      "{item.capturedEvidence}"
                    </p>
                  </div>
                </div>

                {/* Inline Editing Drawer if user wants to correct value */}
                {isEditing ? (
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                    <label className="text-xs font-semibold text-blue-900 block">
                      Type the correct value for {item.companyName} [{item.field}]:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={correctedValue}
                        onChange={(e) => setCorrectedValue(e.target.value)}
                        placeholder="e.g. Free Starter + $20/mo Pro, or Enterprise Custom"
                        className="flex-1 px-3.5 py-2 rounded-lg bg-white border border-blue-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                      <button
                        onClick={() => handleResolve(item.id, 'CORRECTED', correctedValue)}
                        disabled={!correctedValue.trim() || isWorking}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white disabled:opacity-50 shadow-sm"
                      >
                        Save & Continue
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-xs text-slate-600 border border-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Friendly Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  {/* Correct Value */}
                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setCorrectedValue('');
                    }}
                    disabled={isWorking}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Type Correct Value</span>
                  </button>

                  {/* Approve Current Value */}
                  <button
                    onClick={() => handleResolve(item.id, 'APPROVED', item.currentValue)}
                    disabled={isWorking}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Value</span>
                  </button>

                  {/* Retry Extraction */}
                  <button
                    onClick={() => handleResolve(item.id, 'RETRIED')}
                    disabled={isWorking}
                    className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Retry Extraction</span>
                  </button>

                  {/* Mark Unavailable */}
                  <button
                    onClick={() =>
                      handleResolve(item.id, 'MARKED_UNAVAILABLE', '[UNAVAILABLE: Custom Enterprise / Contact Sales]')
                    }
                    disabled={isWorking}
                    className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Ban className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mark Unavailable</span>
                  </button>

                  {/* Skip Field */}
                  <button
                    onClick={() => handleResolve(item.id, 'SKIPPED', '[SKIPPED: Excluded by user]')}
                    disabled={isWorking}
                    className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Skip</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* History of Resolved Items */}
      {resolvedItems.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">
            Resolved Items ({resolvedItems.length})
          </h4>
          <div className="space-y-2">
            {resolvedItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="font-bold text-slate-900">{item.companyName}</span>
                  <span className="text-slate-500">[{item.field}]:</span>
                  <span className="text-blue-700 font-medium truncate max-w-sm">
                    {item.resolutionValue || item.currentValue}
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
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
