import React from 'react';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
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
        return { text: 'RUNNING', color: 'bg-blue-500/15 text-blue-400 border-blue-500/40 animate-pulse' };
      case 'RECOVERING':
        return { text: 'RECOVERING (BOUNDED)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse' };
      case 'NEEDS_REVIEW':
        return { text: 'NEEDS HUMAN REVIEW', color: 'bg-amber-500 text-slate-950 font-bold border-amber-400' };
      case 'PAUSED_FOR_TAKEOVER':
        return { text: 'HUMAN TAKEOVER ACTIVE', color: 'bg-purple-500/20 text-purple-300 border-purple-500/50' };
      case 'AWAITING_APPROVAL':
        return { text: 'AWAITING APPROVAL', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'VERIFYING':
        return { text: 'INDEPENDENT VERIFICATION', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse' };
      case 'COMPLETED':
        return { text: 'VERIFIED & COMPLETED', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
      case 'FAILED':
        return { text: 'EXECUTION FAILED', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' };
      case 'CANCELLED':
        return { text: 'CANCELLED', color: 'bg-slate-700/40 text-slate-400 border-slate-600' };
      case 'PLANNED':
        return { text: 'PLAN READY', color: 'bg-blue-900/40 text-blue-300 border-blue-700' };
      default:
        return { text: 'IDLE', color: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  const badge = getStateBadge(task?.state);
  const isRunning = task?.state === 'RUNNING' || task?.state === 'RECOVERING' || task?.state === 'VERIFYING';
  const isTakeover = task?.state === 'PAUSED_FOR_TAKEOVER';

  return (
    <header className="h-14 bg-[#0B0F19] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 select-none">
      {/* Left: Active Task Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-slate-400 shrink-0">TASK:</span>
          <h1 className="text-xs font-semibold text-slate-200 truncate max-w-sm md:max-w-md">
            {task ? task.title : 'Ready for instruction'}
          </h1>
        </div>

        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${badge.color} shrink-0`}>
          {badge.text}
        </span>

        {demoMode && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
            CHAOS LAB ON
          </span>
        )}
      </div>

      {/* Center: System Service Health Pills */}
      <div className="hidden lg:flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0F1626] border border-slate-800 text-[11px] text-slate-300">
          <Globe className="w-3 h-3 text-blue-400" />
          <span>Playwright</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0F1626] border border-slate-800 text-[11px] text-slate-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Verification Engine</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0F1626] border border-slate-800 text-[11px] text-slate-300">
          <Shield className="w-3 h-3 text-indigo-400" />
          <span>Security Guardrail</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>
      </div>

      {/* Right: Controls & Voice trigger */}
      <div className="flex items-center gap-2">
        {/* Voice Trigger */}
        <button
          onClick={onOpenVoice}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-medium transition-all"
          title="ElevenLabs Voice Assistant"
        >
          <Mic className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Voice Agent</span>
        </button>

        {/* Task Control Buttons */}
        {task && (
          <>
            {/* Take Over */}
            <button
              onClick={onTakeOver}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all ${
                isTakeover
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Pause automation and take manual control"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isTakeover ? 'Release Takeover' : 'Take Over'}</span>
            </button>

            {/* Pause / Resume */}
            {(isRunning || isTakeover) && (
              <button
                onClick={onPauseResume}
                className="p-1.5 rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all"
                title={isRunning ? 'Pause task' : 'Resume task'}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Cancel */}
            {isRunning && (
              <button
                onClick={onCancel}
                className="flex items-center gap-1 p-1.5 md:px-2.5 md:py-1.5 rounded-md bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-medium transition-all"
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
