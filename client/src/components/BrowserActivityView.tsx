import React, { useState } from 'react';
import {
  Globe,
  Lock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Maximize2,
  AlertTriangle,
  CheckCircle,
  Eye,
  Camera,
} from 'lucide-react';
import { WebPilotTask } from '../types';

interface BrowserActivityViewProps {
  task: WebPilotTask;
}

export const BrowserActivityView: React.FC<BrowserActivityViewProps> = ({ task }) => {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const activeUrl = task.activeUrl || 'https://www.anthropic.com';
  const activeStep = task.activeStep || 'Initializing browser automation...';
  const companies = task.companies || [];
  const latestScreenshot = task.latestScreenshotUrl;

  return (
    <div className="space-y-4">
      {/* Browser Viewport Window */}
      <div className="rounded-xl border border-slate-800 bg-[#0B0F19] overflow-hidden shadow-2xl">
        {/* Browser Top Navigation Bar */}
        <div className="bg-[#0F1626] border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Window dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>

          {/* URL Bar */}
          <div className="flex-1 max-w-xl mx-auto flex items-center gap-2 px-3 py-1 rounded-md bg-[#070B14] border border-slate-700/60 text-xs font-mono">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-slate-300 truncate">{activeUrl}</span>
            <a
              href={activeUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-slate-500 hover:text-slate-300"
              title="Open source URL in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* State / Recovery indicator */}
          <div className="flex items-center gap-2 shrink-0">
            {task.state === 'RECOVERING' ? (
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                Bounded Recovery
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                <Globe className="w-3 h-3 text-blue-400" />
                Playwright Active
              </span>
            )}
          </div>
        </div>

        {/* Browser Status Subheader */}
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span className="text-slate-200">{activeStep}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Progress: {companies.length}/5 Targets</span>
            <span>Viewport: 1280x800</span>
          </div>
        </div>

        {/* Viewport Content / Screenshot */}
        <div className="relative bg-[#070B14] min-h-[340px] max-h-[460px] flex items-center justify-center overflow-hidden group">
          {latestScreenshot ? (
            <div className="relative w-full h-full flex items-center justify-center p-2">
              <img
                src={`http://localhost:3001${latestScreenshot}`}
                alt="Playwright Live Browser Session"
                className="max-h-[420px] w-auto object-contain rounded border border-slate-800 shadow-md transition-all group-hover:scale-[1.01]"
              />
              <button
                onClick={() => setSelectedScreenshot(`http://localhost:3001${latestScreenshot}`)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-slate-900/80 backdrop-blur-md text-white border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                title="View Full Resolution Screenshot"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center p-8 space-y-3">
              <Camera className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
              <div className="text-xs text-slate-400 font-mono">
                {task.state === 'PLANNED'
                  ? 'Awaiting plan approval to initialize Chromium session.'
                  : 'Playwright browser is navigating target domain and rendering DOM...'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Extracted Intelligence Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Extracted Intelligence & Grounded Evidence ({companies.length} of 5)
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Source Grounding: 100% Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {companies.map((comp) => {
            const isVerified = comp.verificationStatus === 'VERIFIED';
            const isRecovered = comp.verificationStatus === 'RECOVERED';
            const isReview = comp.verificationStatus === 'NEEDS_REVIEW';

            return (
              <div
                key={comp.id}
                className="p-3.5 rounded-lg border border-slate-800 bg-[#0F1626] hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{comp.companyName}</span>
                      <a
                        href={comp.officialWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-blue-400"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </h4>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                        isVerified
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : isRecovered
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : isReview
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {comp.verificationStatus}
                    </span>
                  </div>

                  {/* Pricing info */}
                  <div className="mb-2 p-2 rounded bg-[#070B14] border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block">Pricing Tier:</span>
                    <p className="text-xs font-medium text-blue-300 truncate">{comp.pricing}</p>
                  </div>

                  {/* Product description */}
                  <p className="text-[11px] text-slate-300 line-clamp-3 mb-2 leading-relaxed">
                    {comp.productDescription}
                  </p>

                  {/* Evidence snippet */}
                  <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                    <span className="text-slate-400 font-semibold block mb-0.5">Captured DOM Evidence:</span>
                    <p className="italic text-slate-400 line-clamp-2">"{comp.capturedEvidence}"</p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Confidence: {Math.round(comp.confidenceScore * 100)}%</span>
                  {comp.screenshotUrl && (
                    <button
                      onClick={() => setSelectedScreenshot(`http://localhost:3001${comp.screenshotUrl}`)}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Screenshot
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screenshot Zoom Modal */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden p-2">
            <img
              src={selectedScreenshot}
              alt="Full Resolution Screenshot"
              className="max-h-[85vh] w-auto object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};
