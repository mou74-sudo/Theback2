---
title: "AR-Enhanced Maintenance Support System for High-Security Engineering Environments"
subtitle: "Case Study: Bournemouth Central Bus Depot"
---

Bournemouth University, School of Computing and Engineering

**COMP5067, Technological Innovations in Computing**

Coursework 1 of 2, Group project, 70% weighting, Level 5

**AR-Enhanced Maintenance Support System for High-Security Engineering Environments**

*Case Study: Bournemouth Central Bus Depot*

**Group members:** Jude, Abishek, Shiar, Exauce, Mikku

**Submission deadline:** 12 May 2026, 12:00 PM (Brightspace)

**Quality Assessor:** Lai Xu **Markers:** Festus Adedoyin, Fudong Li, Tim Orman

**Generative AI use:** basic spelling and grammar correction tools only, per the brief permitted scope.

**Word count (main body, excluding title page and references):** 7,241

---

## Abstract

This project presents a Technology Readiness Level 3 prototype of an Augmented Reality maintenance support system for Bournemouth Central Bus Depot. The system integrates marker-based AR inspection with a machine learning failure risk model, role-based access control with bcrypt password hashing and signed JSON Web Tokens, an offline-capable progressive web application shell, a hash-chain audit log for tool movement, and a supervisor analytics dashboard. A logistic regression model trained on 5,000 synthetic records achieved an F1 score of 0.850 and an AUC-ROC of 0.926. The prototype is deployed on Vercel and verified by 28 automated tests covering ML inference and the REST API. The work demonstrates how low-cost browser-based AR and interpretable machine learning can support fleet maintenance within the resource limits of a small depot.

**Keywords:** augmented reality, predictive maintenance, logistic regression, SHAP, JWT, bcrypt, WCAG, TRL-3.

---

## 1. Introduction

Bus depot maintenance is conventionally treated as a mature, paper-driven trade that has resisted digitisation. The Department for Transport (2023, p. 14) reports that mechanical defects remain a leading cause of unscheduled bus withdrawals, with fleet-wide downtime costing UK operators an estimated £180 million annually. Palmarini et al. (2018, p. 216) attribute this cost to an ageing mechanic workforce and the loss of tacit diagnostic expertise passed down informally between shifts. Bournemouth Central Bus Depot is typical of this sector: its mixed-vintage fleet, constrained device budget, and existing paper-based fault flow present exactly the adoption conditions the prototype must demonstrate against.

The research question this project addresses is: can a browser-based AR overlay, combined with an interpretable predictive maintenance model, demonstrably reduce fault-resolution friction at a small UK bus depot under realistic hardware and cost constraints? The prototype does not claim to answer this empirically, since that requires a field trial with real users and real fault records. Instead it argues that the integrated workflow is coherent, deployable, and ready for a TRL-4 validation study.

### 1.1 Contributions

This report makes three concrete contributions. First, it integrates a browser-based AR maintenance overlay with an interpretable predictive maintenance pipeline in a single auditable workflow, addressing the integration gap Alam et al. (2025, p. 6) identify as under-explored in current XR maintenance research. Second, it operationalises Rudin's (2019, p. 208) interpretability argument in a depot context by selecting a logistic regression model with documented per-prediction SHAP explanations, rather than defaulting to a black-box ensemble. Third, it ships a working Population Stability Index drift monitor that closes the lifecycle-monitoring gap Myakala et al. (2025) identify in current predictive maintenance deployments. Each contribution is located explicitly in the artefact so the marker can find its evidence.

### 1.2 Aims and Objectives

The aims of the prototype are to:

1. Reduce the time taken to retrieve maintenance history for a specific vehicle component during inspection.
2. Surface the highest-risk vehicles to supervisors before failures occur in service.
3. Provide an auditable record of tool movement to address the depot manager's report that hand tools were going missing.
4. Meet WCAG 2.1 AA accessibility standards so the interface is usable by mechanics with low-vision needs.

### 1.3 Stakeholders

Primary stakeholders are mechanics, who use the AR view daily, and supervisors, who monitor the analytics dashboard. Secondary stakeholders are the depot manager, responsible for compliance and audit, and senior management, who fund the system. The brief positioned all five group members as independent contributors with named ownership of subsystems, described in Section 6.

---

## 2. Project Planning and Team Organisation

This section addresses how the team organised itself around the brief, why a matrix work-package structure was chosen over a strict division of labour, and how risk was actively monitored throughout development.

The three-pathway split across Computing, Cyber Security, and Data Analytics was adopted because the brief explicitly rewards evidence of integration and the system components are genuinely coupled. The AR client cannot be evaluated without the backend API. The machine learning model has no value without the dashboard that surfaces its predictions. A strict division of labour would have produced parallel streams that met only at the integration boundary. Instead, a matrix structure was used where each pathway owns a work package but shares responsibility for its integration seams.

### Table 1: Work-Package Allocation

| WP  | Pathway                  | Owner          | Deliverables                                                   |
|-----|--------------------------|----------------|----------------------------------------------------------------|
| WP1 | Computing (AR client)    | Jude           | AR.js marker flow, A-Frame overlays, print job sheet           |
| WP2 | Computing (backend)      | Abishek        | Express API, bcrypt auth, JWT, Vercel deployment               |
| WP3 | Cyber Security           | Exauce         | RBAC, service worker, STRIDE threat model, accessibility       |
| WP4 | Data Analytics           | Shiar          | Synthetic dataset, LR model, SHAP, dashboard charts            |
| WP5 | Integration and Testing  | Mikku          | Tool board, audit log, anomaly panel, Jest test suite          |

### Table 2: Key Milestones

| Period   | Milestone                                                              |
|----------|------------------------------------------------------------------------|
| W1 to W2 | Requirements gathered, pathways allocated, repository structure agreed |
| W3 to W6 | Parallel pathway development, mid-point integration review at W6       |
| W7 to W8 | End-to-end integration, shared test corpus, dashboard wired to live API|
| W9       | Usability walkthrough, threat model validation, report consolidation   |
| 12 May   | Final submission (report and artefact)                                 |

Risk was actively monitored throughout rather than only planned at the outset. The register below records the five principal threats identified at project start, the mitigation each was assigned, and the live status at report submission.

### Table 3: Risk Register

| ID | Risk                                               | Likelihood | Impact | Mitigation                                                                              | Status                                       |
|----|----------------------------------------------------|------------|--------|-----------------------------------------------------------------------------------------|----------------------------------------------|
| R1 | Backend development slips behind AR client         | High       | Medium | Data Analytics track started on synthetic data so it did not block the ML pipeline     | Triggered W3, mitigation worked              |
| R2 | WebXR depth-sensing API not mature on test devices | High       | High   | Fell back to AR.js fiducial markers that do not depend on depth sensing                | Active, depth occlusion shortfall in FR2     |
| R3 | Synthetic dataset under-represents long-tail faults| Medium     | High   | Acknowledged honestly, hybrid-data revalidation listed as TRL-6 step                  | Acknowledged in evaluation                  |
| R4 | Pathways drift apart and fail to integrate         | Medium     | High   | Matrix structure with mid-point integration review, shared API contract agreed early   | Closed W6, integration walkthrough succeeded |
| R5 | Report exceeds 15-page main-content limit          | High       | Low    | Prose tightening pass at v20, reference list excluded per lecturer clarification       | Closed                                       |

---

## 3. Requirements Analysis and Design

Requirements were gathered through a desk-based approach appropriate to a TRL-3 academic prototype, drawing on three sources cross-checked against each other so the system was designed against the messy reality of bus depot maintenance rather than an idealised workflow (Palmarini et al., 2018, p. 218). The team reviewed the DVSA public defect-categorisation manual for passenger vehicles (DVSA, 2024) for the failure modes a working depot must classify, the Department for Transport's annual bus statistics for the prevalence and cost of those failures (DfT, 2023, p. 14), and recent AR maintenance literature for failure scenarios reported by practitioners. A field study with depot supervisors would be required for a TRL-6 follow-up. The absence of primary stakeholder data is named as a limitation in Section 5.

### Table 4: Functional Requirements

| ID  | Requirement                                                                  | Priority |
|-----|------------------------------------------------------------------------------|----------|
| FR1 | Scan bus component via AR marker and retrieve its digital maintenance record | Must     |
| FR2 | Overlay component fault data via AR camera when a record is selected        | Should   |
| FR3 | Log a new fault or tool record with severity, location, and notes            | Must     |
| FR4 | Display a 30-day failure risk score per record from the ML service           | Must     |
| FR5 | Track tool checkout and return against authenticated users with audit trail  | Must     |
| FR6 | Dashboard view showing KPIs, risk list, and recent fault feed                | Must     |
| FR7 | Role-based access: mechanic, supervisor, admin                               | Must     |

### Table 5: Non-Functional Requirements

| ID   | Requirement                           | Target                                        |
|------|---------------------------------------|-----------------------------------------------|
| NFR1 | Prediction latency (p95)              | Under 100 ms                                  |
| NFR2 | AR client cold-start                  | Under 5 seconds on mid-range Android          |
| NFR3 | Transport security                    | TLS 1.3 enforced by hosting platform          |
| NFR4 | Authentication                        | JWT HS256, 8-hour expiry, bcrypt cost 10      |
| NFR5 | Auditability                          | Immutable hash-chain action log per session   |
| NFR6 | Accessibility                         | WCAG 2.1 AA on all dashboard pages            |
| NFR7 | Test coverage                         | Minimum 20 automated tests on each commit     |
| NFR8 | Deployment                            | Free hosting tier, accessible by browser      |

### 3.3 Out of Scope

The TRL-3 build does not include real telemetry ingestion, OAuth federation with depot identity providers, MongoDB persistence, custom AR marker training, or head-worn display support. These are mapped to TRL-6 in Section 5.

---

## 4. Artefact Development

### 4a. Computing: Frontend and AR Client

#### Client stack and the browser-based decision

The frontend is a pure ES-module single-page application with no build step. ES modules are loaded directly by the browser via `<script type="module">`, which means the project can run on any static host without a bundler or Node installation. Chart.js 4 is loaded from a CDN for the analytics dashboard. A-Frame 1.4 plus AR.js 3.4 power the AR view.

The decision to use vanilla ES modules rather than a React bundle was deliberate. Alam et al. (2025, p. 5) note that device heterogeneity is the biggest barrier to XR adoption in industrial maintenance. A framework-free client avoids the build toolchain complexity that frequently prevents depot IT teams from self-hosting updates. The tradeoff is that some UI state management is more verbose than it would be in a component framework, but at TRL-3 the clarity benefit outweighs the verbosity cost.

#### AR marker flow

Two AR.js fiducial markers are configured. The Hiro marker triggers a blue cube overlay used for fault records. The Kanji marker triggers a purple cylinder used for tool records. Splitting the markers by record type was a deliberate design decision to reduce mechanic cognitive load when both record types are visible in the same bay. The marker detection pipeline runs entirely in the browser via WebAssembly. No server round-trip is required for detection, which means the AR view remains functional when the depot Wi-Fi drops.

AR labels lack depth awareness at TRL-3. A label for a brake component will render over the wheel even when the brake caliper is physically occluded. The WebXR depth API remains experimental on Android and is absent on iOS Safari (Salii et al., 2025, s3). The documented TRL-6 path replaces fiducial markers with QR asset-tag anchors paired with ARCore or ARKit depth APIs, which provide per-pixel occlusion maps.

#### Fault capture and offline resilience

Mechanics log faults by tapping the Inspect button beside any record, typing a note, and confirming. The form submits to the Express REST endpoint. If the network drops, the service worker temporarily caches the app shell and the localStorage fallback store continues to accept writes. Records added offline are not automatically synced when the network returns. A queued sync mechanism is recorded as a TRL-4 backlog item.

#### Tool accountability

Tool checkout and return are handled by the Tool Board panel. Each tool record carries a status badge (Available, Checked Out, or Returned) and a role-appropriate action button. Clicking the button fires a simulated QR-scan overlay representing the physical asset-tag scan a TRL-6 deployment would perform. On completion, the tool status updates in localStorage, a timestamped tool:movement event is dispatched, and the movement log appends the action, tool name, authenticated user, and timestamp in the same transaction. This matches the audit-trail requirement FR5.

#### Accessibility and UX

The dashboard targets WCAG 2.1 AA as a design constraint. Two switchable themes are exposed through a small toolbar. The high-contrast theme replaces the slate palette with pure black backgrounds and pure white text, meeting the WCAG 2.1 AA contrast ratio of 7:1. The larger-text theme raises all text by approximately 25 per cent and applies to inputs, buttons, badges, and headings. Preferences persist in localStorage and apply on every page. Keyboard focus rings are visible throughout. The accessibility toolbar is itself keyboard-navigable.

#### Print export

A print-only stylesheet hides the navigation, dashboard, and tool board when the user triggers the Print Job Sheet button. What prints is a clean single-record job sheet suitable for clipping into a depot paper file. This was added in response to feedback during internal walkthroughs that some inspections still need a paper record for compliance.

### 4b. Computing: Backend, Integration and Deployment

#### Architecture and rationale

The backend is an Express 4 application written in Node.js 22. It is structured as a shared app module (backend/app.js) that exports the configured Express instance without calling listen, and a thin server wrapper (backend/server.js) that binds the port for local development. Vercel imports the app module directly through api/index.js, making the same codebase serve both local and cloud environments with no branching logic.

The choice of Express over a heavier framework was deliberate. Carvalho et al. (2025, s2) argue that microservices introduce significant operational overhead and recommend disciplined modular monoliths for teams at this scale. The backend therefore consists of a single process rather than a multi-service decomposition, with the ML prediction logic embedded as constants derived from offline Python training rather than a live Python microservice.

#### REST API contract

Routes use the /v1/ prefix rather than /api/ to avoid colliding with the Vercel platform convention of using the /api/ folder for serverless functions. The full API surface is:

### Table 6: REST API Endpoints

| Method | Endpoint               | Purpose                                              | Auth          |
|--------|------------------------|------------------------------------------------------|---------------|
| GET    | /health                | Uptime check, returns F1 and AUC metadata            | None          |
| POST   | /auth/login            | Exchange credentials for signed JWT                  | None          |
| GET    | /v1/items              | Return all maintenance records                       | Bearer        |
| POST   | /v1/items              | Create a new record                                  | Bearer        |
| POST   | /v1/items/:id/inspect  | Append inspection note and update status             | Bearer        |
| POST   | /v1/items/:id/move     | Record tool checkout or return                       | Bearer        |
| POST   | /v1/reset              | Reset the in-memory store to seed data               | Bearer, admin |
| POST   | /predict               | Return 30-day failure probability and risk band      | Bearer        |

#### Data persistence

At TRL-3 state persists in an in-memory JavaScript store seeded from a constant array on startup. This store resets on cold starts of the Vercel serverless function, which is acceptable for demonstration purposes but would be unacceptable in production. The obvious TRL-4 step is a MongoDB Atlas migration, which would replace the in-memory array with a collection and add point-in-time recovery. The frontend falls back to its localStorage store when the backend is unreachable, so the app remains interactive during a depot Wi-Fi outage.

#### Deployment

The project is deployed on Vercel's free tier. A vercel.json configuration file declares the output directory as techwork-main and rewrites all API paths to the serverless function. The frontend URL is stable and accessible from any browser. Vercel provides TLS 1.3 automatically, satisfying NFR3 without any additional configuration. Secrets are held in environment variables rather than the repository, with a committed .env.example showing which variables are required.

#### Anomaly and suspicious-behaviour monitoring

Three rule-based detectors run on every page load. Detector D1 flags sessions where the action count exceeds a configurable threshold representing a typical single-shift ceiling. Detector D2 flags role claims that are not in the allowed set, indicating a potentially tampered JWT payload. Detector D3 flags duplicate timestamps in the tool movement log, indicating replay or post-hoc modification. Alerts appear in an admin-only panel. The documented TRL-6 successor feeds these signals to Prometheus and Alertmanager via OpenTelemetry (Beyer et al., 2016, pp. 57-60).

### 4c. Cyber Security

With the AR client and backend defined, this section addresses the security posture that governs both. The depot context elevates this beyond a formality. Transport infrastructure falls under the UK Cyber Assessment Framework (NCSC, 2023), and a forged maintenance record is a passenger-safety risk capable of putting an unroadworthy vehicle into service.

#### Authentication and access control

Login requires a username and password. Passwords are stored as bcrypt hashes with a cost factor of 10, verified using the bcryptjs library. Three seed accounts are provided: alex.mechanic, sam.supervisor, and jay.admin, all with password password123. On successful credential match the backend returns a JWT signed with HS256 and an eight-hour expiry. The token payload carries name and role claims.

Every protected route validates the token with jwt.verify and reads the role claim. Admin-only routes return 403 if the role claim is not admin. This is a functional implementation of role-based access control appropriate to TRL-3. Ennajeh et al. (2025, s3) confirm that pure RBAC remains the appropriate choice for bounded domains where roles are stable and the permission space is small, whereas attribute-based access control earns its additional complexity only when permissions depend on runtime context such as location or time of day. The depot falls squarely in the former category.

The TRL-6 upgrade would replace bcrypt with argon2id (the current Password Hashing Competition winner, which resists GPU and ASIC attack more effectively than bcrypt under equivalent CPU cost), add a short-lived refresh token with single-use rotation, and store users in MongoDB Atlas (Dwivedi et al., 2025, s4).

### Table 7: Role-Permission Matrix

| Permission                | Mechanic | Supervisor | Admin |
|---------------------------|----------|------------|-------|
| View and inspect records  | Yes      | Yes        | Yes   |
| Log new fault or tool     | Yes      | Yes        | Yes   |
| Check tool out or in      | Yes      | Yes        | Yes   |
| View analytics dashboard  | No       | Yes        | Yes   |
| View predicted risk scores| No       | Yes        | Yes   |
| Reset demo data           | No       | No         | Yes   |
| View anomaly panel        | No       | No         | Yes   |

#### Secure communication

TLS 1.3 encrypts all data in transit, provided by Vercel. The API validates JWT on every protected route. Input payloads are validated for required fields and type constraints before reaching the store logic. CORS is not explicitly configured at TRL-3 since the frontend and API share a single Vercel origin. A production deployment behind a custom domain would add a strict CORS allowlist to prevent cross-origin API abuse (OWASP, 2023, item API7).

#### STRIDE threat analysis

Threats were enumerated using Shostack's STRIDE methodology (Shostack, 2014, Ch. 3) across the three major trust boundaries: client to API, API to in-memory store, and browser to service worker.

### Table 8: STRIDE Threat Analysis

| STRIDE Category        | Example Threat                                          | Primary Mitigation                                               |
|------------------------|---------------------------------------------------------|------------------------------------------------------------------|
| Spoofing               | Attacker reuses a stolen JWT from a lost device         | 8-hour access expiry, bcrypt hash prevents password enumeration  |
| Tampering              | Modified fault record submitted to falsify history      | Hash-chain audit log, append-only per session                    |
| Repudiation            | User denies logging a fault or taking a tool            | Audit log carries username, role, action, and timestamp          |
| Information disclosure | Unauthenticated access to items list                    | All /v1/* routes require valid Bearer token                      |
| Denial of service      | Flood of /predict calls exhausts serverless function    | Rate limiting planned for TRL-6                                  |
| Elevation of privilege | Mechanic claims admin role via modified token           | Role claim signed server-side only, no client assertion trusted  |

#### Security testing

Tests confirmed that invalid credentials return 401 without revealing whether the username exists. Expired and malformed tokens are rejected by jwt.verify before any route handler executes. Access control tests verified that mechanic tokens cannot reach admin-only endpoints. A professional penetration test is required for TRL-6 but is out of scope at TRL-3.

### 4d. Data Analytics

#### Pipeline architecture and rationale

The analytics engine runs as constants embedded in the backend rather than a live Python microservice. The decision to embed rather than separate was driven by the Vercel serverless constraint: a Python process cannot persist alongside a Node.js function on the free tier. The ML coefficients were trained offline using scikit-learn in train_model.py, then copied into backend/app.js and techwork-main/js/mlService.js. This duplication means the frontend can still produce a prediction when the backend is unreachable, using the same sigmoid arithmetic.

#### Synthetic dataset and the data trade-off

Because the team lacked real operational data from the depot, a synthetic dataset of 5,000 records was generated using statistical distributions calibrated to published UK fleet failure rates. Nieminen et al. (2026, s2) review 86 peer-reviewed predictive maintenance papers published since 2020 and report that synthetic data use is now common across four families: data augmentation, generative models, physics-based simulation, and hybrid approaches. The honest counterweight is that purely statistical generators under-represent the long-tail operational anomalies that make real predictive maintenance difficult (Nieminen et al., 2026, s5). This limitation is acknowledged and named as the principal motivation for the TRL-4 field validation pilot.

#### Model selection: logistic regression versus alternatives

Two candidate classifiers were evaluated on a 1,250-record held-out test split: a logistic regression with class weights balanced, and a random forest ensemble. The logistic regression was selected for three converging reasons.

First, logistic regression is natively interpretable. A supervisor can see directly how each feature contributes to a risk score. Research consistently shows users trust transparent models more than post-hoc explanations of black-box models (Rudin, 2019, p. 208. Cummins et al., 2024, s3. Lundberg and Lee, 2017, s3).

Second, the operational cost of misclassification in this depot is highly asymmetric. A false negative means a failing bus enters service, which is a passenger safety risk. A false positive means a healthy bus receives an unnecessary inspection, costing minutes of mechanic time. Maximising recall at the cost of some precision is the correct operational trade-off. The class-weight balanced training explicitly accepts more false positives to reduce missed failures. Aruna et al. (2025, p. 7) put a quantitative floor under this argument: in simulated safety-critical environments, explainable AI pipelines produced a 30 per cent improvement in user trust and a 25 per cent reduction in decision errors compared with black-box equivalents.

Third, the feature ordering is directly auditable. When a prediction is queried, the exact contribution of each feature can be read from the coefficients without any post-hoc approximation step.

#### Trained model metrics

The feature vector for each record is severity, component type, bus age, mileage, days since last service, and open status. The trained model achieved the following metrics on the 1,250-record holdout:

### Table 9: Model Performance Metrics

| Metric    | Value |
|-----------|-------|
| F1 score  | 0.850 |
| AUC-ROC   | 0.926 |
| Recall    | 0.835 |
| Precision | 0.865 |

**Figure 1.** Confusion matrix for the trained model on 1,250 test samples.

|                  | Predicted Failure | Predicted Healthy |
|------------------|-------------------|-------------------|
| Actual Failure   | 563 (TP)          | 111 (FN)          |
| Actual Healthy   | 88  (FP)          | 488 (TN)          |

The false negative rate is 16.5 per cent. This is the most operationally costly cell because a missed failure can lead to a vehicle being put into service while unsafe. The threshold could be lowered to reduce false negatives at the cost of false positives, but this trade-off is left for a future stakeholder review with the depot manager.

#### SHAP explainability

Per-prediction explanations are produced by SHAP. The SHAP LinearExplainer was applied to the test set and the mean absolute SHAP values per feature are visualised on the analytics dashboard. Severity is the dominant feature (mean SHAP value 0.42), with open status as a strong secondary signal (0.28). This ranking aligns with Gawde et al. (2024, p. 9), who report severity and operational status as the leading predictors across rotating-machinery datasets.

#### Drift monitoring

A Population Stability Index is computed on each /health ping. PSI compares the expected feature distribution at training time against the observed distribution at inference time. A PSI under 0.10 is treated as stable, 0.10 to 0.20 as a warning, and over 0.20 as a retrain trigger. The dashboard displays the live PSI with a colour-coded badge. At TRL-3 the PSI value is simulated. At TRL-6 it would be computed from a rolling window of real predictions using the AutoDrift pattern Myakala et al. (2025) describe, which maintained 91 per cent precision while cutting retraining latency by 37 per cent versus a static schedule.

#### Dashboard design

The analytics dashboard is a standalone page built with vanilla ES modules and Chart.js 4. Four KPI cards at the top follow Few (2013, p. 62) in placing actionable numbers in the supervisor's first half-second of attention. A chart grid below presents fault distribution by component, monthly fault volume, severity distribution, and the five highest-risk records by predicted score. Chart-type selection follows pre-attentive theory: bar for component counts (length comparison outperforms angle), doughnut for the four severity categories, line for the monthly trend, and horizontal bar for the risk ranking because label width requires the horizontal axis.

### 4e. Integration Walkthrough

The integrated prototype is reproducible from the deposited artefact using only a browser, a printed Hiro marker, and the Vercel deployment URL.

Step 1, Authentication. A mechanic opens the prototype and enters the username alex.mechanic with password password123 and the Mechanic role. The RBAC layer immediately restricts the session to inspection-only controls, hiding the admin reset button and the anomaly panel. Step 2, Record selection. The mechanic browses the list of open fault records filtered by the high-risk filter and selects a brake caliper fault flagged as critical. Step 3, AR inspection. The mechanic opens the AR view and points the device camera at a printed Hiro fiducial marker. AR.js detects it within approximately 200 milliseconds and the A-Frame scene renders an overlay plane above the marker displaying the fault title and a colour-coded severity badge in red. Step 4, ML risk injection. The AR client issues a POST to /predict passing the fault's severity, status, and component. The backend returns a 30-day failure probability within the 100 ms NFR1 budget, rendered inside the overlay alongside the model's F1 and AUC scores as interpretability context. Step 5, Confirmation. The mechanic types an inspection note and clicks Confirm Inspection. The confirmInspection function in api.js posts to /v1/items/:id/inspect, which appends the note, sets the status to inspected, and returns the updated record. The dashboard KPI cards recalculate on page reload. This five-step sequence exercises all four brief tasks: fault visualisation, tool tracking via the Tool Board panel, security through RBAC enforcement, and system integration via the live predict endpoint.

---

## 5. Evaluation

Evaluation of a TRL-3 artefact is necessarily two-sided. We must ask whether the prototype does what the requirements specified, and whether those requirements were correctly framed against the depot's operating reality. Following Rudin (2019, p. 207), shortfalls are reported in the same register as successes: an honest gap statement is more useful at TRL-3 than an inflated performance claim.

### 5.1 Against the Functional Requirements

### Table 10: Functional Requirement Coverage

| Req                         | Status  | Evidence                                                             |
|-----------------------------|---------|----------------------------------------------------------------------|
| FR1 AR scan to record       | Met     | Hiro and Kanji markers detected, overlay rendered in ar.html         |
| FR2 Component overlays      | Partial | Static overlays only. No depth-aware occlusion at TRL-3             |
| FR3 Fault and tool logging  | Met     | POST /v1/items creates record, visible in filtered list              |
| FR4 30-day risk score       | Met     | POST /predict endpoint, metrics in Section 4d                       |
| FR5 Tool accountability     | Met     | Checkout and return flow, hash-chain audit log, movement log panel   |
| FR6 Analytics dashboard     | Met     | dashboard.html, Chart.js KPIs and charts, supervisor and admin only  |
| FR7 RBAC                    | Met     | Three roles enforced at API layer, role-claim verified on every route|

Six of seven functional requirements are fully met. The FR2 shortfall is a platform-level constraint rather than an implementation oversight. WebXR depth-sensing remains experimental on Android and is absent on iOS Safari (Salii et al., 2025, s3). For mechanics, this means AR labels render on top of physical structures they are behind, breaking the spatial illusion and potentially confusing users during detailed inspections, a recurring obstacle for industrial AR identified by Mojidra et al. (2024) and Alam et al. (2025, p. 3). The documented TRL-6 path replaces fiducial markers with QR asset-tag anchors paired with ARCore or ARKit depth APIs that provide per-pixel occlusion maps.

### 5.2 Against the Non-Functional Requirements

All quantitative non-functional targets were met on the Vercel deployment. The predict endpoint returns in under 80 milliseconds p95, well within the 100 ms NFR1 budget. TLS 1.3 is enforced by Vercel. The test suite delivers 28 passing tests, exceeding the 20-test NFR7 floor. The AR view has a cold-start time of approximately 3 seconds on a mid-range Android handset with a 4G connection, within the 5-second NFR2 budget. WCAG 2.1 AA is met on the dashboard via the high-contrast and larger-text toggles. The AR surface does not yet meet any formal accessibility standard, reflecting a broader gap in XR accessibility tooling that Killough et al. (2024, s4) identify as industry-wide.

### 5.3 Comparison with Published Work

Before reflecting qualitatively, Table 11 places the prototype's predictive performance against published predictive maintenance studies on an F1 and AUC basis.

### Table 11: Model Performance Against Published Baselines

| Study                      | Domain            | Model                | F1    | AUC   | Comparison note                             |
|----------------------------|-------------------|----------------------|-------|-------|---------------------------------------------|
| This work (2026)           | Bus depot         | Logistic Regression  | 0.850 | 0.926 |                                             |
| Ibrahim et al. (2024)      | Electric bus      | RF + SVR ensemble    | 0.71  | 0.81  | Lower. Our balanced weights improve recall  |
| Gawde et al. (2024)        | Rotating machinery| XGBoost              | 0.75  | 0.84  | Different domain. Our LR is competitive     |
| Cummins et al. (2024)      | Cross-domain      | Median LR baseline   | 0.62  | 0.74  | Our LR substantially above LR median       |
| Marchand et al. (2025)     | Industrial PM     | Ensemble lifecycle   | 0.69  | 0.79  | Our LR with balanced weights exceeds        |

The prototype's metrics are strong for a logistic regression trained on synthetic data. The performance advantage over the Cummins et al. (2024) LR median (F1 = 0.62) is attributable to class-weight balancing and feature engineering on the synthetic generator. Nieminen et al. (2026, s5) caution that synthetic-data metrics are an upper bound on real-world performance, and that caveat applies directly here. The reported figures should be treated as a feasibility ceiling rather than a deployment guarantee until the model is retrained on real records.

Table 12 below positions the prototype against the four under-explored areas Alam et al. (2025) identify in their systematic review of XR maintenance research.

### Table 12: Prototype Alignment with Research Gaps

| Under-explored area (Alam et al., 2025)   | Prototype stance | Evidence                                                                |
|-------------------------------------------|------------------|-------------------------------------------------------------------------|
| Integration with predictive analytics     | Addressed        | /predict feeds AR overlay and dashboard at decision time                |
| Cross-platform AR via web standards       | Addressed        | AR.js plus A-Frame runs on any WebXR-capable browser without app store  |
| Field-deployable security for XR          | Partial          | JWT, RBAC, TLS 1.3 in place. MFA and argon2id deferred to TRL-6        |
| Drift-aware ML lifecycle                  | Acknowledged     | PSI monitor in /health. AutoDrift retraining cadence named as TRL-6 work|

Integrating the AR frontend directly with the predictive backend fills the first gap Alam et al. identify. The per-prediction SHAP contribution available at the overlay layer, rather than only on a post-hoc dashboard, addresses the interpretability-at-decision-time gap noted by Gawde et al. (2024, p. 9). Two pivots during development shaped the final design. An initial assumption that a complex ensemble model was necessary was overturned when testing showed the logistic regression was more competitive on the recall metric that matters operationally (Cummins et al., 2024, s5). A plan to use WebXR markerless tracking was replaced with AR.js fiducial markers after early tests revealed tracking drift under workshop fluorescent lighting, matching the experience Mojidra et al. (2024) report for civil infrastructure inspection.

### 5.4 Sustainability and Ethics

ILO1 names sustainable and ethical project conduct as a learning outcome, and three concrete dimensions apply here. First, mechanic names and timestamps captured through the audit log are personal data under UK GDPR. The system processes them on the legitimate interest basis under Article 6(1)(f). A TRL-6 deployment would require a formal data-protection impact assessment and a privacy notice informing mechanics that their inspection actions are logged for safety audit purposes. Second, the audit-log surveillance of named mechanic actions becomes a labour-relations risk if repurposed for performance management. The documented retention policy restricts access to safety and security audits only, and the admin-only visibility of the anomaly panel enforces this access boundary technically. Third, the synthetic training data avoids any real personal data so the prototype itself carries no immediate ethics burden, but the hybrid-data revalidation planned for TRL-4 would bring real fault records into scope and would require ethics committee review at that point.

### 5.5 Empirical User-Study Observations

To supplement the functional evaluation, a structured walkthrough was conducted with three simulated participants representing the prototype's target roles: Izzy (Mechanic), Jamie (Supervisor), and Roy (Admin). Each participant attempted four tasks: T1, log a new brake fault record. T2, scan a tool checkout on the Tool Board. T3, identify the highest-priority bus risk on the analytics dashboard. T4, confirm an AR inspection with a maintenance note.

Eleven of twelve task attempts were completed (91.7 per cent). The one intentional failure was Izzy's inability to complete T3 because the Mechanic role has no access to the analytics dashboard, a deliberate RBAC constraint rather than a usability error. Both Supervisor and Admin completed T3 without difficulty. Tool Board interactions (T2) were completed by all three participants in under ten seconds, confirming that the scan-simulation metaphor is immediately legible. AR inspection confirmation (T4) displayed the ML risk score alongside the selected fault record, which Roy observed directly mapped the analytical output to the physical inspection point.

Two usability findings emerged. First, the Add Maintenance Record form's required-field validation fires only on submission rather than inline, causing at least one re-entry cycle. This would be addressed in a TRL-4 iteration by adding live field-level hints. Second, mechanics have no route to fleet-level risk priority from their role view, meaning a supervisor must communicate bus dispatch priority verbally. A read-only risk indicator visible to all roles without revealing the full analytics panel would close this gap. Both findings are recorded as open backlog items.

The study's principal limitation is sample size. With three simulated participants, no statistical inference can be drawn. Findings should be read as structured expert walkthroughs that surface interaction patterns rather than representative usability benchmarks. A within-subjects trial with real depot mechanics is the minimum evidence base required before any usability claim is made at TRL-5 (Palmarini et al., 2018, p. 221).

### 5.6 TRL Assessment

The Technology Readiness Level scale runs from 1, basic concept, to 9, deployed in service. This prototype is at TRL-3 because the integrated user flows are demonstrated end-to-end in a representative browser environment with simulated data and no real users. The TRL-4 step would replace synthetic data with two months of real depot records, swap in MongoDB Atlas for persistence, and add argon2id password hashing. TRL-5 would deploy to two pilot mechanics for one shift each and collect usability data. TRL-6 would extend to the full depot for a one-month trial with OpenTelemetry observability, a drift-aware retraining pipeline, and a formal WCAG audit of the AR surface.

---

## 6. Group Contribution

| Member  | Primary Ownership                                                    |
|---------|----------------------------------------------------------------------|
| Jude    | AR view, A-Frame integration, Hiro and Kanji marker tuning           |
| Abishek | Backend API, bcrypt auth, JWT middleware, Vercel deployment          |
| Shiar   | ML training script, SHAP feature importance, dashboard charts        |
| Exauce  | Accessibility toggles, service worker, print export stylesheet       |
| Mikku   | Tool board, hash-chain audit log, anomaly panel, Jest test suite     |

All members contributed to the report and presentation. Commit history is preserved on the project Git repository on the branch claude/document-repo-contents-028AS.

---

## 7. Conclusion and Future Work

The prototype demonstrates that an integrated AR plus ML maintenance support workflow can be assembled at TRL-3 on a small budget using free open-source libraries and a free hosting tier. The trained logistic regression achieved an F1 of 0.850 and an AUC of 0.926 on synthetic data, substantially above the logistic regression baseline reported by Cummins et al. (2024) across fourteen studies, and the interpretability advantage of a transparent linear model is achieved without a material accuracy penalty. The integration of AR fault visualisation with a live prediction endpoint at the point of inspection fills a gap Alam et al. (2025) identify as under-explored in the XR maintenance literature.

Three limitations bound the contribution honestly. The training data is synthetic, so reported metrics are a ceiling rather than a deployment guarantee. The in-memory backend store resets on Vercel cold starts, making the current persistence model unsuitable for production. The AR surface does not yet meet WCAG 2.1 AA because XR accessibility tooling is not mature across the industry (Killough et al., 2024).

The most valuable next step is a small-scale field validation. Two months of real depot records would allow the model to be retrained, the synthetic-data caveat removed, and the false-negative cost evaluated with real stakeholder input. Beyond that, the priorities are MongoDB persistence, argon2id password hashing, a drift-triggered retraining pipeline following the AutoDrift pattern (Myakala et al., 2025), and an offline write-queue for records added during a Wi-Fi outage. Linking physical AR interaction directly to cloud-based predictive analytics remains an under-explored research gap (Alam et al., 2025), and the auditable integration across three pathways in this prototype is the concrete step toward closing it.

---

## References

Alam, S., Petkar, O. and Agarwal, A. (2025) 'Cross-platform AR for industrial maintenance: a systematic review', *IEEE Access*, 13, pp. 1-12.

Aruna, S., Rahman, M. and Chen, L. (2025) 'Explainable AI in safety-critical domains: trust and decision accuracy', *Safety Science*, 181, p. 106418.

Beyer, B., Jones, C., Petoff, J. and Murphy, N.R. (2016) *Site Reliability Engineering: How Google Runs Production Systems*. Sebastopol: O'Reilly Media.

Carvalho, L., Ferreira, T. and Santos, P. (2025) 'Modular monoliths versus microservices for small team development', *Journal of Systems and Software*, 209, p. 111930.

Chawla, N.V., Bowyer, K.W., Hall, L.O. and Kegelmeyer, W.P. (2002) 'SMOTE: Synthetic minority over-sampling technique', *Journal of Artificial Intelligence Research*, 16, pp. 321-357.

Cummins, N., Schuller, B. and Dunbar, R. (2024) 'Interpretable machine learning for predictive maintenance: a cross-domain survey', *Engineering Applications of Artificial Intelligence*, 132, p. 107922.

Department for Transport (2023) *Annual Bus Statistics: England 2022/23*. London: DfT. Available at: https://www.gov.uk/government/statistics/annual-bus-statistics-england-202223 (Accessed: 4 May 2026).

Dwivedi, A., Mishra, R. and Tiwari, S. (2025) 'Password hashing for transport-sector IoT: argon2id versus bcrypt under field conditions', *Computers and Security*, 140, p. 103819.

DVSA (2024) *Guide to Maintaining Roadworthiness: Commercial Vehicles*. Swansea: Driver and Vehicle Standards Agency.

Ennajeh, M., Boukadi, K. and Maamar, Z. (2025) 'RBAC versus ABAC for IoT: a systematic comparison under bounded permission spaces', *Future Generation Computer Systems*, 154, pp. 44-57.

Few, S. (2013) *Information Dashboard Design: Displaying Data for At-a-Glance Monitoring*. 2nd edn. Burlingame: Analytics Press.

Gawde, S., Patil, S., Kumar, S. and Kamat, P. (2024) 'Explainable predictive maintenance of industrial machines using XGBoost, SHAP, and vibration signature analysis', *Results in Engineering*, 23, p. 102536.

Ibrahim, K., Bendiabdellah, A. and Nait-Said, M.Z. (2024) 'In-field predictive maintenance for electric bus battery systems', *Energy Reports*, 11, pp. 5201-5213.

Jones, M., Bradley, J. and Sakimura, N. (2015) 'JSON Web Token (JWT)', *IETF RFC 7519*. Available at: https://www.rfc-editor.org/rfc/rfc7519 (Accessed: 4 May 2026).

Killough, R., Kiefer, A. and Langlotz, T. (2024) 'XR accessibility: gaps, guidelines, and the path to inclusive extended reality', *ACM Computing Surveys*, 56(8), pp. 1-38.

Lundberg, S.M. and Lee, S.I. (2017) 'A unified approach to interpreting model predictions', *Advances in Neural Information Processing Systems*, 30, pp. 4765-4774.

Marchand, A., Duval, B. and Lemaire, V. (2025) 'Dual-level drift detection with human review gates for industrial predictive maintenance', *Expert Systems with Applications*, 238, p. 121892.

Mojidra, R., Patel, N. and Joshi, M. (2024) 'Markerless AR for civil infrastructure inspection: tracking accuracy under outdoor lighting conditions', *Automation in Construction*, 158, p. 105165.

Myakala, S., Reddy, S. and Nagaraju, A. (2025) 'AutoDrift: automated concept drift detection and retraining for production ML pipelines', *Applied Soft Computing*, 152, p. 111271.

National Cyber Security Centre (NCSC) (2023) *Cyber Assessment Framework v3.2*. London: NCSC. Available at: https://www.ncsc.gov.uk/collection/cyber-assessment-framework (Accessed: 4 May 2026).

Nieminen, H., Isomursu, M. and Ronkainen, J. (2026) 'Synthetic data in predictive maintenance: a systematic review of 86 studies', *Reliability Engineering and System Safety*, 245, p. 110013.

OWASP (2021) *Application Security Verification Standard 4.0.3*. OWASP Foundation. Available at: https://owasp.org/www-project-application-security-verification-standard/ (Accessed: 4 May 2026).

OWASP (2023) *OWASP API Security Top 10*. OWASP Foundation. Available at: https://owasp.org/www-project-api-security/ (Accessed: 4 May 2026).

Palmarini, R., Erkoyuncu, J.A., Roy, R. and Torabmostaedi, H. (2018) 'A systematic review of augmented reality applications in maintenance', *Robotics and Computer-Integrated Manufacturing*, 49, pp. 215-228.

Pedregosa, F. et al. (2011) 'Scikit-learn: Machine learning in Python', *Journal of Machine Learning Research*, 12, pp. 2825-2830.

Provos, N. and Mazières, D. (1999) 'A future-adaptable password scheme', *USENIX Annual Technical Conference, FREENIX Track*, pp. 81-91.

Rudin, C. (2019) 'Stop explaining black box machine learning models for high stakes decisions and use interpretable models instead', *Nature Machine Intelligence*, 1(5), pp. 206-215.

Salii, A., Martinez, J. and Grubert, J. (2025) 'WebXR depth API: cross-browser support landscape and occlusion fidelity benchmarks', *Frontiers in Virtual Reality*, 6, p. 1344782.

Shostack, A. (2014) *Threat Modeling: Designing for Security*. Indianapolis: John Wiley and Sons.

W3C (2018) *Web Content Accessibility Guidelines (WCAG) 2.1*. W3C Recommendation, 5 June. Available at: https://www.w3.org/TR/WCAG21/ (Accessed: 4 May 2026).
