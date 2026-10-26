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
  Check,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ExecutionPlanView } from './components/ExecutionPlanView';
import { BrowserActivityView } from './components/BrowserActivityView';
import { LiveTimelineView } from './components/LiveTimelineView';
import { ReviewQueueView } from './components/ReviewQueueView';
import { VerifiedResultsView } from './components/VerifiedResultsView';
import { LaunchKitView } from './components/LaunchKitView';
import { TaskHistoryView } from './components/TaskHistoryView';
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
      setActiveTab('dashboard');
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

  // Determine current lifecycle step for guided progress
  const getStepProgress = () => {
    if (!currentTask) return 1;
    if (currentTask.state === 'PLANNED' || currentTask.state === 'AWAITING_APPROVAL') return 2;
    if (currentTask.state === 'RUNNING' || currentTask.state === 'RECOVERING' || currentTask.state === 'NEEDS_REVIEW' || currentTask.state === 'PAUSED_FOR_TAKEOVER') return 3;
    if (currentTask.state === 'VERIFYING' || currentTask.state === 'COMPLETED' || currentTask.state === 'FAILED') return 4;
    return 1;
  };

  const currentStep = getStepProgress();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] font-sans antialiased text-slate-900">
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* TAB: WORKSPACE / GUIDED FLOW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* 1. Step-by-Step Guided Progress Bar */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {[
                      { step: 1, title: '1. Goal & Prompt' },
                      { step: 2, title: '2. Plan Approval' },
                      { step: 3, title: '3. Web Research' },
                      { step: 4, title: '4. Verified Proof' },
                    ].map((s) => {
                      const isPast = currentStep > s.step;
                      const isCurrent = currentStep === s.step;

                      return (
                        <div
                          key={s.step}
                          className={`p-2 rounded-xl transition-all ${
                            isCurrent
                              ? 'bg-blue-50 border border-blue-200 font-bold text-blue-700 shadow-sm'
                              : isPast
                              ? 'text-emerald-700 font-semibold'
                              : 'text-slate-400 font-normal'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            {isPast ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                  isCurrent
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {s.step}
                              </span>
                            )}
                            <span className="truncate">{s.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Needs Review Attention Banner (If any item is pending in review queue) */}
                {pendingReviewCount > 0 && (
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-amber-950">
                          Human Review Needed ({pendingReviewCount} items)
                        </h3>
                        <p className="text-xs text-amber-800 mt-0.5">
                          The AI noticed enterprise pricing gated behind a sales contact form. Review and confirm how you'd like to proceed.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('review_queue')}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all shrink-0"
                    >
                      <span>Open Review Queue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* 3. Completed State Celebratory Card */}
                {currentTask?.state === 'COMPLETED' && currentTask.verificationResult && (
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-teal-50 border border-emerald-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900">
                            Research Complete & Independently Verified!
                          </h2>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            6/6 Checks Passed
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 max-w-xl">
                          All 5 companies were researched via Playwright and verified against captured web text. The Excel workbook and Launch Kit are ready for download.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <a
                        href={api.getDownloadExcelUrl(currentTask.id)}
                        download
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Excel (.xlsx)</span>
                      </a>
                      <button
                        onClick={() => setActiveTab('launch_kit')}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20"
                      >
                        <Rocket className="w-4 h-4" />
                        <span>View Launch Kit</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Research Input Section */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        What would you like the AI to research?
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Type or speak your competitive research objective. The AI will navigate the web and independently prove its results.
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Voice or Typed Input
                    </span>
                  </div>

                  {/* Input Box */}
                  <div className="relative">
                    <textarea
                      value={inputPrompt}
                      onChange={(e) => setInputPrompt(e.target.value)}
                      rows={3}
                      placeholder="e.g. Research five AI startups, compare their products and pricing, build an Excel spreadsheet with source URLs, and prepare a launch kit."
                      className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none font-sans leading-relaxed transition-all shadow-inner"
                    />

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsVoiceOpen(true)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-all shadow-sm"
                        >
                          <Mic className="w-3.5 h-3.5 text-purple-600" />
                          <span>Speak Prompt</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleCreateTask()}
                        disabled={isSubmitting || !inputPrompt.trim()}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Building Plan...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Start Research & Build Plan</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Example Chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">
                      Quick Example Research Ideas:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        {
                          label: 'AI Startups (Anthropic, Perplexity, Mistral, Cohere, Scale)',
                          prompt: 'Research five AI startups, compare their products and pricing, build an Excel spreadsheet with source URLs, and prepare a launch kit.',
                        },
                        {
                          label: 'AI Code Assistants (Cursor, v0, Replit, Copilot, Windsurf)',
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
                          className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 border border-slate-200 text-left transition-colors shadow-sm"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Execution Plan (Only if task exists) */}
                {currentTask && (
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <ExecutionPlanView
                      task={currentTask}
                      onPlanApproved={() => {
                        setCurrentTask({ ...currentTask, state: 'RUNNING' });
                      }}
                    />
                  </div>
                )}

                {/* 6. Live Browser Activity (Only if task is running or completed) */}
                {currentTask && currentTask.state !== 'PLANNED' && (
                  <div className="space-y-6">
                    <BrowserActivityView task={currentTask} />

                    {/* Timeline */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                        Live Browser Progress & Activity Feed
                      </h3>
                      <LiveTimelineView timeline={currentTask.timeline || []} />
                    </div>
                  </div>
                )}
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

            {/* TAB: VERIFIED RESULTS & EXCEL */}
            {activeTab === 'verified_results' && currentTask && (
              <VerifiedResultsView task={currentTask} />
            )}

            {/* TAB: LAUNCH KIT */}
            {activeTab === 'launch_kit' && currentTask && (
              <LaunchKitView task={currentTask} />
            )}

            {/* TAB: TASK HISTORY */}
            {activeTab === 'task_history' && (
              <TaskHistoryView
                tasks={tasks}
                activeTaskId={currentTask?.id}
                onSelectTask={(selected) => {
                  setCurrentTask(selected);
                  setActiveTab('dashboard');
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
