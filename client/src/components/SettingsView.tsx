import React, { useState } from 'react';
import {
  Settings,
  Zap,
  ShieldAlert,
  Save,
  Check,
  Globe,
  Mic,
  Cpu,
  Flame,
} from 'lucide-react';
import { TaskSettings, ChaosScenario } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  settings: TaskSettings;
  onSettingsSaved: (newSettings: TaskSettings) => void;
  onTriggerChaosTest?: (scenario: ChaosScenario) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSettingsSaved,
  onTriggerChaosTest,
}) => {
  const [form, setForm] = useState<TaskSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateSettings(form);
      onSettingsSaved(res.settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const chaosScenarios: Array<{
    id: ChaosScenario;
    title: string;
    description: string;
    expectedOutcome: string;
  }> = [
    {
      id: 'nav_timeout',
      title: 'Navigation Timeout & Bounded Recovery',
      description: 'Simulates network lag / 3000ms timeout on target domain navigation.',
      expectedOutcome: 'Agent catches timeout, switches to secondary entrypoint, logs recovery step, continues without crash.',
    },
    {
      id: 'missing_element',
      title: 'Missing Page Element / DOM Shift',
      description: 'Simulates target pricing cards changing CSS classes or being removed.',
      expectedOutcome: 'Agent runs semantic fallback parser, inspects DOM text, and extracts signals safely.',
    },
    {
      id: 'missing_pricing',
      title: 'Missing / Gated Pricing (Review Queue Trigger)',
      description: 'Simulates pricing hidden behind an enterprise sales-contact lead wall.',
      expectedOutcome: 'Agent detects uncertainty, refuses to guess, pauses, and enqueues item into Human Review Queue.',
    },
    {
      id: 'prompt_injection',
      title: 'Adversarial Prompt Injection Defense',
      description: 'Simulates third-party website injecting malicious override commands into HTML text.',
      expectedOutcome: 'Agent security guardrail defers payload, refuses prompt override, and preserves verification truth.',
    },
    {
      id: 'force_cancel',
      title: 'Instant Task Cancellation & Resource Cleanup',
      description: 'Tests mid-execution user cancellation.',
      expectedOutcome: 'Immediately terminates Chromium instances, closes contexts, and sets state to CANCELLED cleanly.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Core AI & Browser Config */}
        <div className="p-5 rounded-xl bg-[#0F1626] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>AI Planning & Browser Automation Engine</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* LLM Provider */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">LLM Planner Provider</label>
              <select
                value={form.llmProvider}
                onChange={(e) => setForm({ ...form, llmProvider: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-[#070B14] border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="builtin_heuristic">Built-in Deterministic AI Engine (Zero-Config Hackathon Default)</option>
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                <option value="gemini">Google Gemini 2.0 / 1.5 Pro</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Built-in engine works 100% offline without needing API keys.
              </p>
            </div>

            {/* Optional LLM API Key */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">LLM API Key (Optional)</label>
              <input
                type="password"
                value={form.apiKey || ''}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-3 py-2 rounded-lg bg-[#070B14] border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Kept strictly server-side in environment storage.
              </p>
            </div>
          </div>

          {/* Browser Mode Toggle */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Headless Playwright Browser</span>
              <p className="text-[11px] text-slate-400">
                Toggle off to watch the real Chromium browser window navigate live on your screen during execution.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, headlessBrowser: !form.headlessBrowser })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                form.headlessBrowser ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.headlessBrowser ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* ElevenLabs Voice Configuration */}
        <div className="p-5 rounded-xl bg-[#0F1626] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Mic className="w-4 h-4 text-purple-400" />
            <span>ElevenLabs Voice Integration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">ElevenLabs API Key</label>
              <input
                type="password"
                value={form.elevenLabsApiKey || ''}
                onChange={(e) => setForm({ ...form, elevenLabsApiKey: e.target.value })}
                placeholder="xi-..."
                className="w-full px-3 py-2 rounded-lg bg-[#070B14] border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">ElevenLabs Agent ID</label>
              <input
                type="text"
                value={form.elevenLabsAgentId || ''}
                onChange={(e) => setForm({ ...form, elevenLabsAgentId: e.target.value })}
                placeholder="e.g. agent_xyz..."
                className="w-full px-3 py-2 rounded-lg bg-[#070B14] border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            If ElevenLabs credentials are omitted, ProofFlow gracefully uses browser speech synthesis. Voice agent approval of consequential actions is strictly forbidden by policy.
          </p>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Demo Mode & Chaos Switch Lab (Section 9 Requirement) */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/30 via-[#0F1626] to-slate-900 border border-amber-500/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Hackathon Chaos Switch & Fault Injection Lab</h3>
              <p className="text-xs text-slate-400">
                Controlled test scenarios to demonstrate bounded self-healing recovery, review queue triage, and prompt injection defense.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
            CONTROLLED CHAOS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {chaosScenarios.map((sc) => {
            const isSelected = form.chaosScenario === sc.id;

            return (
              <div
                key={sc.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-amber-950/30 border-amber-500 shadow-glow-sm'
                    : 'bg-[#070B14] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-slate-200">{sc.title}</h4>
                  <button
                    onClick={() => {
                      setForm({ ...form, demoMode: true, chaosScenario: sc.id });
                      api.updateSettings({ demoMode: true, chaosScenario: sc.id }).then((r) => {
                        onSettingsSaved(r.settings);
                        if (onTriggerChaosTest) onTriggerChaosTest(sc.id);
                      });
                    }}
                    className={`text-[11px] font-mono px-2 py-1 rounded transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isSelected ? 'Active' : 'Arm Scenario'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed font-sans">
                  {sc.description}
                </p>

                <div className="text-[10px] font-mono text-amber-300/90 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                  <span className="font-semibold block uppercase">Demonstrates:</span>
                  {sc.expectedOutcome}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
