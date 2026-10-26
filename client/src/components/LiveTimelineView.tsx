import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Info,
  ExternalLink,
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
          color: 'text-emerald-700',
          bg: 'bg-emerald-50 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'VERIFIED',
        };
      case 'recovered':
        return {
          icon: AlertTriangle,
          color: 'text-amber-800',
          bg: 'bg-amber-50 border-amber-200',
          dot: 'bg-amber-500',
          label: 'RECOVERED',
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-rose-700',
          bg: 'bg-rose-50 border-rose-200',
          dot: 'bg-rose-500',
          label: 'FAILED',
        };
      case 'needs_review':
        return {
          icon: HelpCircle,
          color: 'text-blue-700',
          bg: 'bg-blue-50 border-blue-200',
          dot: 'bg-blue-500',
          label: 'REVIEW NEEDED',
        };
      default:
        return {
          icon: Info,
          color: 'text-slate-600',
          bg: 'bg-slate-50 border-slate-200',
          dot: 'bg-slate-400',
          label: 'INFO',
        };
    }
  };

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-700 font-semibold">
          Live Activity Feed:
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Verified
          </span>
          <span className="flex items-center gap-1.5 text-amber-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Recovered
          </span>
          <span className="flex items-center gap-1.5 text-blue-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Needs Review
          </span>
          <span className="flex items-center gap-1.5 text-rose-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Failed
          </span>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {timeline.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 font-mono">No events recorded yet.</div>
        ) : (
          timeline
            .slice()
            .reverse()
            .map((event) => {
              const cfg = getEventBadge(event.status);
              const timeFormatted = new Date(event.timestamp).toLocaleTimeString();

              return (
                <div key={event.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-6 top-3 w-3.5 h-3.5 rounded-full border-2 border-white ${cfg.dot} shadow-sm`}
                  />

                  {/* Card Content */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${cfg.bg} bg-white shadow-sm hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>

                        {event.companyName && (
                          <span className="text-xs font-bold text-slate-900">
                            {event.companyName}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono">
                        {timeFormatted}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-sans mt-1">
                      {event.message}
                    </p>

                    {event.sourceUrl && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                        <span>Source:</span>
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline truncate max-w-md flex items-center gap-1 font-mono text-[11px]"
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
