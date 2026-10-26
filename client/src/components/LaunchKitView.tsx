import React, { useState } from 'react';
import {
  Rocket,
  Download,
  Copy,
  Check,
  ExternalLink,
  Target,
  Sparkles,
  Layers,
} from 'lucide-react';
import { WebPilotTask } from '../types';
import { api } from '../services/api';

interface LaunchKitViewProps {
  task: WebPilotTask;
}

export const LaunchKitView: React.FC<LaunchKitViewProps> = ({ task }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const kit = task.launchKit;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!kit) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
        <Rocket className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">Launch Kit Not Ready Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The Launch Kit is automatically synthesized as soon as your research passes the independent Excel verification pass.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Download Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-600 text-white shadow-sm">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Synthesized Launch Kit</h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                100% Grounded
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Derived exclusively from verified competitor intelligence and live Playwright extractions.
            </p>
          </div>
        </div>

        <a
          href={api.getDownloadLaunchKitUrl(task.id)}
          download
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Markdown (.md)</span>
        </a>
      </div>

      {/* Tagline & Positioning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>Marketing Headline & Tagline</span>
          </div>
          <blockquote className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-3 italic">
            “{kit.marketingHeadline}”
          </blockquote>
          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            {kit.productDescription}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wide">
            <Target className="w-4 h-4" />
            <span>Product Positioning</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {kit.productPositioning}
          </p>
        </div>
      </div>

      {/* Target Audience & Differentiators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Audience */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-800 flex items-center gap-2 tracking-wide">
            <Layers className="w-4 h-4 text-purple-600" />
            Target Audience Personas
          </h4>
          <ul className="space-y-2 text-xs text-slate-700">
            {kit.targetAudience.map((aud, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0"></span>
                <span>{aud}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Differentiators */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-800 flex items-center gap-2 tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Key Competitive Differentiators
          </h4>
          <ul className="space-y-2 text-xs text-slate-700">
            {kit.keyDifferentiators.map((diff, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                <span>{diff}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Competitor Comparison Matrix with Grounding */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Competitor Battlecards & Grounded Evidence
          </h3>
          <span className="text-xs text-emerald-700 font-semibold">
            All Claims Grounded in Live Web DOM
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {kit.competitorComparison.map((comp, idx) => (
            <div key={idx} className="p-5 space-y-2.5 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>{comp.company}</span>
                  <a
                    href={comp.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-normal text-xs flex items-center gap-1"
                  >
                    <span>View Official Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </h4>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {comp.pricing}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-slate-800">
                  <strong className="text-emerald-800 block text-[11px] uppercase mb-0.5">Strengths:</strong>
                  <span>{comp.strengths}</span>
                </div>
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100 text-slate-800">
                  <strong className="text-amber-800 block text-[11px] uppercase mb-0.5">Gaps / Opportunities:</strong>
                  <span>{comp.weaknesses}</span>
                </div>
              </div>

              {/* Grounded snippet */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono">
                <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Captured Evidence Citation:</span>
                <p className="italic">"{comp.evidenceGrounding}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Launch Copy Variations with 1-Click Copy Buttons */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Launch Copy Variations (3 Formats)
        </h3>

        {/* Variation A: HackerNews / ProductHunt */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200">
                Variation A: Hacker News / Product Hunt
              </span>
              <span className="text-xs text-slate-500">Developer & Community Launch</span>
            </div>

            <button
              onClick={() => copyToClipboard(kit.copyVariations.hackerNews, 'hn')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition-all shadow-sm"
            >
              {copiedKey === 'hn' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'hn' ? 'Copied!' : 'Copy Post'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {kit.copyVariations.hackerNews}
          </pre>
        </div>

        {/* Variation B: Enterprise Pitch */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                Variation B: Enterprise Executive Pitch
              </span>
              <span className="text-xs text-slate-500">Corporate Strategy & M&A Due Diligence</span>
            </div>

            <button
              onClick={() => copyToClipboard(kit.copyVariations.enterprise, 'ent')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition-all shadow-sm"
            >
              {copiedKey === 'ent' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'ent' ? 'Copied!' : 'Copy Pitch'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {kit.copyVariations.enterprise}
          </pre>
        </div>

        {/* Variation C: Viral Social Thread */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                Variation C: Social Thread
              </span>
              <span className="text-xs text-slate-500">X / LinkedIn Multi-Part Post</span>
            </div>

            <button
              onClick={() => copyToClipboard(kit.copyVariations.socialThread, 'social')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition-all shadow-sm"
            >
              {copiedKey === 'social' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'social' ? 'Copied!' : 'Copy Thread'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {kit.copyVariations.socialThread}
          </pre>
        </div>
      </div>
    </div>
  );
};
