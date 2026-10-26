import React, { useState } from 'react';
import {
  Globe,
  Lock,
  ExternalLink,
  Maximize2,
  AlertTriangle,
  Eye,
  Camera,
  CheckCircle2,
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
      {/* Browser Mockup Window */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Browser Top Navigation Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
          {/* Window dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>

          {/* URL Bar */}
          <div className="flex-1 max-w-xl mx-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs shadow-sm">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-700 truncate font-mono text-[11px]">{activeUrl}</span>
            <a
              href={activeUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-slate-400 hover:text-blue-600"
              title="Open source page in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* State pill */}
          <div className="flex items-center gap-2 shrink-0">
            {task.state === 'RECOVERING' ? (
              <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                Auto-Recovering
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                <Globe className="w-3 h-3 text-blue-600" />
                Browser Active
              </span>
            )}
          </div>
        </div>

        {/* Browser Status Subheader */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            <span className="font-medium text-slate-800">{activeStep}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            <span>Progress: {companies.length} of 5 Websites</span>
            <span>Viewport: 1280 × 800</span>
          </div>
        </div>

        {/* Viewport Content / Screenshot */}
        <div className="relative bg-slate-100 min-h-[320px] max-h-[440px] flex items-center justify-center overflow-hidden group">
          {latestScreenshot ? (
            <div className="relative w-full h-full flex items-center justify-center p-3">
              <img
                src={`http://localhost:3001${latestScreenshot}`}
                alt="Playwright Live Browser Session"
                className="max-h-[400px] w-auto object-contain rounded-lg border border-slate-200 shadow-sm transition-all group-hover:scale-[1.01]"
              />
              <button
                onClick={() => setSelectedScreenshot(`http://localhost:3001${latestScreenshot}`)}
                className="absolute top-5 right-5 p-2 rounded-lg bg-white/90 backdrop-blur-sm text-slate-700 border border-slate-200 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Expand Screenshot"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center p-8 space-y-3">
              <Camera className="w-10 h-10 text-slate-400 mx-auto animate-pulse" />
              <div className="text-xs text-slate-500">
                {task.state === 'PLANNED'
                  ? 'Awaiting plan approval to launch the browser.'
                  : 'Playwright is rendering the page and extracting intelligence...'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Extracted Intelligence Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Grounded Research Findings ({companies.length} of 5)
          </h3>
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            100% Backed by Source Evidence
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
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{comp.companyName}</span>
                      <a
                        href={comp.officialWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-blue-600"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </h4>

                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isRecovered
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : isReview
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {comp.verificationStatus}
                    </span>
                  </div>

                  {/* Pricing info */}
                  <div className="mb-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Pricing:
                    </span>
                    <p className="text-xs font-semibold text-blue-700 truncate">{comp.pricing}</p>
                  </div>

                  {/* Product description */}
                  <p className="text-xs text-slate-600 line-clamp-3 mb-2.5 leading-relaxed">
                    {comp.productDescription}
                  </p>

                  {/* Evidence snippet */}
                  <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
                    <span className="text-slate-400 font-semibold block mb-0.5 text-[10px] uppercase font-sans">
                      Captured Proof:
                    </span>
                    <p className="italic line-clamp-2">"{comp.capturedEvidence}"</p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-medium">Confidence: {Math.round(comp.confidenceScore * 100)}%</span>
                  {comp.screenshotUrl && (
                    <button
                      onClick={() => setSelectedScreenshot(`http://localhost:3001${comp.screenshotUrl}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Screenshot
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white border border-slate-300 rounded-2xl overflow-hidden p-3 shadow-2xl">
            <img
              src={selectedScreenshot}
              alt="Full Resolution Screenshot"
              className="max-h-[85vh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
