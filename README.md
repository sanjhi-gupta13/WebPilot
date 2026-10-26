# WebPilot ProofFlow — Autonomous AI Browser Agent

> **“When AI gets stuck, it recovers. When it can’t, it asks. When it finishes, it proves.”**  
> *Built for Microsoft Hackathon 2026 — Verified AI Autonomous Systems Track*

---

## 1. Executive Summary & Vision

Most AI research agents fail silently: they encounter a 403 error, hallucinate missing pricing data, or fabricate ungrounded answers. In high-stakes corporate strategy, M&A due diligence, and enterprise procurement, hallucinated intelligence can derail multi-million dollar decisions.

**WebPilot ProofFlow** redefines autonomous research by enforcing a non-negotiable core principle:  
**A task is complete only when its results pass independent verification.**

### The ProofFlow Lifecycle
```
Talk 🎙️ ──▶ Plan 📋 ──▶ Execute 🌐 ──▶ Recover 🔄 ──▶ Ask 🙋 ──▶ Verify 🛡️ ──▶ Launch 🚀
```

1. **Talk (Voice / Typed Instruction):** Speak or type research objectives via ElevenLabs conversational audio or text.
2. **Plan (Editable Plan & Approval Gate):** Generates an 8-stage execution plan that the user can edit and must approve on-screen.
3. **Execute (Playwright Browser):** Navigates real public websites, extracts structured DOM intelligence, and takes live viewport screenshots.
4. **Recover (Bounded Self-Healing):** Catches timeouts, retries with alternative wait strategies, semantic DOM matchers, and logs recovery steps.
5. **Ask (Human Review Queue):** When data is ambiguous or gated behind contact-sales forms, it pauses and routes the item to a human analyst.
6. **Verify (Independent Excel Re-check):** Compiles an Excel workbook (`.xlsx`), **re-opens it from disk in an isolated engine**, and runs 6 integrity checks.
7. **Launch (Grounded Launch Kit):** Synthesizes product positioning, competitor battlecards with source citations, and 3 launch-copy variations.

---

## 2. Technology Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS (Dark Navy & Slate Linear-inspired palette), Lucide Icons.
- **Backend:** Node.js, Express, TypeScript (`tsx`).
- **Browser Automation:** Playwright Chromium with real screenshot capture and DOM inspection.
- **Spreadsheet Generation & Verification:** ExcelJS (custom headers, column widths, conditional status formatting).
- **Live Event Streaming:** Server-Sent Events (SSE) for low-latency real-time telemetry.
- **Voice Orchestration:** ElevenLabs Agents integration + Web Speech API fallback + Voice Policy Guardrail.
- **Storage:** Local JSON Evidence Ledger and persistent task history (`./data/`).
- **Security & Development:** AdaL by Sylph development methodology; defense-in-depth against prompt injection.

---

## 3. Core Architecture & Features

### 3.1. Editable Execution Plan & Mandatory Approval Gate
- Generates 8 verifiable stages:
  1. Identify Target Companies
  2. Navigate Official Domains
  3. Extract Core Intelligence
  4. Capture Grounded Evidence
  5. Flag Uncertainties & Ambiguities
  6. Generate Proof Excel Workbook
  7. Independent Verification Pass
  8. Synthesize Launch Kit
- **Strict Approval Gate:** Autonomous execution begins **only** when the user clicks the on-screen "Approve Plan & Launch Browser" button.
- **Voice Agent Safety Policy:** Voice commands are strictly barred from auto-approving consequential actions or authorizations.

### 3.2. Real Browser Automation & Bounded Recovery
- Launches real Playwright Chromium instances.
- Captures full-resolution screenshots saved to `./data/screenshots/` and streamed to the UI.
- **Bounded Recovery Sequence:**
  - *Level 1:* Detects navigation timeout or element missing.
  - *Level 2:* Retries once with `domcontentloaded` and secondary fallback domains.
  - *Level 3:* Semantic text locator fallback (e.g. searches DOM for pricing signals).
  - *Level 4:* If still unresolved, routes to the Review Queue without guessing.

### 3.3. Human-in-the-Loop Review Queue
- Activates when critical information (e.g., pricing) is ambiguous or behind an enterprise sales gate.
- Provides 5 granular resolution options:
  - **Correct Value:** Inline text input to specify verified tier.
  - **Approve Value:** Approve observed value with analyst sign-off.
  - **Retry Extraction:** Re-run browser extraction on the page.
  - **Mark Unavailable:** Explicitly marks field with standard `[UNAVAILABLE: reason]` tag.
  - **Skip Field:** Exclude field from downstream reporting.
- Once resolved, the workflow automatically resumes.

### 3.4. Independent Verification Engine (ExcelJS)
- Builds an Excel workbook with 10 mandatory columns:
  1. `Company Name`
  2. `Product Description`
  3. `Pricing`
  4. `Target Users`
  5. `Official Website`
  6. `Pricing Source URL`
  7. `Product Source URL`
  8. `Captured Evidence`
  9. `Verification Status`
  10. `Missing Fields / Notes`
- **Reopen & Independent Verification:** Loads the generated `.xlsx` back from disk and verifies:
  - **Record Count:** Exactly matches expected company count (5 / 5).
  - **Required Columns:** All 10 columns present and formatted.
  - **Missing Data Markers:** Explicit `[UNAVAILABLE: ...]` tagging.
  - **Source URLs:** Well-formed HTTP/HTTPS endpoints.
  - **Evidence Grounding:** Extracted claims supported by captured DOM text snippets (≥ 80% threshold).
  - **Consistency:** Rows match 1-to-1 with immutable ledger entries.
- Calculates a cryptographic SHA-256 ledger checksum. **Never reports success if verification fails.**

### 3.5. Synthesized Launch Kit
- Product positioning statement and market landscape analysis.
- Competitor battlecard comparison with direct evidence citations.
- Target audience personas and key differentiators.
- Core marketing headline and elevator pitch.
- 3 Distinct Launch Copy Variations (Hacker News / Product Hunt, Enterprise Executive Pitch, Social Viral Thread) with 1-click copy buttons.
- Downloadable Markdown artifact (`.md`).

### 3.6. Chaos Switch & Security Guardrails
Built-in fault-injection lab to test and demonstrate system resilience during live hackathon demos:
1. **Navigation Timeout & Bounded Recovery:** Simulates 3000ms threshold timeout; recovers via secondary strategy.
2. **Missing Page Element:** Simulates missing `.pricing-card` locator; recovers via semantic text matchers.
3. **Missing Pricing:** Simulates enterprise contact-sales wall; routes item to the Review Queue.
4. **Adversarial Prompt Injection Defense:** Deflects malicious instruction overrides embedded in target HTML text.
5. **Instant Cancellation:** Immediately aborts Playwright browser instances and resets state cleanly.

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js v18+ (tested on Node v24.18.0)
- npm v10+ (tested on npm 11.16.0)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-org/webpilot-proofflow.git
cd webpilot-proofflow

# Install backend dependencies
cd server
npm install
npx playwright install chromium

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```
*Note: ProofFlow is designed to work 100% out-of-the-box using the built-in deterministic engine even without external API keys.*

### 3. Start Development Servers
In two terminal tabs (or using the root runner):

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser.

---

## 5. Verification & Testing Report

Every component was tested end-to-end:

| Feature / Subsystem | Test Status | Evidence & Verification Result |
| :--- | :--- | :--- |
| **Backend Express API** | ✅ PASSED | Health check, task creation, streaming SSE, review endpoints operational. |
| **Playwright Browser Navigation** | ✅ PASSED | Real Chromium navigates Anthropic, Perplexity, Mistral, Cohere, Scale AI. |
| **Screenshot Capture** | ✅ PASSED | Viewport PNGs saved to `data/screenshots/` and streamed to UI. |
| **Approval Gate** | ✅ PASSED | Requires explicit on-screen button confirmation; voice approvals strictly blocked. |
| **Bounded Self-Healing Recovery** | ✅ PASSED | Retries failed navigations; switches to secondary locators; logs recovery steps. |
| **Human Review Queue** | ✅ PASSED | Enqueues ambiguous pricing; allows correction/approval; automatically resumes. |
| **ExcelJS Generation & Re-open** | ✅ PASSED | Builds 10-column `.xlsx`; re-opens from disk; verifies 6 integrity checks. |
| **Prompt Injection Defense** | ✅ PASSED | Malicious HTML payloads deflected; state cannot be hijacked by prompt injections. |
| **Launch Kit Synthesis** | ✅ PASSED | Synthesizes battlecards, grounded evidence citations, and 3 copy variations. |
| **Artifact Downloads** | ✅ PASSED | Download verified Excel (`.xlsx`), Launch Kit (`.md`), and Ledger (`.json`). |
| **Persistent Task History** | ✅ PASSED | Tasks and evidence ledgers persist on disk in `data/tasks/` across refreshes. |

---

## 6. Microsoft Hackathon Credentials & Compliance

- **AdaL by Sylph:** Used for architectural development, autonomous browser coding, debugging, and verification testing.
- **Zero-Hallucination Policy:** Evidence grounding ensures that all extracted competitor claims link directly to captured DOM text snippets.
- **Responsible AI Principles:** Voice safety guardrail strictly enforces that conversational voice agents cannot approve consequential decisions.
