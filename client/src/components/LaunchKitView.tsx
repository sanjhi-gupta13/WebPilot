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
  FileText,
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
      <div className="p-12 text-center bg-[#0F1626] border border-slate-800 rounded-xl space-y-3">
        <Rocket className="w-10 h-10 text-slate-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-200">Launch Kit Not Ready</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          The Launch Kit is synthesized automatically once company research passes the independent Excel verification pass.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Download Bar */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-[#0F1626] border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Synthesized Launch Kit</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                100% GROUNDED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Derived exclusively from verified competitor intelligence and live Playwright extractions.
            </p>
          </div>
        </div>

        <a
          href={api.getDownloadLaunchKitUrl(task.id)}
          download
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Markdown (.md)</span>
        </a>
      </div>

      {/* Tagline & Positioning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#0F1626] border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 font-mono">
            <Sparkles className="w-4 h-4" />
            <span>MARKETING HEADLINE & TAGLINE</span>
          </div>
          <blockquote className="text-sm font-bold text-slate-100 border-l-2 border-blue-500 pl-3 italic">
            “{kit.marketingHeadline}”
          </blockquote>
          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            {kit.productDescription}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F1626] border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 font-mono">
            <Target className="w-4 h-4" />
            <span>PRODUCT POSITIONING</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {kit.productPositioning}
          </p>
        </div>
      </div>

      {/* Target Audience & Differentiators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Audience */}
        <div className="p-4 rounded-xl bg-[#0F1626] border border-slate-800 space-y-2.5">
          <h4 className="text-xs font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Target Audience Personas
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {kit.targetAudience.map((aud, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                <span>{aud}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Differentiators */}
        <div className="p-4 rounded-xl bg-[#0F1626] border border-slate-800 space-y-2.5">
          <h4 className="text-xs font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Key Competitive Differentiators
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {kit.keyDifferentiators.map((diff, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                <span>{diff}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Competitor Comparison Matrix with Grounding */}
      <div className="rounded-xl border border-slate-800 bg-[#0B0F19] overflow-hidden">
        <div className="p-3.5 bg-[#0F1626] border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 font-mono uppercase">
            Competitor Battlecards & Grounded Evidence
          </h3>
          <span className="text-[11px] font-mono text-emerald-400">
            Factual Claims Verified Against Live DOM
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {kit.competitorComparison.map((comp, idx) => (
            <div key={idx} className="p-4 space-y-2 bg-[#0F1626]/40 hover:bg-[#0F1626] transition-colors">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{comp.company}</span>
                  <a
                    href={comp.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-blue-400 font-normal font-mono text-[11px] flex items-center gap-1"
                  >
                    <span>Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </h4>
                <span className="text-xs font-mono text-blue-300 font-medium">
                  {comp.pricing}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="text-slate-300">
                  <strong className="text-emerald-400 block text-[11px] font-mono uppercase mb-0.5">Strengths:</strong>
                  <span>{comp.strengths}</span>
                </div>
                <div className="text-slate-300">
                  <strong className="text-amber-400 block text-[11px] font-mono uppercase mb-0.5">Gaps / Opportunities:</strong>
                  <span>{comp.weaknesses}</span>
                </div>
              </div>

              {/* Grounded snippet */}
              <div className="p-2 rounded bg-[#070B14] border border-slate-800 text-[11px] text-slate-400 font-mono">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Evidence Grounding:</span>
                <p className="italic">"{comp.evidenceGrounding}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Launch Copy Variations with 1-Click Copy Buttons */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Launch Copy Variations (3 Formats)
        </h3>

        {/* Variation A: HackerNews / ProductHunt */}
        <div className="p-4 rounded-xl bg-[#0F1626] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs font-mono font-bold border border-orange-500/40">
                Variation A: Hacker News / Product Hunt
              </span>
              <span className="text-xs text-slate-400">Developer & Technical Community Launch</span>
            </div>

            <button
              onClick={() => copyToClipboard(kit.copyVariations.hackerNews, 'hn')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all"
            >
              {copiedKey === 'hn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'hn' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-3 rounded-lg bg-[#070B14] border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {kit.copyVariations.hackerNews}
          </pre>
        </div>

        {/* Variation B: Enterprise Pitch */}
        <div className="p-4 rounded-xl bg-[#0F1626] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-mono font-bold border border-blue-500/40">
                Variation B: Enterprise Executive Pitch
              </span>
              <span className="text-xs text-slate-400">Corporate Strategy & M&A Due Diligence</span>
            </div>

            <button
              onClick={() => copyToClipboard(kit.copyVariations.enterprise, 'ent')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all"
            >
              {copiedKey === 'ent' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'ent' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-3 rounded-lg bg-[#070B14] border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {kit.copyVariations.enterprise}
          </pre>
        </div>

        {/* Variation C: Viral Social Thread */}
        <div className="p-4 rounded-xl bg-[#0F1626] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-mono font-bold border border-purple-500/40">
                Variation C: Social Viral Thread
              </span>
              <span className="text-xs text-slate-400">Twitter / X / LinkedIn Multi-Part Post</span>
            </div>

            <button
              onClick={() => copyToClipboard(kit.copyVariations.socialThread, 'social')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all"
            >
              {copiedKey === 'social' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'social' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-3 rounded-lg bg-[#070B14] border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {kit.copyVariations.socialThread}
          </pre>
        </div>
      </div>
    </div>
  );
};
