import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
// On Render, DATA_DIR env var points to the persistent disk mount (/opt/render/project/src/data).
// Locally it falls back to the project-root /data directory.
export const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
export const TASKS_DIR = path.join(DATA_DIR, 'tasks');
export const ARTIFACTS_DIR = path.join(DATA_DIR, 'artifacts');
export const SCREENSHOTS_DIR = path.join(DATA_DIR, 'screenshots');

// Ensure storage directories exist
[DATA_DIR, TASKS_DIR, ARTIFACTS_DIR, SCREENSHOTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export const DEFAULT_SETTINGS = {
  llmProvider: (process.env.LLM_PROVIDER as any) || 'builtin_heuristic',
  apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY || '',
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
  elevenLabsAgentId: process.env.ELEVENLABS_AGENT_ID || '',
  headlessBrowser: process.env.HEADLESS !== 'false',
  demoMode: false,
  chaosScenario: 'none' as const,
};
