import React, { useState } from 'react';
import {
  CheckCircle,
  Play,
  Edit2,
  Check,
  ShieldCheck,
  Sparkles,
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
      {/* Friendly Approval Gate Banner */}
      {!isApproved && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-blue-600 text-white shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Step 2: Review & Approve Execution Plan
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Ready to Launch
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  ProofFlow generated this 8-step research workflow. Review the steps below and click <strong>Approve & Start Research</strong> to let the AI safely navigate the web.
                </p>
              </div>
            </div>

            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 shrink-0 transition-all active:scale-95 disabled:opacity-50"
            >
              {isApproving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Approve & Start Research</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>Execution Plan</span>
            <span className="text-xs font-normal text-slate-500">
              ({plan.length} verification stages)
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {isApproved
              ? 'Automation is running. Checkmarks update in real time as each step completes.'
              : 'Feel free to tweak any step description before launching.'}
          </p>
        </div>

        {isApproved && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Approved & Running
          </span>
        )}
      </div>

      {/* Plan Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {plan.map((step, idx) => {
          const isEditing = editingId === step.id;
          const isDone = step.status === 'completed';
          const isActive = step.status === 'active';

          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all ${
                isActive
                  ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                  : isDone
                  ? 'bg-slate-50/60 border-slate-200 text-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : isActive
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : idx + 1}
                  </span>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="px-2 py-1 rounded bg-white border border-blue-500 text-xs font-semibold text-slate-900 focus:outline-none"
                    />
                  ) : (
                    <h4 className="text-xs font-semibold text-slate-800">{step.title}</h4>
                  )}
                </div>

                {!isApproved && !isEditing && (
                  <button
                    onClick={() => startEdit(step)}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Edit step"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}

                {isEditing && (
                  <button
                    onClick={() => saveEdit(step.id)}
                    className="p-1 px-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium"
                    title="Save step"
                  >
                    Save
                  </button>
                )}
              </div>

              {isEditing ? (
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full mt-2 p-2 rounded bg-white border border-blue-500 text-xs text-slate-800 focus:outline-none resize-none font-sans"
                />
              ) : (
                <p className="text-xs text-slate-600 mt-2 leading-relaxed pl-8">
                  {step.description}
                </p>
              )}

              <div className="mt-2.5 pl-8 flex items-center justify-between text-[11px] text-slate-400">
                <span className="capitalize font-medium">
                  {isDone ? (
                    <span className="text-emerald-600 font-semibold">Completed</span>
                  ) : isActive ? (
                    <span className="text-blue-600 font-semibold animate-pulse">In Progress...</span>
                  ) : (
                    <span>Pending</span>
                  )}
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
