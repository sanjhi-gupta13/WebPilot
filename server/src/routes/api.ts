import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { storage } from '../ledger/storage';
import { generateInitialPlan } from '../agent/planner';
import { browserEngine } from '../agent/browser';
import { verificationEngine } from '../agent/verification';
import { launchKitGenerator } from '../agent/launchkit';
import { elevenLabsService } from '../agent/elevenlabs';
import { DEFAULT_SETTINGS, ARTIFACTS_DIR } from '../config';
import { WebPilotTask, TaskSettings } from '../types';

export const apiRouter = Router();

let currentSettings: TaskSettings = { ...DEFAULT_SETTINGS };

// GET /api/settings
apiRouter.get('/settings', (req: Request, res: Response) => {
  res.json({
    settings: currentSettings,
    services: {
      playwright: true,
      exceljs: true,
      elevenLabs: !!(currentSettings.elevenLabsApiKey && currentSettings.elevenLabsAgentId),
      llmProvider: currentSettings.llmProvider,
    },
  });
});

// POST /api/settings
apiRouter.post('/settings', (req: Request, res: Response) => {
  const {
    llmProvider,
    apiKey,
    elevenLabsApiKey,
    elevenLabsAgentId,
    headlessBrowser,
    demoMode,
    chaosScenario,
  } = req.body;

  if (llmProvider) currentSettings.llmProvider = llmProvider;
  if (apiKey !== undefined) currentSettings.apiKey = apiKey;
  if (elevenLabsApiKey !== undefined) currentSettings.elevenLabsApiKey = elevenLabsApiKey;
  if (elevenLabsAgentId !== undefined) currentSettings.elevenLabsAgentId = elevenLabsAgentId;
  if (headlessBrowser !== undefined) currentSettings.headlessBrowser = headlessBrowser;
  if (demoMode !== undefined) currentSettings.demoMode = demoMode;
  if (chaosScenario !== undefined) currentSettings.chaosScenario = chaosScenario;

  res.json({ success: true, settings: currentSettings });
});

// POST /api/tasks - Create task from text or voice
apiRouter.post('/tasks', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const taskPrompt =
      prompt ||
      'Research five AI startups, compare their products and pricing, build an Excel spreadsheet with source URLs, and prepare a launch kit.';

    const taskId = crypto.randomUUID();
    const { steps, targetCompanies } = generateInitialPlan(taskPrompt);

    const newTask: WebPilotTask = {
      id: taskId,
      title: taskPrompt.length > 60 ? `${taskPrompt.substring(0, 57)}...` : taskPrompt,
      prompt: taskPrompt,
      state: 'PLANNED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: steps,
      companies: [],
      reviewQueue: [],
      timeline: [
        {
          id: crypto.randomUUID(),
          taskId,
          timestamp: new Date().toISOString(),
          type: 'INFO',
          status: 'info',
          message: `Task initialized: "${taskPrompt}"`,
        },
        {
          id: crypto.randomUUID(),
          taskId,
          timestamp: new Date().toISOString(),
          type: 'INFO',
          status: 'info',
          message: `Generated 8-step execution plan for 5 target companies (${targetCompanies.map((c) => c.name).join(', ')}). Awaiting user approval.`,
        },
      ],
      ledger: [],
      settings: { ...currentSettings },
      activeStep: 'Execution plan generated. Awaiting approval.',
    };

    storage.saveTask(newTask);
    res.status(201).json({ success: true, task: newTask, targetCompanies });
  } catch (error: any) {
    console.error('Task creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tasks - List all tasks
apiRouter.get('/tasks', (req: Request, res: Response) => {
  const all = storage.getAllTasks();
  res.json({ tasks: all });
});

// GET /api/tasks/:id - Get task details
apiRouter.get('/tasks/:id', (req: Request, res: Response) => {
  const task = storage.getTask(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ task });
});

// GET /api/tasks/:id/stream - SSE real-time event updates
apiRouter.get('/tasks/:id/stream', (req: Request, res: Response) => {
  const taskId = req.params.id;
  const task = storage.getTask(taskId);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send current task snapshot immediately
  if (task) {
    res.write(`data: ${JSON.stringify({ type: 'INIT', task })}\n\n`);
  }

  const unsubscribe = storage.subscribe(taskId, (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });

  req.on('close', () => {
    unsubscribe();
  });
});

// PUT /api/tasks/:id/plan - Update/edit execution plan
apiRouter.put('/tasks/:id/plan', (req: Request, res: Response) => {
  const task = storage.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { plan } = req.body;
  if (!Array.isArray(plan)) {
    return res.status(400).json({ error: 'Plan must be an array of steps' });
  }

  task.plan = plan;
  storage.addTimelineEvent(task.id, {
    type: 'INFO',
    status: 'info',
    message: 'User modified execution plan steps.',
  });
  storage.saveTask(task);

  res.json({ success: true, plan: task.plan });
});

// Helper to execute task lifecycle
async function runTaskLifecycle(task: WebPilotTask) {
  try {
    const { targetCompanies } = generateInitialPlan(task.prompt);

    storage.updateTaskState(task.id, 'RUNNING');
    task.plan.forEach((s) => {
      if (s.order <= 2) s.status = 'active';
    });
    storage.saveTask(task);

    // 1. Playwright automation with recovery (only if companies not yet fetched)
    if (task.companies.length < targetCompanies.length) {
      const browserResult = await browserEngine.executeTask(task, targetCompanies);
      if (browserResult.aborted) {
        storage.updateTaskState(task.id, 'CANCELLED', 'Aborted by user request');
        return;
      }
      task.companies = browserResult.companies;
    }

    // Check if unresolved review items exist
    const unresolvedReviews = task.reviewQueue.filter((r) => !r.resolved);
    if (unresolvedReviews.length > 0) {
      storage.updateTaskState(task.id, 'NEEDS_REVIEW', `${unresolvedReviews.length} items require human review.`);
      return;
    }

    // 2. Generate Excel Workbook
    storage.updateTaskState(task.id, 'VERIFYING');
    task.activeStep = 'Generating Excel intelligence workbook with ExcelJS...';
    storage.saveTask(task);

    const excelPath = await verificationEngine.generateWorkbook(task);

    // 3. Independent Verification Pass (Reopens workbook from disk)
    task.activeStep = 'Reopening workbook from disk for independent verification pass...';
    storage.saveTask(task);

    const verificationResult = await verificationEngine.verifyWorkbook(task, excelPath);
    task.verificationResult = verificationResult;
    storage.saveTask(task);

    if (verificationResult.overallStatus === 'FAILED') {
      storage.updateTaskState(task.id, 'FAILED', 'Workbook failed independent verification checks.');
      return;
    }

    // 4. Synthesize Launch Kit
    task.activeStep = 'Synthesizing verified Launch Kit and battle cards...';
    storage.saveTask(task);

    const { kit } = launchKitGenerator.generate(task);
    task.launchKit = kit;

    // Complete all plan steps
    task.plan.forEach((s) => (s.status = 'completed'));
    task.activeStep = 'All steps completed and verified.';
    storage.updateTaskState(task.id, 'COMPLETED');
    storage.saveTask(task);

    storage.addTimelineEvent(task.id, {
      type: 'SUCCESS',
      status: 'verified',
      message: `Task completed successfully! ${verificationResult.summary}`,
    });
  } catch (err: any) {
    console.error('Lifecycle execution error:', err);
    storage.updateTaskState(task.id, 'FAILED', err.message);
  }
}

// POST /api/tasks/:id/approve-plan - Explicit on-screen human approval gate
apiRouter.post('/tasks/:id/approve-plan', async (req: Request, res: Response) => {
  const task = storage.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  storage.addTimelineEvent(task.id, {
    type: 'APPROVAL',
    status: 'verified',
    message: 'Explicit user approval received on-screen. Authorizing browser automation execution.',
  });

  // Run lifecycle asynchronously
  runTaskLifecycle(task);

  res.json({ success: true, message: 'Plan approved. Execution running.' });
});

// POST /api/tasks/:id/start - Direct start (or restart)
apiRouter.post('/tasks/:id/start', async (req: Request, res: Response) => {
  const task = storage.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  runTaskLifecycle(task);
  res.json({ success: true, message: 'Execution initiated.' });
});

// POST /api/tasks/:id/pause - Pause execution
apiRouter.post('/tasks/:id/pause', (req: Request, res: Response) => {
  const task = storage.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  browserEngine.pause();
  storage.updateTaskState(task.id, 'NEEDS_REVIEW', 'Paused by user');
  res.json({ success: true, message: 'Task paused' });
});

// POST /api/tasks/:id/takeover - Human manual takeover
apiRouter.post('/tasks/:id/takeover', (req: Request, res: Response) => {
  const task = storage.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  browserEngine.pause();
  storage.updateTaskState(task.id, 'PAUSED_FOR_TAKEOVER', 'Automation paused for manual control');
  storage.addTimelineEvent(task.id, {
    type: 'INFO',
    status: 'needs_review',
    message: 'Human Takeover initiated. Automation suspended; awaiting user manual adjustments.',
  });

  res.json({ success: true, message: 'Human Takeover active.' });
});

// POST /api/tasks/:id/resume - Resume automation
apiRouter.post('/tasks/:id/resume', (req: Request, res: Response) => {
  const task = storage.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  browserEngine.resume();
  storage.updateTaskState(task.id, 'RUNNING', 'Resumed by user');
  storage.addTimelineEvent(task.id, {
    type: 'INFO',
    status: 'info',
    message: 'Resuming autonomous browser execution...',
  });

  // If paused after review queue, re-run remaining steps (verification & launchkit)
  if (task.companies.length >= 5 && (!task.verificationResult || task.verificationResult.overallStatus !== 'PASSED')) {
    runTaskLifecycle(task);
  }

  res.json({ success: true, message: 'Execution resumed.' });
});

// POST /api/tasks/:id/cancel - Instant abort
apiRouter.post('/tasks/:id/cancel', (req: Request, res: Response) => {
  const task = storage.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  browserEngine.cancel();
  storage.updateTaskState(task.id, 'CANCELLED', 'User requested immediate termination');
  res.json({ success: true, message: 'Task cancelled.' });
});

// POST /api/tasks/:id/review/:itemId - Resolve Review Queue item
apiRouter.post('/tasks/:id/review/:itemId', async (req: Request, res: Response) => {
  const { id, itemId } = req.params;
  const { resolutionType, resolutionValue } = req.body;

  const resolvedItem = storage.resolveReviewItem(id, itemId, resolutionType, resolutionValue);
  if (!resolvedItem) {
    return res.status(404).json({ error: 'Review item not found' });
  }

  const task = storage.getTask(id);
  if (task && task.reviewQueue.every((r) => r.resolved)) {
    // If all reviews resolved, continue pipeline!
    runTaskLifecycle(task);
  }

  res.json({ success: true, item: resolvedItem });
});

// POST /api/tasks/:id/verify - Force re-verification
apiRouter.post('/tasks/:id/verify', async (req: Request, res: Response) => {
  const task = storage.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const excelPath = await verificationEngine.generateWorkbook(task);
  const verificationResult = await verificationEngine.verifyWorkbook(task, excelPath);
  task.verificationResult = verificationResult;

  if (verificationResult.overallStatus === 'PASSED') {
    const { kit } = launchKitGenerator.generate(task);
    task.launchKit = kit;
    storage.updateTaskState(task.id, 'COMPLETED');
  } else {
    storage.updateTaskState(task.id, 'FAILED');
  }

  storage.saveTask(task);
  res.json({ success: true, verificationResult });
});

// GET /api/tasks/:id/download/excel - Download verified Excel file
apiRouter.get('/tasks/:id/download/excel', (req: Request, res: Response) => {
  const task = storage.getTask(req.params.id);
  if (!task) return res.status(404).send('Task not found');

  const fileName = `webpilot-proof-${task.id.substring(0, 8)}.xlsx`;
  const filePath = path.join(ARTIFACTS_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Excel workbook artifact not found. Please run verification first.');
  }

  res.download(filePath, fileName);
});

// GET /api/tasks/:id/download/launchkit - Download Launch Kit markdown
apiRouter.get('/tasks/:id/download/launchkit', (req: Request, res: Response) => {
  const task = storage.getTask(req.params.id);
  if (!task) return res.status(404).send('Task not found');

  const fileName = `webpilot-launchkit-${task.id.substring(0, 8)}.md`;
  const filePath = path.join(ARTIFACTS_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Launch Kit markdown artifact not found.');
  }

  res.download(filePath, fileName);
});

// GET /api/tasks/:id/download/evidence - Download Evidence Ledger JSON
apiRouter.get('/tasks/:id/download/evidence', (req: Request, res: Response) => {
  const task = storage.getTask(req.params.id);
  if (!task) return res.status(404).send('Task not found');

  const fileName = `webpilot-ledger-${task.id.substring(0, 8)}.json`;
  const data = JSON.stringify(
    {
      taskId: task.id,
      prompt: task.prompt,
      state: task.state,
      verificationResult: task.verificationResult,
      ledger: task.ledger,
      timeline: task.timeline,
      reviewQueue: task.reviewQueue,
    },
    null,
    2
  );

  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});

// POST /api/voice/command - Process incoming voice command with strict safety gate
apiRouter.post('/voice/command', (req: Request, res: Response) => {
  const { transcript, taskId } = req.body;
  const task = taskId ? storage.getTask(taskId) : undefined;

  const result = elevenLabsService.processVoiceCommand(transcript || '', task);

  // If command was CANCEL, trigger cancellation
  if (result.action === 'CANCEL' && task) {
    browserEngine.cancel();
    storage.updateTaskState(task.id, 'CANCELLED', 'Voice command cancelled execution');
  }

  res.json({ success: true, result });
});

// GET /api/voice/session - ElevenLabs session details
apiRouter.get('/voice/session', async (req: Request, res: Response) => {
  const session = await elevenLabsService.getAgentSession(
    currentSettings.elevenLabsApiKey,
    currentSettings.elevenLabsAgentId
  );
  res.json(session);
});
