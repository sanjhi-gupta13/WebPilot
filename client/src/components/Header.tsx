import React from 'react';
import {
  Globe,
  CheckCircle2,
  Mic,
  Shield,
  Pause,
  Play,
  XOctagon,
  UserCheck,
} from 'lucide-react';
import { WebPilotTask, TaskState } from '../types';

interface HeaderProps {
  task?: WebPilotTask;
  onOpenVoice: () => void;
  onTakeOver: () => void;
  onPauseResume: () => void;
  onCancel: () => void;
  demoMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  task,
  onOpenVoice,
  onTakeOver,
  onPauseResume,
  onCancel,
  demoMode,
}) => {
  const getStateBadge = (state?: TaskState) => {
    switch (state) {
      case 'RUNNING':
        return { text: 'Running Browser', color: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' };
      case 'RECOVERING':
        return { text: 'Self-Healing Recovery', color: 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' };
      case 'NEEDS_REVIEW':
        return { text: 'Needs Your Review', color: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold' };
      case 'PAUSED_FOR_TAKEOVER':
        return { text: 'Manual Control Active', color: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold' };
      case 'AWAITING_APPROVAL':
        return { text: 'Awaiting Your Approval', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'VERIFYING':
        return { text: 'Verifying Results...', color: 'bg-cyan-50 text-cyan-800 border-cyan-200 animate-pulse' };
      case 'COMPLETED':
        return { text: 'Verified & Complete', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold' };
      case 'FAILED':
        return { text: 'Stopped with Issues', color: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' };
      case 'CANCELLED':
        return { text: 'Cancelled', color: 'bg-slate-100 text-slate-600 border-slate-200' };
      case 'PLANNED':
        return { text: 'Plan Ready', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { text: 'Ready', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  const badge = getStateBadge(task?.state);
  const isRunning = task?.state === 'RUNNING' || task?.state === 'RECOVERING' || task?.state === 'VERIFYING';
  const isTakeover = task?.state === 'PAUSED_FOR_TAKEOVER';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none shadow-sm">
      {/* Left: Task summary */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-slate-400 shrink-0 uppercase tracking-wide">
            Task:
          </span>
          <h1 className="text-xs sm:text-sm font-semibold text-slate-800 truncate max-w-sm md:max-w-lg">
            {task ? task.title : 'Ready for instruction'}
          </h1>
        </div>

        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium shrink-0 ${badge.color}`}>
          {badge.text}
        </span>

        {demoMode && (
          <span className="hidden sm:inline text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
            Demo Mode Active
          </span>
        )}
      </div>

      {/* Center: System status pills (simplified & friendly) */}
      <div className="hidden lg:flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>Playwright</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verification Engine</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          <span>Security Guardrail</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Voice Trigger */}
        <button
          onClick={onOpenVoice}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-all shadow-sm"
          title="ElevenLabs Voice Agent"
        >
          <Mic className="w-3.5 h-3.5 text-blue-600" />
          <span>Voice Agent</span>
        </button>

        {/* Task Control Buttons */}
        {task && (
          <>
            {/* Take Over */}
            <button
              onClick={onTakeOver}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isTakeover
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
              }`}
              title="Pause automation and take manual control"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isTakeover ? 'Resume Auto' : 'Manual Takeover'}</span>
            </button>

            {/* Pause / Resume */}
            {(isRunning || isTakeover) && (
              <button
                onClick={onPauseResume}
                className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all"
                title={isRunning ? 'Pause task' : 'Resume task'}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Cancel */}
            {isRunning && (
              <button
                onClick={onCancel}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-all"
                title="Cancel Task"
              >
                <XOctagon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Cancel</span>
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
};
