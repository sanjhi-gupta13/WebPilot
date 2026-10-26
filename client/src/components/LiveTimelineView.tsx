import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Info,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { TimelineEvent, EventStatus } from '../types';

interface LiveTimelineViewProps {
  timeline: TimelineEvent[];
}

export const LiveTimelineView: React.FC<LiveTimelineViewProps> = ({ timeline }) => {
  const getEventBadge = (status: EventStatus) => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/30',
          dot: 'bg-emerald-500',
          label: 'VERIFIED',
        };
      case 'recovered':
        return {
          icon: AlertTriangle,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/30',
          dot: 'bg-amber-500',
          label: 'RECOVERED',
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/30',
          dot: 'bg-rose-500',
          label: 'FAILED',
        };
      case 'needs_review':
        return {
          icon: HelpCircle,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10 border-blue-500/30',
          dot: 'bg-blue-500',
          label: 'NEEDS REVIEW',
        };
      default:
        return {
          icon: Info,
          color: 'text-slate-400',
          bg: 'bg-slate-800 border-slate-700',
          dot: 'bg-slate-500',
          label: 'INFO',
        };
    }
  };

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="p-3 rounded-lg bg-[#0F1626] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <span className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
          ProofFlow Live Event Stream:
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Verified (Green)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Recovered (Amber)
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Needs Review (Blue)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Failed (Red)
          </span>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {timeline.length === 0 ? (
          <div className="text-xs text-slate-500 font-mono py-4">No events recorded yet.</div>
        ) : (
          timeline
            .slice()
            .reverse()
            .map((event) => {
              const cfg = getEventBadge(event.status);
              const Icon = cfg.icon;
              const timeFormatted = new Date(event.timestamp).toLocaleTimeString();

              return (
                <div key={event.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-6 top-2 w-3.5 h-3.5 rounded-full border-2 border-[#070B14] ${cfg.dot} shadow-sm`}
                  />

                  {/* Card Content */}
                  <div
                    className={`p-3 rounded-lg border transition-all ${cfg.bg} bg-[#0F1626]/90 hover:bg-[#141E33]`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>

                        {event.companyName && (
                          <span className="text-xs font-semibold text-white">
                            {event.companyName}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        {timeFormatted}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {event.message}
                    </p>

                    {event.sourceUrl && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-mono text-slate-400">
                        <span className="text-slate-400">Source:</span>
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 truncate max-w-md flex items-center gap-1"
                        >
                          {event.sourceUrl}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};
