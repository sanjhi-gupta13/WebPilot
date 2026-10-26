import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Play,
  Edit2,
  Check,
  ShieldAlert,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { WebPilotTask, PlanStep } from '../types';
import { api } from '../services/api';

interface ExecutionPlanViewProps {
  task: WebPilotTask;
  onPlanApproved: () => void;
}

export const ExecutionPlanView: React.FC<ExecutionPlanViewProps> = ({
  task,
  onPlanApproved,
}) => {
  const [plan, setPlan] = useState<PlanStep[]>(task.plan);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const startEdit = (step: PlanStep) => {
    setEditingId(step.id);
    setEditTitle(step.title);
    setEditDesc(step.description);
  };

  const saveEdit = async (stepId: string) => {
    const updated = plan.map((s) =>
      s.id === stepId ? { ...s, title: editTitle, description: editDesc } : s
    );
    setPlan(updated);
    setEditingId(null);
    try {
      await api.updatePlan(task.id, updated);
    } catch (e) {
      console.error('Failed to update plan:', e);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await api.approvePlan(task.id);
      onPlanApproved();
    } catch (e: any) {
      alert(`Approval error: ${e.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const isApproved = ['RUNNING', 'RECOVERING', 'NEEDS_REVIEW', 'VERIFYING', 'COMPLETED', 'PAUSED_FOR_TAKEOVER'].includes(
    task.state
  );

  return (
    <div className="space-y-4">
      {/* Approval Gate Banner (Section 6 & 10 requirement) */}
      {!isApproved && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/40 shadow-glow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-400/30 text-blue-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Approval Gate: Autonomous Plan Verification
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    MANDATORY HUMAN SIGN-OFF
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Inspect the 8 execution stages below. Per system safety policy, consequential browser automation
                  and Playwright navigation require explicit on-screen manual confirmation. (Voice agents cannot approve).
                </p>
              </div>
            </div>

            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 shrink-0 transition-all active:scale-95 disabled:opacity-50"
            >
              {isApproving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Approve Plan & Launch Browser</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Plan Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>Autonomous Execution Plan</span>
            <span className="text-xs font-mono text-slate-400 font-normal">
              ({plan.length} verification stages)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            {isApproved
              ? 'Execution in progress. Stages update automatically in real time.'
              : 'Click any step to edit prompt descriptions before approving.'}
          </p>
        </div>

        {isApproved && (
          <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Human Approved
          </span>
        )}
      </div>

      {/* Plan Steps Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {plan.map((step, idx) => {
          const isEditing = editingId === step.id;
          const isDone = step.status === 'completed';
          const isActive = step.status === 'active';

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-lg border transition-all ${
                isActive
                  ? 'bg-blue-950/20 border-blue-500 shadow-glow-sm'
                  : isDone
                  ? 'bg-[#0F1626]/80 border-slate-800 text-slate-300'
                  : 'bg-[#0F1626] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isActive
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </span>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="px-2 py-1 rounded bg-slate-900 border border-blue-500 text-xs font-semibold text-white focus:outline-none"
                    />
                  ) : (
                    <h4 className="text-xs font-semibold text-slate-200">{step.title}</h4>
                  )}
                </div>

                {!isApproved && !isEditing && (
                  <button
                    onClick={() => startEdit(step)}
                    className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                    title="Edit step"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}

                {isEditing && (
                  <button
                    onClick={() => saveEdit(step.id)}
                    className="p-1 rounded bg-blue-600 text-white hover:bg-blue-500 text-xs"
                    title="Save step"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
              </div>

              {isEditing ? (
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full mt-2 p-1.5 rounded bg-slate-900 border border-blue-500 text-xs text-slate-200 focus:outline-none resize-none font-mono"
                />
              ) : (
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed pl-8">
                  {step.description}
                </p>
              )}

              <div className="mt-2.5 pl-8 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="uppercase">
                  Status:{' '}
                  <span
                    className={
                      isDone
                        ? 'text-emerald-400 font-bold'
                        : isActive
                        ? 'text-blue-400 font-bold'
                        : 'text-slate-400'
                    }
                  >
                    {step.status}
                  </span>
                </span>
                <span>Stage {idx + 1} of 8</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
