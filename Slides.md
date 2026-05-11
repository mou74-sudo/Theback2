---
title: "AR-Enhanced Maintenance Support System"
subtitle: "Bournemouth Central Bus Depot — TRL-3 Prototype"
author: "Jude, Abishek, Shiar, Exauce, Mikku"
date: "COMP5067 Coursework 1"
---

# AR-Enhanced Maintenance Support System

**Bournemouth Central Bus Depot — TRL-3 Prototype**

Group members and pathways:

- Jude — Computing (AR client)
- Abishek — Computing (Backend)
- Shiar — Data Analytics
- Exauce — Cyber Security
- Mikku — Integration & Testing

Problem in one line: UK bus depots still run paper-based maintenance, and £180 m/year in fleet downtime says that doesn't scale.

Live demo: https://<your-deployment>.vercel.app

# Problem and Context

- Department for Transport (2023): mechanical defects are a leading cause of unscheduled bus withdrawals.
- £180 m/year in UK fleet downtime; ageing mechanic workforce, lost tacit expertise (Palmarini et al., 2018).
- Three pain points from the brief: invisible faults, missing tools, manipulated records.
- Bournemouth Central is typical: mixed-vintage fleet, constrained device budget, paper-based fault flow.
- Brief constraint: TRL-3 prototype, public transport context.

# System Concept

Three integrated capabilities, one auditable workflow:

1. **AR overlay** — marker-based fault and tool inspection in the browser.
2. **ML risk score** — interpretable logistic regression with SHAP feature importance.
3. **Audit-grade tool tracking** — hash-chain log per session with admin-only anomaly panel.

Stack: AR.js + A-Frame, Express on Node.js 22, scikit-learn (offline training), Vercel serverless.

# Design Rationale and Trade-offs

- **AR.js fiducial markers** over WebXR markerless: tracking drift under workshop lighting (Mojidra et al., 2024).
- **Logistic regression** over random forest: interpretability beats accuracy at safety-critical decision points (Rudin, 2019).
- **Modular monolith** over microservices: team-of-five at TRL-3 (Carvalho et al., 2025).
- **In-memory store** over MongoDB at TRL-3: scope discipline, named TRL-4 upgrade.
- **bcrypt cost 10** over argon2id at TRL-3: Express ecosystem fit, named TRL-6 upgrade (Dwivedi et al., 2025).

# Demo 1 — AR Fault Inspection

- Camera on the printed Hiro marker.
- A-Frame renders a blue cube overlay with fault title, severity badge, and ML risk score.
- Demonstrates FR1 (scan to record), FR2 (component overlay), and FR4 (30-day risk) firing together.
- Backup: a pre-recorded screen capture is embedded in case the live marker tracking glitches.

(Jude narrates this slide live.)

# Demo 2 — Tool Checkout and Audit Chain

- Kanji marker recognises a Tool record.
- The simulated QR-scan overlay fires, the movement log appends an entry, and the chain-integrity badge updates.
- Demonstrates FR5 (tool accountability) and NFR5 (immutable per-session hash chain).
- The audit chain uses a non-cryptographic DJB2 stub at TRL-3, documented as a SHA-256 upgrade at TRL-6.

(Mikku narrates this slide live.)

# Cyber Security Walkthrough

- **Login**: bcrypt verify, then HS256 JWT (8-hour expiry) carrying name and role.
- **Auth middleware**: 401 on missing/expired token; 403 on a mechanic hitting `/v1/reset`.
- **STRIDE**: every category in Table 8 has a named threat and a specific mitigation.
- **Anomaly detectors**: D1 page-load rate, D2 role-set tampering, D3 duplicate-timestamp replay; admin-only panel.
- TLS 1.3 from Vercel, CORS env-locked in production.

(Exauce narrates this slide live.)

# Data Analytics Dashboard

- Four KPI cards (Few, 2013): total faults, open faults, missing tools, average risk.
- Severity breakdown, monthly volume, top-5 highest-risk buses.
- SHAP global importance: severity dominates, open status secondary.
- ML status bar: F1 = 0.850, AUC-ROC = 0.926, p95 latency = 34 ms.

(Shiar narrates this slide live.)

# ML Pipeline and Metrics

- 5,000 synthetic records, 80/20 split. Class-weight balanced LR.
- Confusion matrix: 16.5% FN at threshold 0.5, the high-cost cell.
- ROC curve: AUC 0.926 vs random 0.500.
- Threshold could be lowered to trade FN for FP; deferred to stakeholder review (Section 4d).
- Synthetic-data ceiling: figures are feasibility, not deployment guarantee (Nieminen et al., 2026).

# Integration Walkthrough

The Section 4e five-step trace:

1. Mechanic logs in as `alex.mechanic` — RBAC hides admin/anomaly controls.
2. High-risk filter applied, a critical brake caliper fault selected.
3. AR.js detects the Hiro marker (~200 ms), A-Frame renders the overlay.
4. AR client posts to `/predict`, overlay displays returned probability inside the 100 ms NFR1 budget.
5. Inspection note appended, dashboard recalculates on reload.

One JWT, one data path across AR, backend, and dashboard.

# Evaluation Against the Brief

Functional requirements: **6 of 7 met**, FR2 partial.

- FR2 shortfall: WebXR depth-sensing immature on Android, absent on iOS Safari (Salii et al., 2025).
- TRL-6 path: QR asset-tag anchors + ARCore/ARKit depth APIs.

Non-functional requirements: all quantitative targets met.

- p95 latency 80 ms (NFR1, target <100 ms), 28 tests in <1 s (NFR7, floor 20), cold-start ~3 s (NFR2).
- Honest line: synthetic-data metrics are a ceiling, not a deployment guarantee.

# Comparison with Published Work

Our metrics vs published baselines:

- **This work (2026)** LR — F1 0.850, AUC 0.926
- **Ibrahim et al. (2024)** RF+SVR — F1 0.71, AUC 0.81
- **Gawde et al. (2024)** XGBoost — F1 0.75, AUC 0.84
- **Cummins et al. (2024)** LR median — F1 0.62, AUC 0.74
- **Marchand et al. (2025)** Ensemble — F1 0.69, AUC 0.79

LR is competitive on synthetic data; field data is the next validation step.

# Limitations, Ethics, Sustainability

Three deliberate limitations:

- Synthetic training data — metrics are a ceiling, not a deployment guarantee.
- In-memory store resets on Vercel cold starts; MongoDB Atlas at TRL-4.
- AR surface does not yet meet WCAG 2.1 AA; XR accessibility tooling immature industry-wide (Killough et al., 2024).

Three ethics dimensions:

- Audit log holds personal data under UK GDPR Art. 6(1)(f) — DPIA needed at TRL-6.
- Surveillance risk if log is repurposed for performance management — admin-only access mitigates.
- Synthetic data carries no immediate ethics burden, but the TRL-4 hybrid pilot would need committee review.

# Pathway Contributions

| Pathway | Owner(s) | Key contributions |
|---|---|---|
| Computing — AR | Jude | AR.js + A-Frame marker flow, dual-marker UX, print stylesheet |
| Computing — Backend | Abishek | Express API, bcrypt + JWT, Vercel deploy, `/predict` endpoint |
| Cyber Security | Exauce | RBAC, service worker, STRIDE threat model, accessibility toggles |
| Data Analytics | Shiar | LR training, SHAP, dashboard charts, drift-monitoring stub |
| Integration & Testing | Mikku | Tool board, hash-chain audit log, anomaly panel, 28-test Jest suite |

Each member speaks one sentence on this slide.

# TRL Roadmap and Reflection

- **TRL-4**: two months of real depot records, MongoDB Atlas, argon2id hashing.
- **TRL-5**: pilot with two mechanics for one shift each.
- **TRL-6**: full depot for one month, OpenTelemetry, drift-aware retraining, formal WCAG AR audit.

Reflection in one sentence:

*"Three pathways, one prototype — integration was the work, not the polish."*

Demo: https://<your-deployment>.vercel.app
Thank you.
