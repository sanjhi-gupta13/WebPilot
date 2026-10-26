export type TaskState =
  | 'DRAFT'
  | 'PLANNED'
  | 'AWAITING_APPROVAL'
  | 'RUNNING'
  | 'RECOVERING'
  | 'NEEDS_REVIEW'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'PAUSED_FOR_TAKEOVER';

export interface PlanStep {
  id: string;
  order: number;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'skipped';
  isEditable?: boolean;
}

export interface CompanyResearchData {
  id: string;
  companyName: string;
  productDescription: string;
  pricing: string;
  targetUsers: string;
  officialWebsite: string;
  pricingSourceUrl: string;
  productSourceUrl: string;
  capturedEvidence: string;
  screenshotUrl?: string;
  verificationStatus: 'VERIFIED' | 'NEEDS_REVIEW' | 'FAILED' | 'RECOVERED';
  missingFields: string[];
  notes: string;
  confidenceScore: number;
  recoveryAttempts?: number;
}

export type ReviewResolutionType =
  | 'CORRECTED'
  | 'APPROVED'
  | 'RETRIED'
  | 'MARKED_UNAVAILABLE'
  | 'SKIPPED';

export interface ReviewItem {
  id: string;
  taskId: string;
  companyName: string;
  field: string;
  currentValue: string;
  sourceUrl: string;
  capturedEvidence: string;
  reason: string;
  suggestedAction: string;
  resolved: boolean;
  resolutionType?: ReviewResolutionType;
  resolutionValue?: string;
  resolvedAt?: string;
}

export type EventStatus = 'verified' | 'recovered' | 'failed' | 'needs_review' | 'info';

export interface TimelineEvent {
  id: string;
  taskId: string;
  timestamp: string;
  stepIndex?: number;
  type: 'INFO' | 'ACTION' | 'RECOVERY' | 'REVIEW' | 'VERIFICATION' | 'APPROVAL' | 'ERROR' | 'SUCCESS';
  status: EventStatus;
  message: string;
  companyName?: string;
  sourceUrl?: string;
  screenshotUrl?: string;
  details?: Record<string, any>;
}

export interface EvidenceLedgerEntry {
  id: string;
  taskId: string;
  timestamp: string;
  action: string;
  companyName?: string;
  sourceUrl: string;
  capturedText: string;
  screenshotUrl?: string;
  status: string;
  recoveryAttempts: number;
  humanDecisions?: string;
  hash: string;
}

export interface VerificationCheck {
  name: string;
  category: 'RECORD_COUNT' | 'REQUIRED_COLUMNS' | 'MISSING_DATA_MARKERS' | 'SOURCE_URLS' | 'EVIDENCE_GROUNDING' | 'CONSISTENCY';
  status: 'PASSED' | 'FAILED' | 'WARNING';
  details: string;
  evidenceReference?: string;
}

export interface VerificationResult {
  taskId: string;
  timestamp: string;
  overallStatus: 'PASSED' | 'FAILED';
  expectedRecordCount: number;
  actualRecordCount: number;
  checks: VerificationCheck[];
  groundingScore: number; // 0 to 100
  missingFieldsCount: number;
  excelFileName: string;
  excelFileSize: number;
  ledgerChecksum: string;
  summary: string;
}

export interface LaunchKitCompetitor {
  company: string;
  pricing: string;
  strengths: string;
  weaknesses: string;
  sourceUrl: string;
  evidenceGrounding: string;
}

export interface LaunchKit {
  taskId: string;
  generatedAt: string;
  productPositioning: string;
  marketLandscape: string;
  competitorComparison: LaunchKitCompetitor[];
  targetAudience: string[];
  keyDifferentiators: string[];
  marketingHeadline: string;
  productDescription: string;
  copyVariations: {
    hackerNews: string;
    enterprise: string;
    socialThread: string;
  };
  markdownContent: string;
}

export type ChaosScenario =
  | 'none'
  | 'nav_timeout'
  | 'missing_element'
  | 'missing_pricing'
  | 'prompt_injection'
  | 'voice_failure'
  | 'force_cancel';

export interface TaskSettings {
  llmProvider: 'builtin_heuristic' | 'openai' | 'anthropic' | 'gemini';
  apiKey?: string;
  elevenLabsApiKey?: string;
  elevenLabsAgentId?: string;
  headlessBrowser: boolean;
  demoMode: boolean;
  chaosScenario: ChaosScenario;
}

export interface WebPilotTask {
  id: string;
  title: string;
  prompt: string;
  state: TaskState;
  createdAt: string;
  updatedAt: string;
  plan: PlanStep[];
  companies: CompanyResearchData[];
  reviewQueue: ReviewItem[];
  timeline: TimelineEvent[];
  ledger: EvidenceLedgerEntry[];
  verificationResult?: VerificationResult;
  launchKit?: LaunchKit;
  settings: TaskSettings;
  activeUrl?: string;
  activeStep?: string;
  latestScreenshotUrl?: string;
  pauseReason?: string;
}
