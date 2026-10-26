import React from 'react';
import { History, ArrowRight, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { WebPilotTask } from '../types';

interface TaskHistoryViewProps {
  tasks: WebPilotTask[];
  activeTaskId?: string;
  onSelectTask: (task: WebPilotTask) => void;
}

export const TaskHistoryView: React.FC<TaskHistoryViewProps> = ({
  tasks,
  activeTaskId,
  onSelectTask,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-[#0F1626] border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Persistent Task History</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              All research sessions and cryptographic proofs are saved locally to disk and survive browser refreshes.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          {tasks.length} Saved Tasks
        </span>
      </div>

      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="p-8 text-center bg-[#0F1626] border border-slate-800 rounded-xl text-xs text-slate-400 font-mono">
            No previous tasks recorded. Start a new research task above.
          </div>
        ) : (
          tasks.map((task) => {
            const isCurrent = task.id === activeTaskId;
            const isCompleted = task.state === 'COMPLETED';

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-blue-950/20 border-blue-500/60 shadow-glow-sm'
                    : 'bg-[#0F1626] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white truncate max-w-md">
                      {task.title}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 font-mono">
                    ID: {task.id} • Created: {new Date(task.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <div className="text-right text-[11px] font-mono">
                    <span className="text-slate-400 block">
                      {task.companies?.length || 0} Targets
                    </span>
                    <span
                      className={
                        isCompleted
                          ? 'text-emerald-400 font-bold'
                          : task.state === 'NEEDS_REVIEW'
                          ? 'text-amber-400 font-bold'
                          : 'text-slate-400'
                      }
                    >
                      {task.state}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
