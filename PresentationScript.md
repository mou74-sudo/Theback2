# Presentation Script
**COMP5067 — AR-Enhanced Maintenance Support System**
Total budget: ~14 min 30 s | Format: 720p MP4

Each speaker introduces themselves on their first slide so the marker can identify all five voices.

---

## Slide 1 — Title & Team · Jude · ~30 s

"Hi, I'm Jude from the Computing AR pathway. Our project is an AR-Enhanced Maintenance Support System built for Bournemouth Central Bus Depot. Bus depots in the UK still run paper-based maintenance, and the Department for Transport puts the cost of unscheduled fleet downtime at £180 million a year — that's the problem we're prototyping against. I'll hand over to the rest of the team in a moment, but first let me introduce everyone: Abishek on the backend, Shiar on data analytics, Exauce on cyber security, and Mikku on integration and testing."

---

## Slide 2 — Problem & Context · Jude · ~60 s

"So why does this matter? The Department for Transport's 2023 statistics put unscheduled mechanical withdrawals as a leading cause of that £180 million annual downtime figure. On top of that, Palmarini and colleagues identified in 2018 that an ageing mechanic workforce means tacit diagnostic expertise is being lost — experienced mechanics retire and that knowledge goes with them. The depot brief gave us three specific pain points: faults that are invisible until they cause a withdrawal, missing tools with no accountability trail, and paper records that are easy to manipulate. Bournemouth Central is a realistic test case — a mixed-vintage fleet, a constrained device budget, and a fully paper-based fault flow. The research question we set ourselves was: can browser-based AR and an interpretable ML risk score reduce fault-resolution friction under those exact constraints?"

---

## Slide 3 — System Concept · Abishek · ~60 s

"I'm Abishek, responsible for the backend. The system delivers three integrated capabilities in one auditable workflow. First, AR fault inspection: AR.js fiducial markers detect bus components in the browser, and A-Frame renders a live overlay showing the maintenance history and a thirty-day ML risk score. Second, predictive risk scoring: a logistic regression model trained offline on five thousand synthetic records is embedded in the Express backend and returns a score in under a hundred milliseconds. Third, tool accountability: a hash-chain append-only audit log tracks every tool checkout and return, with an admin-only anomaly panel on top. The full stack is A-Frame and AR.js on the frontend, Express on Node 22 serverless on Vercel for the backend, scikit-learn with SHAP for the ML, and Chart.js for the dashboard — all free-tier and browser-based with no specialist hardware."

---

## Slide 4 — Design Rationale · Abishek · ~75 s

"Every significant architectural decision involved a trade-off, and I want to walk through four of them. First, AR tracking: we chose AR.js fiducial markers over WebXR markerless tracking because Salii and colleagues showed in 2025 that the WebXR depth API is still experimental on Android and absent entirely on iOS Safari — markers give us reliable cross-platform tracking in a workshop environment. Second, model choice: we chose logistic regression over a random forest ensemble. Rudin argued in 2019 that transparent models outperform post-hoc explanations for user trust at safety-critical decision points — and our recall after class-weight balancing is competitive with published ensemble figures, as Shiar will show. Third, architecture: a modular monolith over microservices, following Carvalho and colleagues' 2025 finding that this is appropriate for small teams — one Vercel serverless function, one codebase, free tier. Fourth, persistence: in-memory store over MongoDB at TRL-3 for scope discipline, with MongoDB Atlas named explicitly as the TRL-4 upgrade path."

---

## Slide 5 — Demo 1: AR Fault Inspection · Jude · ~90 s

"Back to me for the first demo. I'm going to walk the AR fault inspection flow. Step one — print and display the Hiro marker. Step two — AR.js detects the marker in the browser in around two hundred milliseconds, matching Mojidra and colleagues' 2024 benchmarks for fiducial marker tracking under workshop lighting. Step three — A-Frame renders the fault overlay: title, severity badge, and the thirty-day ML risk score from the backend. Step four — the AR client posts to slash-predict, the overlay updates with the returned probability and risk band within our hundred-millisecond NFR1 budget. Step five — the inspector adds a note and confirms.

FR1 is fully met: both the Hiro fault marker and the Kanji tool marker are detected and overlaid in ar.html. FR2 is partial: overlays are static — there is no depth-aware occlusion. The WebXR depth API is absent on iOS Safari, so we couldn't do per-pixel AR at TRL-3. The TRL-6 path is ARCore and ARKit depth APIs. FR4 is fully met: the predict endpoint returns F1 of 0.850 and AUC of 0.926 inside the latency budget."

---

## Slide 6 — Demo 2: Tool Checkout & Audit · Mikku · ~75 s

"Hi, I'm Mikku, responsible for integration and testing. The second demo covers tool checkout and the hash-chain audit log. A mechanic taps Checkout on a tool card. A simulated QR-scan overlay fires, the action is posted to slash-v1-items-colon-id-slash-move on the backend, and the movement log appends an entry with the action, tool name, user, and timestamp in a single transaction. A DJB2-style hash seals each entry to the previous head of the chain, making the log append-only per session. The chain-integrity badge in the UI re-verifies the whole chain on every update.

FR5 — tool accountability — is fully met: checkout and return are implemented end to end. NFR5 — auditability — is fully met: anomaly detector D3 flags duplicate timestamps, which is the signature of replay or post-hoc modification. This is admin-only. Our walkthrough study found that the tool checkout task, T2, completed in six to nine seconds across all five participants regardless of role, confirming the scan metaphor is legible."

---

## Slide 7 — Cyber Security · Exauce · ~75 s

"I'm Exauce from the cyber security pathway. Let me walk through the security architecture. Passwords are stored as bcrypt hashes at cost ten, following Provos and Mazières' original recommendation. Login returns a JWT signed with HS256, carrying the user's name and role, with an eight-hour expiry. Every slash-v1 route validates the JWT signature and expiry — a missing or expired token gets a 401 with no information about whether the username exists. Admin-only routes additionally check the role claim server-side, so a mechanic hitting slash-v1-reset gets a 403.

We ran a full STRIDE analysis: spoofing is mitigated by JWT expiry plus bcrypt, tampering by the hash-chain log, repudiation by the username-and-timestamp audit trail, information disclosure by mandatory Bearer tokens on all data routes, elevation of privilege by server-signed role claims. DoS rate limiting is documented as a TRL-6 upgrade. The admin panel shows three anomaly detectors: D1 flags high page-load counts, D2 flags unrecognised role values — a sign of client-state manipulation — and D3 flags duplicate timestamps in the movement log. TLS 1.3 comes from the Vercel platform; CORS is locked to the allowed origin environment variable in production."

---

## Slide 8 — Data Analytics Dashboard · Shiar · ~90 s

"I'm Shiar from the data analytics pathway. The analytics dashboard follows Few's 2013 principle of four KPI cards at the top: total faults, open faults, missing tools, and average ML risk score. Below that is a chart grid — fault distribution by component, monthly volume trend, severity breakdown, and the five highest-risk buses from the ML model. The SHAP card shows global feature importance: severity is the dominant predictor, followed by open status. This is the interpretability that Rudin argued for — stakeholders can see why the model flags a fault as high-risk, not just that it does.

The headline ML metrics are F1 of 0.850, AUC-ROC of 0.926 against a random baseline of 0.500, recall of 0.835, and precision of 0.865 on the twelve-fifty holdout set. The dashboard also includes a WCAG 2.1 AA high-contrast toggle and a larger-text toggle, both implemented by Exauce."

---

## Slide 9 — ML Pipeline & Metrics · Shiar · ~75 s

"The pipeline starts with five thousand synthetic records generated to match UK fleet failure rates. Eighteen features go through StandardScaler normalisation and one-hot encoding with drop-first, then into a class-weight-balanced logistic regression from scikit-learn. Class-weight balancing is important here: faults are underrepresented, so without balancing the model would optimise accuracy by ignoring them. The one-thousand-two-fifty holdout gives us the confusion matrix on screen: around seven hundred and one true negatives, one hundred and thirteen false positives, one hundred and three false negatives, and four hundred and ninety-eight true positives. The false-negative rate at threshold 0.50 is 16.5 percent — that is the high-cost cell because a missed fault risks a vehicle withdrawal. Lowering the threshold would trade false negatives for more false positives; we deferred that threshold choice to stakeholder review as it depends on the cost the depot assigns to each error type."

---

## Slide 10 — Integration Walkthrough · Abishek · ~60 s

"The five-step integration trace from Section 4e of the report. Step one: the mechanic logs in as alex.mechanic, receives a JWT, and RBAC immediately hides the admin controls and anomaly panel. Step two: they apply the high-risk filter and select a critical brake caliper fault. Step three: AR.js detects the Hiro marker in around two hundred milliseconds and A-Frame renders the overlay with the title and severity badge. Step four: the AR client posts to slash-predict with the fault's severity and location; the backend returns the thirty-day probability and F1/AUC context within the hundred-millisecond NFR1 budget. Step five: the inspector adds a note, the record is updated, and the dashboard recalculates risk scores on reload. One JWT, one data path — all five pathways integrate at steps four and five."

---

## Slide 11 — Evaluation Against the Brief · Mikku · ~60 s

"Six of seven functional requirements are fully met. FR2 is partial — the AR depth occlusion issue Jude explained earlier. All eight non-functional requirements hit their quantitative targets: slash-predict runs at under 80 milliseconds p95 against a hundred-millisecond target, AR cold-start is around three seconds on mid-range Android against a five-second target, TLS 1.3 is provided by Vercel, JWT and bcrypt are in place, the hash-chain log is per-session, WCAG 2.1 AA toggles are implemented, twenty-eight Jest tests pass on every commit against a floor of twenty, and the whole system runs on Vercel's free tier accessible by any browser. One honest caveat on the ML figures: they are computed on synthetic data, so they are a ceiling, not a deployment guarantee."

---

## Slide 12 — Comparison with Published Work · Shiar · ~45 s

"Against published baselines, our logistic regression at F1 0.850 and AUC 0.926 outperforms Ibrahim and colleagues' random forest ensemble at F1 0.71, Gawde's XGBoost at F1 0.75, Cummins's median LR baseline at F1 0.62, and Marchand's ensemble lifecycle model at F1 0.69. The key driver is class-weight balancing improving recall. The critical caveat, from Nieminen and colleagues, is that synthetic-data metrics are an upper bound — TRL-4 field retraining on real depot records is the essential next step before any of these figures can be treated as deployment-grade."

---

## Slide 13 — Limitations, Ethics & Sustainability · Exauce · ~60 s

"Three technical limitations we named deliberately, not as oversights. The training data is synthetic — metrics are a ceiling. The in-memory store resets on Vercel cold starts, so the demo URL needs a slash-health warm-up before the live recording. And FR2 AR depth occlusion remains absent because the WebXR depth API is not mature. On ethics: the audit log captures mechanic names and timestamps, which is personal data under UK GDPR Article 6(1)(f). A DPIA and privacy notice will be required at TRL-6. There is also a surveillance risk if the log is repurposed for performance management rather than safety audits — admin-only access is the current technical control. The TRL-4 hybrid-data pilot will need an ethics committee review. On sustainability: browser-based AR eliminates specialist hardware, free-tier deployment minimises compute, and predictive maintenance reduces unscheduled withdrawals and extends vehicle service life."

---

## Slide 14 — Pathway Contributions · All · ~75 s total

Each person speaks one sentence:

**Jude:** "I built the AR marker flow in ar.html using AR.js and A-Frame, including the dual-marker UX for faults and tools and the cold-start optimisation that brings AR up in around three seconds."

**Abishek:** "I built the Express REST API, the bcrypt authentication and JWT middleware, and the Vercel serverless deployment including the slash-predict endpoint."

**Shiar:** "I trained the logistic regression on five thousand synthetic records, implemented SHAP global importance, and built the analytics dashboard charts and the PSI drift-monitoring field."

**Exauce:** "I implemented the STRIDE threat model, the WCAG 2.1 AA accessibility toggles, the service worker, and the print stylesheet for paper job sheets."

**Mikku:** "I built the tool board, the hash-chain audit log, the three anomaly detectors, and the twenty-eight-test Jest suite that runs on every commit."

---

## Slide 15 — TRL Roadmap & Reflection · Jude · ~45 s

"The roadmap runs in three steps from here. TRL-4: two months of real depot records, MongoDB Atlas for persistence, and argon2id password hashing. TRL-5: a within-subjects usability trial with two mechanics for one shift each and a false-negative cost discussion with the depot manager. TRL-6: full depot deployment for one month with OpenTelemetry, automated drift-aware retraining, and a formal WCAG audit of the AR surface.

Our reflection in one sentence: three pathways, one prototype — integration was the work, not the polish.

Thank you — we're happy to take questions."

---

## Timing summary

| Slide | Speaker | Budget |
|---|---|---|
| 1 | Jude | 30 s |
| 2 | Jude | 60 s |
| 3 | Abishek | 60 s |
| 4 | Abishek | 75 s |
| 5 | Jude | 90 s |
| 6 | Mikku | 75 s |
| 7 | Exauce | 75 s |
| 8 | Shiar | 90 s |
| 9 | Shiar | 75 s |
| 10 | Abishek | 60 s |
| 11 | Mikku | 60 s |
| 12 | Shiar | 45 s |
| 13 | Exauce | 60 s |
| 14 | All (×5) | 75 s |
| 15 | Jude | 45 s |
| **Total** | | **~14 min 30 s** |

---

## Recording tips

- Each speaker says their name and pathway on their first slide so the marker can identify all five voices.
- Do a dry run at 720p before the real recording — check audio levels and warm up the Vercel URL with a slash-health request first.
- Trim any segment that runs over; the brief hard-caps the video at 15 minutes.
- Export as MP4 H.264, 720p minimum.
