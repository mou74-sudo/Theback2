# Presentation Script
**COMP5067 — AR-Enhanced Maintenance Support System**
Total budget: ~14 min 30 s · Format: 720p MP4

Tip: read each slide aloud before recording. If you run out of breath mid-sentence, split it. These are starting points, not lines to memorise.

---

## Slide 1 — Title & Team · Jude · ~30 s

"Hi, I'm Jude, and this is our AR-Enhanced Maintenance Support System for Bournemouth Central Bus Depot.

The problem in one line: UK bus depots still run paper-based maintenance, and that costs the industry around £180 million a year in unscheduled downtime. Our prototype uses browser-based augmented reality and a machine learning risk score to change that — no specialist hardware, no app install, just a phone camera and a marker.

I'm joined by Abishek on the backend, Shiar on data analytics, Exauce on cyber security, and Mikku on integration and testing."

---

## Slide 2 — Problem & Context · Jude · ~60 s

"So where does that £180 million figure come from? The Department for Transport's 2023 statistics identify mechanical defects as the leading cause of unscheduled bus withdrawals in England. That's the financial side.

The human side is what Palmarini and colleagues flagged back in 2018 — mechanics retire and take their diagnostic instincts with them. There's no system capturing what they know, so the next person starts from scratch.

The project brief gave us three concrete pain points: faults that stay invisible until a bus breaks down mid-route, tools that go missing with no audit trail, and paper records that can be changed after the fact.

Bournemouth Central is a perfect test case for this. Mixed-vintage fleet, limited device budget, everything on paper. The question we set out to answer was simple: can we solve all three of those problems in a browser, with no extra hardware, at TRL-3?"

---

## Slide 3 — System Concept · Abishek · ~60 s

"I'm Abishek, and I'll walk you through how the system actually works.

We built three things that connect into one workflow. First, an AR inspection layer — a mechanic points their phone at a printed marker on or near a bus component, and the browser overlays the fault record and a live thirty-day risk score straight onto the camera view. No app download.

Second, a predictive risk engine — a logistic regression model running on the backend that scores each fault and returns a result in under a hundred milliseconds.

Third, a tool accountability system — every checkout and return gets logged in a tamper-evident hash chain, with an admin panel that flags anything suspicious.

The whole stack is A-Frame and AR.js on the frontend, Express on Node 22 deployed to Vercel, scikit-learn for the ML, and Chart.js for the dashboard. Free tier, runs in any browser."

---

## Slide 4 — Design Rationale · Abishek · ~75 s

"Every major decision we made came with a trade-off, so let me be upfront about four of them.

AR tracking — we looked at WebXR markerless first, which would let you point at any surface. But Salii and colleagues showed last year that the depth API is still experimental on Android and completely absent on iOS Safari. In a workshop with mixed-vintage phones, that's a dealbreaker. Fiducial markers work reliably on everything.

Model choice — we went with logistic regression rather than a random forest. Rudin's 2019 argument settled it for us: when a mechanic is deciding whether to pull a bus from service, they need to understand why the model is flagging it, not just that it did. And as Shiar will show, our recall is competitive with published ensemble figures anyway.

Architecture — one Express serverless function on Vercel rather than microservices. Carvalho and colleagues put it well: for a team of five at prototype stage, a modular monolith is the right call.

Persistence — in-memory store rather than a database. Resets on cold start, yes, but that's a named TRL-4 upgrade to MongoDB Atlas. At TRL-3, shipping scope discipline matters more than persistence."

---

## Slide 5 — Demo 1: AR Fault Inspection · Jude · ~90 s

"Back to me for the first live demo — AR fault inspection.

The flow has five steps. You print the Hiro marker and hold it in front of the camera. AR.js picks it up in around 200 milliseconds — that matches Mojidra and colleagues' 2024 benchmarks for fiducial tracking under workshop lighting conditions. A-Frame then draws the fault overlay directly over the marker: the fault title, severity badge, and the ML risk score from the backend. The client sends the fault data to the predict endpoint, and the overlay updates with a thirty-day probability and risk band — that round trip stays inside our 100 millisecond target. Finally, the mechanic adds an inspection note and confirms.

Against the brief: FR1 is fully met — both the Hiro fault marker and the Kanji tool marker trigger overlays in the AR view. FR4 is fully met — the risk score comes back inside the latency budget with F1 of 0.850 and AUC of 0.926 shown in the overlay.

FR2 is the honest partial. The overlays are flat — they don't occlude correctly around 3D geometry. The WebXR depth API that would fix this doesn't exist on iOS Safari yet. Our TRL-6 path is ARCore and ARKit. We've documented it rather than hidden it."

---

## Slide 6 — Demo 2: Tool Checkout & Audit · Mikku · ~75 s

"Hi, I'm Mikku, I handled integration and testing. My demo is the tool board and the audit chain.

When a mechanic checks out a tool, they tap the Checkout button on the tool card. A simulated QR-scan overlay fires — mimicking what a real asset tag would trigger — and the backend logs the action, the tool, the user, and a timestamp in one transaction. Each log entry gets hashed against the previous one using a DJB2-style chain, so you can't insert or modify an entry without breaking the chain. The integrity badge in the UI re-verifies the whole chain every time a new entry lands.

FR5 — tool accountability — is fully met. NFR5 — auditability — is also fully met. Anomaly detector D3 watches for duplicate timestamps, which is what a replay attack or a backdated entry looks like.

One number from our walkthrough: the tool checkout task took between six and nine seconds across all five participants, regardless of their role. The scan metaphor works — people got it without being told."

---

## Slide 7 — Cyber Security · Exauce · ~75 s

"I'm Exauce from the cyber security pathway.

Authentication first. Passwords are stored as bcrypt hashes at cost ten — the original Provos and Mazières recommendation and still the Express ecosystem standard. Login returns a JWT signed with HS256, eight-hour expiry, carrying only the user's name and role. Every protected route checks that token. A missing or expired token gets a 401. A mechanic trying to reach an admin-only endpoint gets a 403. The error messages don't confirm whether a username exists.

We ran a full STRIDE analysis. Spoofing is handled by bcrypt and short-lived JWTs. Tampering is handled by the hash-chain log. Repudiation is covered by the username-and-timestamp audit trail. Information disclosure is prevented by mandatory Bearer tokens on every data route. Elevation of privilege is blocked because role claims are server-signed — you can't just change your role in the browser. Rate limiting for denial-of-service is a documented TRL-6 item.

The admin panel surfaces three anomaly detectors: D1 catches unusual page-load volume, D2 flags unrecognised role values — a sign someone has tampered with their session state — and D3 catches duplicate timestamps in the movement log. TLS 1.3 comes from Vercel; CORS is locked to the allowed-origin environment variable in production."

---

## Slide 8 — Data Analytics Dashboard · Shiar · ~90 s

"I'm Shiar from the data analytics pathway, and I'll cover the dashboard and the ML results.

The dashboard layout follows Few's 2013 principle — four KPI cards at the top so the most critical numbers are visible at a glance: total faults, open faults, missing tools, and the average ML risk score. Below that is a chart grid: fault distribution by component, monthly volume trend, severity breakdown, and the five highest-risk buses.

The SHAP card is what ties it together. It shows which features are actually driving the risk predictions — severity is dominant, open status is second. This is Rudin's interpretability argument in practice: a mechanic or supervisor can look at the dashboard and understand why the model is recommending action on a particular bus, not just that it is.

The headline numbers on the holdout set: F1 of 0.850, AUC-ROC of 0.926 against a random baseline of 0.500, recall of 0.835, precision of 0.865. The predict endpoint returns those scores in under 35 milliseconds at the 95th percentile. I'll explain how we got there on the next slide."

---

## Slide 9 — ML Pipeline & Metrics · Shiar · ~75 s

"The training data is five thousand synthetic records generated to reflect UK fleet failure rates. Eighteen features go through standard scaling and one-hot encoding, then into a class-weight-balanced logistic regression from scikit-learn. The class-weight balancing step is critical — faults are underrepresented in real maintenance data, so without it the model would just predict 'no fault' most of the time and still look accurate.

The holdout is twelve hundred and fifty records. The confusion matrix gives us roughly 700 true negatives, 113 false positives, 103 false negatives, and 498 true positives. The false-negative rate is 16.5 percent at a threshold of 0.5 — that's the cell that matters most, because a missed fault is a bus that fails in service.

We could lower the threshold to cut false negatives further, but that trades them for more false positives — unnecessary inspections. That threshold decision depends on what the depot manager thinks each type of error costs, so we've left it as a documented stakeholder choice rather than making it ourselves."

---

## Slide 10 — Integration Walkthrough · Abishek · ~60 s

"This is the five-step trace from Section 4e of the report — the path that joins all five pathways together.

Step one: the mechanic logs in as alex.mechanic and gets a JWT back. RBAC immediately hides the admin controls and anomaly panel from their view. Step two: they filter by high risk and select the critical brake caliper fault. Step three: they hold the phone over the Hiro marker — AR.js detects it in around 200 milliseconds and renders the overlay. Step four: the AR client posts to the predict endpoint; the backend returns the thirty-day probability and the F1 and AUC context inside the 100 millisecond NFR1 budget. Step five: they add an inspection note, the record updates, and the dashboard recalculates on reload.

One JWT, one data path — all five pathways converge at steps four and five."

---

## Slide 11 — Evaluation Against the Brief · Mikku · ~60 s

"Six of seven functional requirements are fully met. FR2 is the only partial, and that's the AR depth occlusion gap Jude covered.

All eight non-functional requirements hit their targets. The predict endpoint runs at under 80 milliseconds at the 95th percentile, well inside the 100 millisecond budget. AR cold-start is around three seconds on a mid-range Android device, inside the five-second target. TLS 1.3 comes from Vercel. JWT and bcrypt are in place. The hash-chain log runs per-session. WCAG 2.1 AA toggles are implemented. Twenty-eight Jest tests pass on every commit, eight above the floor of twenty. And the whole system runs on Vercel's free tier, accessible from any browser.

The one caveat we're putting on the record ourselves: the ML figures are from synthetic data. They're a ceiling on real-world performance, not a deployment guarantee."

---

## Slide 12 — Comparison with Published Work · Shiar · ~45 s

"Our logistic regression scores F1 of 0.850 and AUC of 0.926. Against published work: Ibrahim and colleagues' random forest ensemble is at F1 0.71, Gawde's XGBoost at 0.75, Cummins's median logistic regression baseline at 0.62, and Marchand's ensemble model at 0.69. Class-weight balancing is the main reason we outperform the other LR results.

The caveat from Nieminen and colleagues is important here: synthetic-data metrics are an upper bound. TRL-4 retraining on real depot records is the critical next step before any of these numbers mean anything in the field."

---

## Slide 13 — Limitations, Ethics & Sustainability · Exauce · ~60 s

"I want to be upfront about the limitations rather than bury them. Three technical ones: the training data is synthetic, so the metrics are a ceiling. The in-memory store resets on Vercel cold starts, which is why we hit the health endpoint before recording the demo. And the AR surface doesn't yet meet WCAG 2.1 AA — XR accessibility tooling is still immature industry-wide.

On ethics: the audit log holds mechanic names and timestamps, which is personal data under UK GDPR Article 6(1)(f). A DPIA and privacy notice are required before TRL-6. There's also a surveillance risk — if the log gets used for performance management instead of safety audits, it's harmful. Admin-only access is the current control, and it would need a stronger policy at TRL-5.

On sustainability: no specialist hardware, free-tier hosting, and predictive maintenance that keeps buses running longer rather than pulling them from service unnecessarily."

---

## Slide 14 — Pathway Contributions · All · ~75 s total

*Each person speaks one sentence. Go in this order: Jude, Abishek, Shiar, Exauce, Mikku.*

**Jude:** "I built the AR layer — the dual-marker flow in ar.html, the A-Frame fault and tool overlays, and the cold-start optimisation that gets AR up in around three seconds."

**Abishek:** "I built the Express REST API, the bcrypt and JWT authentication middleware, and the Vercel serverless deployment including the predict endpoint."

**Shiar:** "I generated the training data, trained and evaluated the logistic regression, implemented SHAP feature importance, and built the dashboard charts and the PSI drift-monitoring field."

**Exauce:** "I delivered the STRIDE threat model, the WCAG 2.1 AA accessibility toggles, the service worker for offline resilience, and the print stylesheet for paper job sheets."

**Mikku:** "I built the tool board, the hash-chain audit log, all three anomaly detectors, and the twenty-eight test Jest suite."

---

## Slide 15 — TRL Roadmap & Reflection · Jude · ~45 s

"Three more steps to get this into production.

TRL-4: swap the synthetic training data for two months of real depot records, move to MongoDB Atlas, and upgrade password hashing to argon2id. TRL-5: run a within-subjects usability trial with two mechanics for one shift each, and have a frank conversation with the depot manager about where to set the false-negative threshold. TRL-6: full depot for one month, OpenTelemetry for observability, automated drift-aware retraining, and a formal WCAG audit of the AR surface.

Three pathways, one prototype — integration was the work, not the polish.

Thanks very much — we're happy to take questions."

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
| 14 | All × 5 | 75 s |
| 15 | Jude | 45 s |
| **Total** | | **~14 min 30 s** |

---

## Recording checklist

- Hit the Vercel `/health` endpoint to warm up the instance before you start recording
- Each speaker says their name on their first slide — the marker needs to hear all five voices
- Record a dry run first and check nobody goes over their time budget
- Export as MP4 H.264, 720p minimum
- The brief hard-caps the video at 15 minutes — trim ruthlessly if needed
