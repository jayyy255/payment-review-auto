# Payment Review Intelligence Platform - Frontend

A modern, responsive financial operations dashboard built with **React 18 + Vite + TypeScript + Modern CSS** for the Payment Review Automation ecosystem.

---

## 1. Key Capabilities

- **Overview Dashboard**: Displays demo metrics, quick scenario launch cards, and batch simulation outcomes.
- **Payment Risk Analysis Workbench**: Interactive scenario selector, enriched transaction context form, and direct evaluation via `POST /api/v1/payments/analyze`.
- **Explainability & Risk Indicators**: Clear visualization of risk score progress gauge, rule contribution breakdowns, triggered risk indicators with severity ratings, and an actionable human reviewer checklist.
- **Compliance Review Queue**: Interactive operational triage queue allowing compliance officers to review case evidence and record dispositions (Approved, Request Info, Escalate to AML).
- **Risk Rulebook Catalog**: Live inspection of backend active rule definitions, weights, and thresholds (`GET /api/v1/risk-rules`).
- **Batch Scenario Comparison**: Side-by-side evaluation of multiple payment cases in a single batch call (`POST /api/v1/payments/simulate`).
- **Live API Activity Inspector**: Real-time telemetry tracking outgoing HTTP requests, duration in milliseconds, and expandable raw JSON payloads.
- **System Architecture & Telemetry**: Backend connectivity health monitor (`GET /health`), active model version (`GET /api/v1/version`), and enterprise integration topology guide.

---

## 2. Design System & Aesthetics

- **Soft Enterprise Palette**: Built with soft slate neutrals (`#f8fafc`, `#ffffff`, `#334155`, `#0f172a`), deep corporate blue accents (`#2563eb`), and subdued semantic tones (emerald, amber, crimson).
- **Restrained Professional Visuals**: No neon or distracting purple/black cyberpunk styling; strictly designed for enterprise operations.
- **Clear Typography**: Inter font for crisp readability paired with JetBrains Mono for monetary figures, timestamps, and API schemas.

---

## 3. Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Python FastAPI Backend running on `http://localhost:8000`

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
The compiled bundle will be generated in `dist/`.
