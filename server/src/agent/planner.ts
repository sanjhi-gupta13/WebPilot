import crypto from 'crypto';
import { PlanStep, CompanyResearchData } from '../types';

export interface PlannedTask {
  steps: PlanStep[];
  targetCompanies: Array<{ name: string; url: string; fallbackUrl?: string }>;
}

export function generateInitialPlan(prompt: string): PlannedTask {
  const defaultCompanies = [
    { name: 'Anthropic', url: 'https://www.anthropic.com', fallbackUrl: 'https://en.wikipedia.org/wiki/Anthropic' },
    { name: 'Perplexity', url: 'https://www.perplexity.ai', fallbackUrl: 'https://en.wikipedia.org/wiki/Perplexity_AI' },
    { name: 'Mistral AI', url: 'https://mistral.ai', fallbackUrl: 'https://en.wikipedia.org/wiki/Mistral_AI' },
    { name: 'Cohere', url: 'https://cohere.com', fallbackUrl: 'https://en.wikipedia.org/wiki/Cohere' },
    { name: 'Scale AI', url: 'https://scale.com', fallbackUrl: 'https://en.wikipedia.org/wiki/Scale_AI' },
  ];

  // Detect if user provided specific named companies or wants the default 5 startups
  let targetCompanies: Array<{ name: string; url: string; fallbackUrl?: string }> = defaultCompanies;

  const isDefaultGenericPrompt = /five\s+(?:ai\s+)?startups|5\s+(?:ai\s+)?startups|top\s+ai\s+startups/i.test(prompt);
  if (!isDefaultGenericPrompt) {
    const customMatch = prompt.match(/(?:research|compare|analyze)\s+([A-Za-z0-9,\s&]+?)(?:'s|products|pricing|capabilities|and prepare|build|$)/i);
    if (customMatch && customMatch[1]) {
      const candidates = customMatch[1]
        .split(/,|\band\b/i)
        .map((s) => s.trim())
        .filter((s) => s.length > 1 && !['five', '5', 'ai', 'startups', 'the', 'their', 'compare'].includes(s.toLowerCase()));

      if (candidates.length >= 2) {
        targetCompanies = candidates.slice(0, 5).map((name) => ({
          name,
          url: `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        }));
      }
    }
  }

  const steps: PlanStep[] = [
    {
      id: crypto.randomUUID(),
      order: 1,
      title: 'Identify Target Companies',
      description: `Select 5 target AI companies (${targetCompanies.map(c => c.name).join(', ')}) for product, pricing, and positioning intelligence.`,
      status: 'pending',
      isEditable: true,
    },
    {
      id: crypto.randomUUID(),
      order: 2,
      title: 'Navigate Official Domains',
      description: 'Visit each company official web domain using Playwright browser engine with anti-bot resilience and real screenshot capture.',
      status: 'pending',
      isEditable: true,
    },
    {
      id: crypto.randomUUID(),
      order: 3,
      title: 'Extract Core Intelligence',
      description: 'Extract product descriptions, pricing tiers, target users, and exact source URLs from DOM elements.',
      status: 'pending',
      isEditable: true,
    },
    {
      id: crypto.randomUUID(),
      order: 4,
      title: 'Capture Grounded Evidence',
      description: 'Store raw text snippets, timestamps, and page screenshots in the immutable evidence ledger.',
      status: 'pending',
      isEditable: true,
    },
    {
      id: crypto.randomUUID(),
      order: 5,
      title: 'Flag Uncertainties & Ambiguities',
      description: 'Route missing pricing or unverified claims to the Human Review Queue for approval or clarification.',
      status: 'pending',
      isEditable: true,
    },
    {
      id: crypto.randomUUID(),
      order: 6,
      title: 'Generate Proof Excel Workbook',
      description: 'Generate structured .xlsx workbook with custom styling, required columns, and explicit missing-data markers.',
      status: 'pending',
      isEditable: true,
    },
    {
      id: crypto.randomUUID(),
      order: 7,
      title: 'Independent Verification Pass',
      description: 'Reopen workbook from disk in isolated verification engine; validate record count, column schemas, and evidence grounding.',
      status: 'pending',
      isEditable: true,
    },
    {
      id: crypto.randomUUID(),
      order: 8,
      title: 'Synthesize Launch Kit',
      description: 'Compile competitive landscape, product positioning, battle cards, and 3 launch-copy variations with evidence citations.',
      status: 'pending',
      isEditable: true,
    },
  ];

  return { steps, targetCompanies };
}
