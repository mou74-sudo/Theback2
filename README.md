# AR Maintenance Support System — TRL-3 Prototype

**COMP5067 Technological Innovations in Computing**
Bournemouth University, Level 5 — Group Project

---

## Overview

A browser-based prototype for AR-enhanced maintenance inspection at a bus depot. Mechanics scan physical AR markers to view overlaid fault data and ML-predicted failure risk. Supervisors access an analytics dashboard with fault trends, SHAP feature importance, and high-risk bus alerts.

**Technology stack:** Vanilla ES modules, Chart.js 4, A-Frame 1.4 + AR.js 3.4, Express 4, JWT (jsonwebtoken), scikit-learn (model training), Jest (tests).

---

## Quick Start

### Frontend only (no backend needed)

```bash
cd techwork-main
python3 -m http.server 8080
# Open http://localhost:8080
```

The app detects the backend automatically. If it is not running it falls back to localStorage — all features still work.

### With the real backend

```bash
# Terminal 1 — backend
cd backend
npm install
node server.js
# Runs on http://localhost:3001

# Terminal 2 — frontend
cd techwork-main
python3 -m http.server 8080
# Open http://localhost:8080
```

When the backend is running: login issues real JWTs, data persists to `backend/data.json`, and ML predictions use the actual logistic regression endpoint.

---

## Running the tests

```bash
# From the repo root
npm install
npm test               # ML unit tests (15 tests, no server needed)
npm run test:all       # All tests including backend integration (server must be running)
```

---

## Pages

| Page | URL | Description |
|---|---|---|
| Records dashboard | `/index.html` | Login, add/inspect records, tool board, anomaly panel |
| Analytics dashboard | `/dashboard.html` | Supervisor-only: charts, SHAP, confusion matrix, ML live status |
| AR inspection view | `/ar.html` | Camera-based Hiro/Kanji marker inspection with ML risk overlay |

---

## AR Markers

| Marker | Type | Overlay |
|---|---|---|
| **Hiro** | Fault records | Blue spinning cube, fault title + severity |
| **Kanji** | Tool records | Purple cylinder, tool name + status |

Print the Hiro marker: https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png
Print the Kanji marker: https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/kanji.png

---

## ML Model

The logistic regression model was trained on 5,000 synthetic bus fault records (`train_model.py`).

| Metric | Value |
|---|---|
| F1 score | 0.850 |
| AUC-ROC | 0.926 |
| Recall | 0.835 |
| Precision | 0.865 |
| Training samples | 3,750 |
| Test samples | 1,250 |

Features: fault severity, component type, bus age, mileage, days since service, open/closed status.

The same coefficients are used in both the backend `/predict` endpoint and the frontend fallback in `mlService.js`.

---

## Security notes (TRL-3 scope)

- **JWT**: login issues a signed HS256 token (8h expiry). Protected routes return 401 without a valid token.
- **RBAC**: admin-only routes return 403 for mechanic/supervisor tokens.
- **TRL-6 upgrades needed**: argon2id password hashing, TLS 1.3, refresh tokens, rate limiting, MongoDB persistence.

---

## Project structure

```
techwork-main/       Frontend (ES modules, no build step)
  js/
    api.js           HTTP client with localStorage fallback
    mlService.js     Real LR inference + PSI drift simulation
    dashboard.js     Analytics charts, SHAP, confusion matrix
    ar.js            AR marker control and ML risk injection
    toolcheck.js     QR-scan simulation, hash-chain audit log
    anomaly.js       Three rule-based anomaly detectors
    accessibility.js WCAG 2.1 AA high-contrast / larger-text toggles
  css/style.css      Design system + print stylesheet
  sw.js              Service worker for offline caching

backend/
  server.js          Express API (auth, items CRUD, /predict)
  data.json          Persisted records (auto-created on first run)

tests/
  mlService.test.js  15 unit tests for LR inference and risk banding
  server.test.js     11 integration tests for the REST API

train_model.py       scikit-learn training script (run once to regenerate coefficients)
```
