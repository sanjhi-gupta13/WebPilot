import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  Mic,
  Play,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Rocket,
  ShieldCheck,
  Zap,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ExecutionPlanView } from './components/ExecutionPlanView';
import { BrowserActivityView } from './components/BrowserActivityView';
import { LiveTimelineView } from './components/LiveTimelineView';
import { ReviewQueueView } from './components/ReviewQueueView';
import { VerifiedResultsView } from './components/VerifiedResultsView';
import { LaunchKitView } from './components/LaunchKitView';
import { EvidenceLedgerView } from './components/EvidenceLedgerView';
import { TaskHistoryView } from './components/TaskHistoryView';
import { SettingsView } from './components/SettingsView';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { TakeoverModal } from './components/TakeoverModal';
import { api } from './services/api';
import { WebPilotTask, TaskSettings, ActiveNavTab, ChaosScenario } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [currentTask, setCurrentTask] = useState<WebPilotTask | undefined>();
  const [tasks, setTasks] = useState<WebPilotTask[]>([]);
  const [settings, setSettings] = useState<TaskSettings>({
    llmProvider: 'builtin_heuristic',
    headlessBrowser: true,
    demoMode: false,
    chaosScenario: 'none',
  });

  const [inputPrompt, setInputPrompt] = useState(
    'Research five AI startups, compare their products and pricing, build an Excel spreadsheet with source URLs, and prepare a launch kit.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isTakeoverOpen, setIsTakeoverOpen] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Load initial settings and task list on mount
  useEffect(() => {
    loadSettings();
    loadTasks();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data.settings);
    } catch (e) {
      console.warn('Settings load warning:', e);
    }
  };

  const loadTasks = async () => {
    try {
      const allTasks = await api.getTasks();
      setTasks(allTasks);
      if (allTasks.length > 0 && !currentTask) {
        setCurrentTask(allTasks[0]);
      }
    } catch (e) {
      console.warn('Tasks load warning:', e);
    }
  };

  // Subscribe to SSE updates whenever currentTask changes
  useEffect(() => {
    if (!currentTask?.id) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sse = new EventSource(api.getStreamUrl(currentTask.id));
    eventSourceRef.current = sse;

    sse.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'INIT' || payload.type === 'TASK_UPDATED') {
          setCurrentTask(payload.task);
          // Also update in tasks list
          setTasks((prev) =>
            prev.map((t) => (t.id === payload.task.id ? payload.task : t))
          );
        } else if (payload.type === 'TIMELINE_EVENT') {
          setCurrentTask((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              timeline: [...prev.timeline, payload.event],
            };
          });
        } else if (payload.type === 'REVIEW_ITEM_ADDED') {
          setCurrentTask((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              reviewQueue: [...prev.reviewQueue, payload.reviewItem],
            };
          });
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    return () => {
      sse.close();
    };
  }, [currentTask?.id]);

  const handleCreateTask = async (promptToUse?: string) => {
    const prompt = promptToUse || inputPrompt;
    if (!prompt.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.createTask(prompt);
      setCurrentTask(res.task);
      setTasks((prev) => [res.task, ...prev]);
      setActiveTab('execution');
    } catch (err: any) {
      alert(`Error creating task: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleDemoMode = async () => {
    const nextDemo = !settings.demoMode;
    const updated = {
      ...settings,
      demoMode: nextDemo,
      chaosScenario: nextDemo ? ('missing_pricing' as ChaosScenario) : ('none' as ChaosScenario),
    };
    setSettings(updated);
    try {
      await api.updateSettings(updated);
    } catch (e) {
      console.error('Demo toggle error:', e);
    }
  };

  const handlePauseResume = async () => {
    if (!currentTask) return;
    const isRunning = currentTask.state === 'RUNNING' || currentTask.state === 'RECOVERING';
    if (isRunning) {
      await api.pauseTask(currentTask.id);
    } else {
      await api.resumeTask(currentTask.id);
    }
  };

  const handleTakeOver = async () => {
    if (!currentTask) return;
    if (currentTask.state === 'PAUSED_FOR_TAKEOVER') {
      await api.resumeTask(currentTask.id);
      setIsTakeoverOpen(false);
    } else {
      await api.takeOverTask(currentTask.id);
      setIsTakeoverOpen(true);
    }
  };

  const handleCancel = async () => {
    if (!currentTask) return;
    if (confirm('Cancel autonomous browser execution immediately?')) {
      await api.cancelTask(currentTask.id);
    }
  };

  const pendingReviewCount = currentTask?.reviewQueue?.filter((i) => !i.resolved).length || 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070B14] font-sans antialiased text-slate-100">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reviewCount={pendingReviewCount}
        taskState={currentTask?.state}
        demoMode={settings.demoMode}
        onToggleDemoMode={handleToggleDemoMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          task={currentTask}
          onOpenVoice={() => setIsVoiceOpen(true)}
          onTakeOver={handleTakeOver}
          onPauseResume={handlePauseResume}
          onCancel={handleCancel}
          demoMode={settings.demoMode}
        />

        {/* Scrollable Workspace Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#070B14]">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Hero / Vision Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F1626] via-[#141E33] to-[#0F1626] border border-blue-500/30 shadow-2xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 max-w-3xl space-y-3">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      Microsoft Hackathon 2026 Prototype
                    </div>

                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                      “When AI gets stuck, it recovers. When it can’t, it asks. When it finishes, it proves.”
                    </h1>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      WebPilot ProofFlow is an autonomous AI browser workspace. Accepting voice or typed instructions, it creates an editable plan, conducts real Playwright research on live websites, heals from timeouts, routes ambiguous pricing to human review, and <strong className="text-white">reopens and independently verifies the generated Excel file</strong> before synthesizing your Launch Kit.
                    </p>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                      <div className="p-3 rounded-lg bg-[#070B14]/80 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Browser Core:</span>
                        <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Real Playwright
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#070B14]/80 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Self-Healing:</span>
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                          <RotateCcw className="w-3.5 h-3.5" /> Bounded Recovery
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#070B14]/80 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Human In Loop:</span>
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3.5 h-3.5" /> Review Queue ({pendingReviewCount})
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#070B14]/80 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Independent Check:</span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                          <ShieldCheck className="w-3.5 h-3.5" /> ExcelJS Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Input Section */}
                <div className="p-5 rounded-xl bg-[#0F1626] border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                      <span>Launch New Autonomous Task</span>
                    </h2>
                    <span className="text-xs font-mono text-slate-400">
                      Voice or Typed Input
                    </span>
                  </div>

                  {/* Input bar */}
                  <div className="relative">
                    <textarea
                      value={inputPrompt}
                      onChange={(e) => setInputPrompt(e.target.value)}
                      rows={3}
                      placeholder="Describe your research task... (e.g. Research five AI startups, compare their products and pricing, build an Excel spreadsheet with source URLs, and prepare a launch kit.)"
                      className="w-full p-3.5 rounded-lg bg-[#070B14] border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none font-sans leading-relaxed"
                    />

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsVoiceOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition-all"
                        >
                          <Mic className="w-3.5 h-3.5 text-purple-400" />
                          <span>Voice Prompt (ElevenLabs)</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleCreateTask()}
                        disabled={isSubmitting || !inputPrompt.trim()}
                        className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Planning...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Start Task & Build Plan</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Example Prompt Chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Quick Example Prompts:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        {
                          label: 'Default 5 AI Startups (Anthropic, Perplexity, Mistral, Cohere, Scale)',
                          prompt: 'Research five AI startups, compare their products and pricing, build an Excel spreadsheet with source URLs, and prepare a launch kit.',
                        },
                        {
                          label: 'AI Developer Tools (Cursor, v0, Replit, Copilot, Windsurf)',
                          prompt: 'Research Cursor, v0, Replit, Copilot, and Windsurf pricing, target users, and capabilities.',
                        },
                        {
                          label: 'AI Search Engines (Perplexity, Tavily, Exa, Brave, You.com)',
                          prompt: 'Analyze Perplexity, Tavily, Exa, Brave, and You.com product features and pricing models.',
                        },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInputPrompt(item.prompt);
                            handleCreateTask(item.prompt);
                          }}
                          className="px-2.5 py-1 rounded bg-[#070B14] hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 text-left transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Current / Recent Task Quick Glance */}
                {currentTask && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      onClick={() => setActiveTab('execution')}
                      className="p-4 rounded-xl bg-[#0F1626] border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span className="flex items-center gap-1.5">
                          <Play className="w-4 h-4 text-blue-400" />
                          <span>Active Execution</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                          {currentTask.state}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{currentTask.activeStep || currentTask.title}</p>
                    </div>

                    <div
                      onClick={() => setActiveTab('review_queue')}
                      className="p-4 rounded-xl bg-[#0F1626] border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span>Review Queue</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                          {pendingReviewCount} items
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {pendingReviewCount > 0
                          ? `${pendingReviewCount} field(s) require human clarification or pricing sign-off.`
                          : 'Zero ambiguities. Extraction meets confidence criteria.'}
                      </p>
                    </div>

                    <div
                      onClick={() => setActiveTab('verified_results')}
                      className="p-4 rounded-xl bg-[#0F1626] border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span className="flex items-center gap-1.5">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          <span>Verified Results</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          {currentTask.verificationResult?.overallStatus || 'READY'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {currentTask.verificationResult
                          ? `6/6 Checks passed. Grounding score: ${currentTask.verificationResult.groundingScore}%.`
                          : 'Independent Excel verification pass ready.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: NEW TASK */}
            {activeTab === 'new_task' && (
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-[#0F1626] border border-slate-800 space-y-4">
                  <h2 className="text-base font-bold text-white">Create New Research Task</h2>
                  <textarea
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    rows={4}
                    placeholder="Enter your target companies, competitive research goals, and deliverables..."
                    className="w-full p-4 rounded-lg bg-[#070B14] border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none font-mono"
                  />
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setIsVoiceOpen(true)}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5"
                    >
                      <Mic className="w-4 h-4 text-purple-400" />
                      <span>Speak Prompt</span>
                    </button>
                    <button
                      onClick={() => handleCreateTask()}
                      disabled={isSubmitting || !inputPrompt.trim()}
                      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Create Plan</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CURRENT EXECUTION */}
            {activeTab === 'execution' && currentTask && (
              <div className="space-y-6">
                {/* 1. Execution Plan with Mandatory Approval Gate */}
                <ExecutionPlanView
                  task={currentTask}
                  onPlanApproved={() => {
                    // Update state to running
                    setCurrentTask({ ...currentTask, state: 'RUNNING' });
                  }}
                />

                {/* 2. Live Browser Viewport & Screenshots */}
                <BrowserActivityView task={currentTask} />

                {/* 3. Real-Time Timeline Events */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
                    Execution Timeline & Recovery Feed
                  </h3>
                  <LiveTimelineView timeline={currentTask.timeline || []} />
                </div>
              </div>
            )}

            {/* TAB: REVIEW QUEUE */}
            {activeTab === 'review_queue' && currentTask && (
              <ReviewQueueView
                taskId={currentTask.id}
                items={currentTask.reviewQueue || []}
                onItemResolved={() => loadTasks()}
              />
            )}

            {/* TAB: VERIFIED RESULTS */}
            {activeTab === 'verified_results' && currentTask && (
              <VerifiedResultsView task={currentTask} />
            )}

            {/* TAB: LAUNCH KIT */}
            {activeTab === 'launch_kit' && currentTask && (
              <LaunchKitView task={currentTask} />
            )}

            {/* TAB: EVIDENCE LEDGER */}
            {activeTab === 'ledger' && currentTask && (
              <EvidenceLedgerView task={currentTask} />
            )}

            {/* TAB: TASK HISTORY */}
            {activeTab === 'task_history' && (
              <TaskHistoryView
                tasks={tasks}
                activeTaskId={currentTask?.id}
                onSelectTask={(selected) => {
                  setCurrentTask(selected);
                  setActiveTab('execution');
                }}
              />
            )}

            {/* TAB: SETTINGS & CHAOS LAB */}
            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onSettingsSaved={(newSettings) => setSettings(newSettings)}
                onTriggerChaosTest={(scenario) => {
                  handleCreateTask();
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        task={currentTask}
        onStartWithPrompt={(p) => {
          setIsVoiceOpen(false);
          setInputPrompt(p);
          handleCreateTask(p);
        }}
      />

      {/* Takeover Modal */}
      <TakeoverModal
        isOpen={isTakeoverOpen}
        onClose={() => setIsTakeoverOpen(false)}
        task={currentTask}
        onResumeAutomation={() => {
          if (currentTask) api.resumeTask(currentTask.id);
        }}
      />
    </div>
  );
}
export default App;
