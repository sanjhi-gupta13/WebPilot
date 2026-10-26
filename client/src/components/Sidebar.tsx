import React from 'react';
import {
  LayoutDashboard,
  PlayCircle,
  AlertCircle,
  FileSpreadsheet,
  Rocket,
  History,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import { ActiveNavTab } from '../types';

interface SidebarProps {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  reviewCount: number;
  taskState?: string;
  demoMode: boolean;
  onToggleDemoMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  reviewCount,
  taskState,
  demoMode,
  onToggleDemoMode,
}) => {
  const isRunning = taskState && ['RUNNING', 'RECOVERING', 'VERIFYING'].includes(taskState);

  const navItems = [
    {
      id: 'dashboard' as ActiveNavTab,
      label: 'Workspace',
      icon: LayoutDashboard,
      description: 'Research, Plan & Live Run',
    },
    {
      id: 'review_queue' as ActiveNavTab,
      label: 'Review Queue',
      icon: AlertCircle,
      badge: reviewCount > 0 ? `${reviewCount} need input` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
      description: 'Human approval queue',
    },
    {
      id: 'verified_results' as ActiveNavTab,
      label: 'Excel Report',
      icon: FileSpreadsheet,
      description: 'Verified spreadsheet & downloads',
    },
    {
      id: 'launch_kit' as ActiveNavTab,
      label: 'Launch Kit',
      icon: Rocket,
      description: 'Positioning & social copy',
    },
    {
      id: 'task_history' as ActiveNavTab,
      label: 'Task History',
      icon: History,
      description: 'Saved past research',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen select-none shrink-0 shadow-sm">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 tracking-tight">WebPilot</span>
              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                ProofFlow
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">AI Browser Agent</p>
          </div>
        </div>

        {/* Friendly Tagline */}
        <div className="mt-3 px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-snug">
          “When AI gets stuck, it <span className="font-semibold text-amber-700">recovers</span>. When it can’t, it <span className="font-semibold text-blue-700">asks</span>. When it finishes, it <span className="font-semibold text-emerald-700">proves</span>.”
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{item.description}</div>
                </div>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Chaos / Demo Mode Box */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 ${demoMode ? 'text-amber-600' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold text-slate-800">Demo & Chaos Mode</span>
            </div>
            <button
              onClick={onToggleDemoMode}
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                demoMode ? 'bg-amber-500' : 'bg-slate-300'
              }`}
              title="Toggle Demo Mode"
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm ${
                  demoMode ? 'translate-x-3.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            {demoMode ? 'Simulating timeouts & review triggers for demos.' : 'Live Mode: Real Playwright web automation.'}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-2 text-center text-[10px] text-slate-400">
          Microsoft Hackathon 2026
        </div>
      </div>
    </aside>
  );
};
