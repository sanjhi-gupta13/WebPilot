import React from 'react';
import { History, ArrowRight } from 'lucide-react';
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
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Task History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All previous research runs and verified Excel reports saved to local disk.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          {tasks.length} Saved Tasks
        </span>
      </div>

      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="p-10 text-center bg-white border border-slate-200 rounded-2xl shadow-sm text-xs text-slate-500">
            No previous tasks recorded yet. Start a new research task in the Workspace.
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
                    ? 'bg-blue-50/70 border-blue-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-md">
                      {task.title}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 font-mono">
                    ID: {task.id.substring(0, 8)}... • Created: {new Date(task.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <div className="text-right text-xs">
                    <span className="text-slate-500 block text-[11px]">
                      {task.companies?.length || 0} Targets
                    </span>
                    <span
                      className={`font-semibold ${
                        isCompleted
                          ? 'text-emerald-700'
                          : task.state === 'NEEDS_REVIEW'
                          ? 'text-amber-800'
                          : 'text-slate-600'
                      }`}
                    >
                      {task.state}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
