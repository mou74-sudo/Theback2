# Group Presentation Outline

**COMP5067 Coursework 1 — AR-Enhanced Maintenance Support System**
Bournemouth Central Bus Depot, TRL-3 prototype.

Format: **15 slides max, 15-minute video max, 720p MP4**. Each slide includes a presenter and approximate time budget so the team can rehearse against the cap. Total time budget = 14 min 30 s of speaking plus a 30-second buffer.

The structure maps directly to the brief's marking criteria (page 9):

- Slides 1–4 cover system concept and design rationale (feeds the **Group Report** and **Innovation & Integration** marks).
- Slides 5–10 cover the artefact demo (feeds the **Artefact** and **Pathway Contributions** marks).
- Slides 11–13 cover evaluation and reflection (feeds the **Group Report** evaluation criterion).
- Slides 14–15 cover group process and next steps (feeds **Pathway Contributions** and **Group Presentation** marks).

---

## Slide 1 — Title and team (Jude, 30 s)

- Title: AR-Enhanced Maintenance Support System for Bournemouth Central Bus Depot
- Group members and pathways: Jude (Computing/AR), Abishek (Computing/Backend), Shiar (Data Analytics), Exauce (Cyber Security), Mikku (Integration & Testing)
- One-line problem statement: "Bus depots still run paper-based maintenance, and £180 m/year in UK fleet downtime says that does not scale."
- Vercel demo URL on slide for the marker to follow live.

## Slide 2 — Problem and context (Jude, 60 s)

- DfT figure on unscheduled withdrawals.
- Three pain points named in the brief: invisible faults, missing tools, manipulated records.
- Why a small depot: device budget, mixed-vintage fleet, paper flow.
- Brief snippet on screen: "TRL 3 prototype, public transport context."

## Slide 3 — System concept (Abishek, 60 s)

- One architecture diagram (re-use Figure 6 from the report at full slide width).
- Three integrated capabilities: AR overlay, ML risk score, audit-grade tool tracking.
- Tech stack one-liner: AR.js + A-Frame + Express + scikit-learn + Vercel.

## Slide 4 — Design rationale and key trade-offs (Abishek, 75 s)

- AR.js over WebXR markerless: tracking drift under workshop lighting (Mojidra et al., 2024).
- Logistic regression over random forest: interpretability (Rudin, 2019).
- Modular monolith over microservices: team-of-five reality (Carvalho et al., 2025).
- In-memory store over MongoDB: TRL-3 scope, named upgrade path.
- Each bullet ends with the citation, signalling the report's academic backbone.

## Slide 5 — Live demo: AR fault inspection (Jude, 90 s)

- Camera on the printed Hiro marker.
- Blue cube overlay with title, severity, ML risk badge.
- Talk over: this is FR1, FR2, FR4 firing together.
- Backup: pre-recorded screen capture inserted on this slide in case the live demo glitches.

## Slide 6 — Live demo: tool checkout and audit chain (Mikku, 75 s)

- Kanji marker → tool record → simulated QR-scan → hash-chain log entry.
- Show the audit-chain integrity badge updating.
- Talk over: this is FR5 plus NFR5 (immutable per-session chain).

## Slide 7 — Cyber security walkthrough (Exauce, 75 s)

- Login flow: bcrypt verify → JWT issue (HS256, 8-hour expiry).
- Show 401 on missing/expired token, 403 on a mechanic hitting `/v1/reset`.
- STRIDE table appears as a thumbnail; one named threat per Spoofing/Tampering/Elevation row.
- Anomaly panel: D1 page-load rate, D2 role-set, D3 duplicate timestamps.

## Slide 8 — Data analytics dashboard (Shiar, 90 s)

- KPI cards, severity breakdown, monthly volume, top-5 risk list.
- Open the SHAP card and explain severity = dominant feature.
- ML status bar: F1 0.850, AUC 0.926, p95 latency 34 ms.

## Slide 9 — ML pipeline and metrics (Shiar, 75 s)

- 5,000 synthetic records, class-weight-balanced LR.
- Confusion matrix and ROC side by side.
- One trade-off slide caption: "16.5% FN at threshold 0.5; lowering threshold trades FN for FP, deferred to stakeholder review."

## Slide 10 — Integration walkthrough (Abishek, 60 s)

- The Section 4e five-step trace, condensed to one slide.
- Emphasise that mechanic login, AR scan, prediction call, and dashboard recalculation use the same JWT and the same data path.

## Slide 11 — Evaluation against the brief (Mikku, 60 s)

- FR coverage table (6/7 met, FR2 partial because of WebXR depth-API maturity).
- NFR coverage table (all quantitative targets met).
- One honest line: "synthetic data ceiling — figures are feasibility, not deployment."

## Slide 12 — Comparison with published work (Shiar, 45 s)

- Table 11 from the report on the slide.
- One sentence: "Our LR is competitive with published RF and XGBoost on synthetic data; field data is the next step."

## Slide 13 — Limitations, ethics, sustainability (Exauce, 60 s)

- Three limitations: synthetic data, in-memory store, AR-surface accessibility gap.
- Three ethics dimensions: GDPR/audit, labour-relations risk, synthetic-data ethics burden.
- Frame as deliberate scope choices, not oversights.

## Slide 14 — Pathway contributions (each owner speaks, 75 s total)

- Computing (Jude + Abishek): AR overlay design + Express API + Vercel deploy.
- Cyber Security (Exauce): bcrypt + JWT + RBAC + STRIDE + path-based service-worker bypass.
- Data Analytics (Shiar): LR training, SHAP, dashboard charts, PSI drift stub.
- Integration (Mikku): tool board, audit chain, anomaly panel, 28-test Jest suite.
- Format: each member speaks one sentence on the slide; the slide visually shows a four-quadrant attribution map.

## Slide 15 — TRL roadmap and reflection (Jude closes, 45 s)

- TRL-4 (real data, MongoDB Atlas, argon2id) → TRL-5 (two pilot mechanics) → TRL-6 (full depot, OpenTelemetry, drift retraining, WCAG audit).
- One reflection sentence: "Three pathways, one prototype — integration was the work, not the polish."
- Thank-you and demo link on screen.

---

## Recording checklist

- Run a dry recording at 720p first; check audio levels and that the Vercel demo is warm before clicking the marker.
- Each speaker introduces themselves on their first slide ("This is Shiar from the data analytics pathway…") so the marker can hear all five voices and tick the contribution box.
- Trim any segment over its time budget; the brief caps the video at 15 minutes.
- Export as MP4 H.264, 720p minimum.

## Slide preparation checklist

- One readable visual per slide, font size 24 pt minimum.
- Citations on every claim slide.
- Slide 5 and 6 must have a pre-recorded fallback in case the live demo stalls.
- Use the same colour scheme as the dashboard so the artefact and slides feel coherent.
