import React from 'react';
import { UserCheck, ExternalLink, Play, X, ShieldAlert } from 'lucide-react';
import { WebPilotTask } from '../types';

interface TakeoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: WebPilotTask;
  onResumeAutomation: () => void;
}

export const TakeoverModal: React.FC<TakeoverModalProps> = ({
  isOpen,
  onClose,
  task,
  onResumeAutomation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0F1626] border border-purple-500/50 rounded-xl shadow-2xl overflow-hidden flex flex-col space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Human Takeover Mode Active</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-800/40 text-xs text-purple-200 space-y-2">
          <p className="font-semibold">Automation Suspended Safely</p>
          <p className="text-slate-300 leading-relaxed">
            ProofFlow has halted automated browser actions without closing the browser context. You can manually inspect the target web page, resolve verification ambiguities, or adjust extracted intelligence values.
          </p>
        </div>

        {task && (
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-[#070B14] border border-slate-800 font-mono space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Active Target Domain:</span>
              <div className="flex items-center justify-between">
                <span className="text-blue-300 truncate">{task.activeUrl || 'https://www.anthropic.com'}</span>
                {task.activeUrl && (
                  <a
                    href={task.activeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open URL</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#070B14] border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Current Step:</span>
              <p className="text-slate-200">{task.activeStep || 'Autonomous research paused'}</p>
            </div>
          </div>
        )}

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
          >
            Keep Suspended
          </button>
          <button
            onClick={() => {
              onResumeAutomation();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Release Takeover & Resume</span>
          </button>
        </div>
      </div>
    </div>
  );
};
