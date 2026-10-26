import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  PlayCircle,
  AlertCircle,
  BookOpen,
  FileSpreadsheet,
  Rocket,
  History,
  Settings,
  ShieldCheck,
  Zap,
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
  const navItems = [
    { id: 'dashboard' as ActiveNavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new_task' as ActiveNavTab, label: 'New Task', icon: PlusCircle },
    {
      id: 'execution' as ActiveNavTab,
      label: 'Current Execution',
      icon: PlayCircle,
      badge: taskState && ['RUNNING', 'RECOVERING', 'VERIFYING'].includes(taskState) ? taskState : undefined,
      badgeColor: taskState === 'RECOVERING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    {
      id: 'review_queue' as ActiveNavTab,
      label: 'Review Queue',
      icon: AlertCircle,
      badge: reviewCount > 0 ? `${reviewCount}` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    { id: 'verified_results' as ActiveNavTab, label: 'Verified Results', icon: FileSpreadsheet },
    { id: 'launch_kit' as ActiveNavTab, label: 'Launch Kit', icon: Rocket },
    { id: 'ledger' as ActiveNavTab, label: 'Evidence Ledger', icon: BookOpen },
    { id: 'task_history' as ActiveNavTab, label: 'Task History', icon: History },
    { id: 'settings' as ActiveNavTab, label: 'Settings & Chaos', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-slate-800/80 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-glow-sm shadow-blue-500/30 border border-blue-400/40">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">WebPilot</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono border border-blue-700/50">ProofFlow</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">AI BROWSER AGENT</p>
          </div>
        </div>

        {/* Micro Tagline */}
        <div className="mt-3 px-2 py-1.5 rounded bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 leading-tight">
          <span className="text-blue-400 font-medium">Recovers.</span>{' '}
          <span className="text-amber-400 font-medium">Asks.</span>{' '}
          <span className="text-emerald-400 font-medium">Proves.</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Demo / Chaos Mode Toggle Box */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-2.5 rounded-lg border border-slate-800 bg-[#0F1626]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 ${demoMode ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className="text-xs font-semibold text-slate-200">Demo & Chaos Mode</span>
            </div>
            <button
              onClick={onToggleDemoMode}
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                demoMode ? 'bg-amber-500' : 'bg-slate-700'
              }`}
              title="Toggle Demo & Chaos Scenarios"
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  demoMode ? 'translate-x-3.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            {demoMode ? 'Active: Chaos injections & recovery tests enabled.' : 'Live Mode: Real Playwright navigation.'}
          </p>
        </div>

        {/* Hackathon Credentials Footer */}
        <div className="mt-2 text-center text-[10px] text-slate-400 font-mono">
          Microsoft Hackathon 2026
        </div>
      </div>
    </aside>
  );
};
