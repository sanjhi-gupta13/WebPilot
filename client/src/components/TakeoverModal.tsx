import React from 'react';
import { UserCheck, ExternalLink, Play, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white border border-purple-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Manual Control Mode Active</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-900 space-y-1.5 leading-relaxed">
          <p className="font-bold">Automation Paused for You</p>
          <p className="text-purple-800">
            ProofFlow has safely halted browser actions without closing the browser window. You can view the live page, inspect company details, and resume whenever you are ready.
          </p>
        </div>

        {task && (
          <div className="space-y-2 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Website:</span>
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium truncate font-mono text-[11px]">
                  {task.activeUrl || 'https://www.anthropic.com'}
                </span>
                {task.activeUrl && (
                  <a
                    href={task.activeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Open Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Step:</span>
              <p className="text-slate-700 font-medium">{task.activeStep || 'Autonomous research paused'}</p>
            </div>
          </div>
        )}

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
          >
            Keep Paused
          </button>
          <button
            onClick={() => {
              onResumeAutomation();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-purple-600/20"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Resume Automation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
