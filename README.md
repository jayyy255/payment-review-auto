# Payment Review Automation

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2%2B-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2%2B-3178C6.svg)](https://www.typescriptlang.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic-v2-E92063.svg)](https://docs.pydantic.dev/)
[![Tests](https://img.shields.io/badge/Tests-26%20Passed-success.svg)]()
[![Build](https://img.shields.io/badge/Frontend%20Build-Passing-success.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent, explainable decision-support and workflow-routing platform for financial payment reviews in banking, payments, and fintech environments.

---

## 1. Business Problem

Financial institutions process thousands of payment transactions daily. When potential anomalies or risk factors appear—such as unexpected amounts, new beneficiaries, foreign jurisdictions, or rapid velocity surges—manual review can become a significant operational bottleneck.

Reviewers typically spend critical minutes gathering context across disparate legacy systems before deciding whether a transaction should be:
1. **Approved for normal processing**
2. **Sent for additional customer information**
3. **Assigned to a compliance officer for human review**
4. **Escalated to specialized financial crime/AML teams**

---

## 2. Project Overview & Objectives

**Payment Review Automation** bridges the gap between raw transaction events and operational workflow decisions. It acts as an **intelligent decision-support system**, not an autonomous execution black-box.

### Key Objectives:
- **Stateless Feature Calculation**: Calculate statistical and behavioral ratios (e.g. amount-to-average spikes, velocity changes, cross-border indicators).
- **Explainable Rule-Based Risk Engine**: Compute normalized risk scores (`0.0` to `1.0`) with transparent score contribution breakdowns.
- **Workflow Recommendation Generation**: Map risk indicators into actionable routing directives for **Power Automate** and **Microsoft Dataverse**.
- **Interactive Operations Dashboard**: High-clarity operations UI (React + TypeScript) for reviewing flagged cases, tuning rules, and comparing scenarios.
- **Human Oversight by Design**: High-risk or data-deficient transactions trigger human review tasks with targeted investigation checklists.
- **Privacy & Security**: Built with structured logging that masks sensitive customer identifiers and enforces strict payload validation.

---

## 3. High-Level Architecture

```
+-----------------------------------------------------------------------------------+
|                              FINANCIAL SERVICE SYSTEM                             |
|                                                                                   |
|  [ Payment Transaction Event ]                                                    |
|                |                                                                  |
|                v                                                                  |
|  [ Power Automate Cloud Flow ] <----+ Context Enrichment                          |
|                |                    | (Core Banking / Historical Dataverse Store) |
|                v                    +---------------------------------------------+
|  [ Python Risk Analysis REST API ]                                                |
|       - Feature Engine                                                            |
|       - Transparent Rule Engine                                                   |
|       - Recommendation Engine                                                     |
|       - Explanation Service                                                       |
|                |                                                                  |
|                +---------------------------------+                                |
|                v Structured Assessment           v                                |
|  [ Power Automate Workflow Branching ]  [ React Operations Dashboard ]            |
|       +-----------------------------+        - Overview & Batch Simulator         |
|       |                             |        - Payment Analysis Workbench         |
|       v                             v        - Compliance Review Queue            |
|  [ Low Risk ]               [ High Risk ]    - Live Risk Rules Catalog            |
|  Auto-Release               Create Case &    - API Activity Telemetry             |
|                             Teams Task       - System Diagnostics                 |
|       |                             |                                             |
|       +-----------------------------+                                             |
|                                     |                                             |
|                                     v                                             |
|                         [ Dataverse Audit Trail ]                                 |
+-----------------------------------------------------------------------------------+
```

---

## 4. Technology Stack & Directory Structure

- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2, Pydantic-Settings, Pytest, HTTPX
- **Frontend**: React 18, Vite, TypeScript, Lucide Icons, Modern Enterprise CSS
- **Containerization**: Docker, Docker Compose

```
payment-review-auto/
├── README.md                          # Main project guide and documentation
├── .gitignore                         # Python & build ignore rules
├── .env.example                       # Backend configuration template
├── requirements.txt                   # FastAPI, Pydantic, Uvicorn dependencies
├── pyproject.toml                     # Pytest and packaging configuration
├── Dockerfile                         # Production multi-stage Docker build
├── docker-compose.yml                 # Local container orchestration
│
├── app/                               # Python Backend Service
│   ├── main.py                        # FastAPI entrypoint, exception handlers, and CORS
│   ├── config.py                      # Pydantic BaseSettings for dynamic threshold tuning
│   ├── api/routes/                    # REST endpoints (health, payments, features, scoring, simulation)
│   ├── models/                        # Request, Response, Enum, and Error Pydantic models
│   ├── services/                      # Feature, Risk, Recommendation, and Explanation engines
│   ├── rules/                         # Risk rules catalog and formula definitions
│   └── utils/                         # Privacy-preserving logging and security dependencies
│
├── frontend/                          # React + TypeScript Operations Dashboard
│   ├── index.html                     # HTML5 shell with Inter typography
│   ├── package.json                   # Dependencies (React, Lucide, Vite)
│   ├── tsconfig.json                  # TypeScript compiler settings
│   ├── vite.config.ts                 # Vite development and build settings
│   ├── .env.example                   # VITE_API_BASE_URL=http://localhost:8000
│   ├── src/
│   │   ├── api/client.ts              # Centralized API client with latency and telemetry logging
│   │   ├── components/                # Layout, Header, Sidebar, Badges, Meters, Banners
│   │   ├── pages/                     # Dashboard, Workbench, Review Queue, Rules, Compare, Activity, System
│   │   ├── types/                     # TypeScript interfaces matching backend models
│   │   ├── data/                      # Synthetic payment scenarios
│   │   ├── hooks/                     # useApiHealth, useApiLogs
│   │   └── index.css                  # Soft enterprise palette (no neon/purple AI themes)
│
├── tests/                             # 26 automated unit and integration tests (100% passing)
│   ├── conftest.py
│   ├── test_health.py
│   ├── test_features.py
│   ├── test_scoring.py
│   ├── test_recommendations.py
│   ├── test_payments_api.py
│   └── test_error_handling.py
│
├── sample_data/                       # Realistic synthetic test datasets
│   ├── low_risk_payment.json
│   ├── high_risk_payment.json
│   ├── new_beneficiary_payment.json
│   ├── country_mismatch_payment.json
│   ├── velocity_spike_payment.json
│   └── missing_context_payment.json
│
└── docs/                              # Deep-dive architecture and integration guides
    ├── architecture.md                # System topology and sequence diagrams
    ├── api-contracts.md               # Complete REST API specification
    ├── risk-rules.md                  # Risk formulas, weights, and calibration
    ├── power-automate-integration.md  # Step-by-step Power Automate flow tutorial
    ├── dataverse-design.md            # Dataverse entity models and schema
    └── sample-case-walkthrough.md     # Walkthroughs of standard payment cases
```

---

## 5. Quickstart Guide

### 1. Start the Backend API
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (runs on port 8000)
uvicorn app.main:app --reload --port 8000
```
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Start the Frontend Dashboard
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server (runs on port 3000)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Running Tests & Builds

### Backend Automated Tests
```bash
pytest -v
```
*Result: 26 passed in 0.16s*

### Frontend Build
```bash
cd frontend
npm run build
```
*Result: Compiled cleanly with zero errors in `dist/`.*

---

## 7. Frontend Pages Overview

| Page | Description | Primary Backend Integration |
| :--- | :--- | :--- |
| **Overview Dashboard** | KPI metric cards, quick-launch synthetic scenarios, and batch evaluation summary. | `POST /api/v1/payments/simulate` |
| **Payment Analysis** | Interactive workbench to customize parameters, run full analysis, extract features, or validate schemas. | `POST /api/v1/payments/analyze`, `/features`, `/validate` |
| **Review Queue** | Operational compliance triage queue to inspect case evidence and record dispositions. | Interactive triage state with required action checklists |
| **Risk Rules** | Transparent inspection of active rule definitions, weights, and thresholds. | `GET /api/v1/risk-rules` |
| **Scenario Comparison** | Side-by-side evaluation of all 6 synthetic scenarios in a single batch call. | `POST /api/v1/payments/simulate` |
| **API Activity** | Real-time HTTP traffic monitor showing method, latency (ms), status, and expandable JSON payloads. | Centralized API client interceptor |
| **System Information** | Live backend health monitor, service version metadata, and integration points. | `GET /health`, `GET /api/v1/version` |

---

## 8. Responsible AI, Governance & Limitations

- **Decision-Support Scope**: This platform operates strictly as a decision-support and workflow-routing prototype. It does not replace compliance officer judgment or statutory AML obligations.
- **Synthetic Data**: All test data, customer IDs, and transaction references included in this repository are strictly synthetic.
- **Explainability First**: Every calculated score provides auditable feature decompositions rather than opaque predictions.
- **Enterprise Integration**: Designed for enterprise orchestration via documented REST contracts to Microsoft Power Automate, Microsoft Dataverse, and Copilot Studio.