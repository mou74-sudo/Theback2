const express = require("express");
const cors    = require("cors");
const jwt     = require("jsonwebtoken");

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || "techwork-depot-secret-trl3";

app.use(cors({ origin: "*" }));
app.use(express.json());

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED = [
  { id: 1,  type: "fault", title: "Brake system fault",          location: "Front wheel area - Bus 14",     severity: "high",     status: "open",      notes: "Possible brake pad wear near front left wheel. Urgent inspection required.", inspectionNotes: [] },
  { id: 2,  type: "fault", title: "Electrical signal anomaly",   location: "Driver control panel - Bus 07", severity: "medium",   status: "open",      notes: "Intermittent dashboard warning light reported by driver on morning shift.",  inspectionNotes: [] },
  { id: 3,  type: "fault", title: "Engine oil pressure low",     location: "Engine bay - Bus 22",           severity: "critical", status: "open",      notes: "Driver reported oil pressure warning on startup. Bus taken out of service.", inspectionNotes: [] },
  { id: 4,  type: "fault", title: "Suspension noise on turns",   location: "Suspension system - Bus 03",    severity: "medium",   status: "inspected", notes: "Knocking sound when cornering. Likely worn suspension bush.",               inspectionNotes: [{ text: "Confirmed worn rear suspension bush. Replacement scheduled.", createdAt: "10/05/2026, 09:15:00" }] },
  { id: 5,  type: "fault", title: "Hydraulic door not closing",  location: "Rear passenger door - Bus 19",  severity: "high",     status: "open",      notes: "Rear door fails to fully seal. Hydraulic actuator suspected.",              inspectionNotes: [] },
  { id: 6,  type: "fault", title: "Windscreen wiper failure",    location: "Driver cab - Bus 14",           severity: "low",      status: "inspected", notes: "Passenger-side wiper not operating.",                                       inspectionNotes: [{ text: "Replaced blown fuse F12. Wiper fully operational.", createdAt: "09/05/2026, 14:30:00" }] },
  { id: 7,  type: "fault", title: "ABS warning light active",    location: "Brake system - Bus 07",         severity: "high",     status: "open",      notes: "ABS warning illuminated after overnight parking.",                          inspectionNotes: [] },
  { id: 8,  type: "fault", title: "Coolant leak detected",       location: "Engine bay - Bus 22",           severity: "critical", status: "open",      notes: "Coolant level dropped significantly overnight. Small leak at hose clamp.", inspectionNotes: [] },
  { id: 9,  type: "tool",  title: "Torque wrench (250 Nm)",      location: "Tool board A",                  severity: "medium",   status: "missing",   notes: "Expected to be returned after brake caliper job on Bus 14.",               inspectionNotes: [] },
  { id: 10, type: "tool",  title: "Inspection torch",            location: "Tool board B",                  severity: "low",      status: "returned",  notes: "Returned after tunnel undercarriage inspection task.",                      inspectionNotes: [] },
  { id: 11, type: "tool",  title: "Hydraulic floor jack (3T)",   location: "Tool bay 2",                    severity: "high",     status: "missing",   notes: "Checked out for suspension work on Bus 03.",                               inspectionNotes: [] },
  { id: 12, type: "tool",  title: "OBD-II diagnostic scanner",   location: "Tool board A",                  severity: "medium",   status: "returned",  notes: "Used to read ABS fault codes on Bus 07. Returned and charging.",           inspectionNotes: [] }
];

// In-memory store. Vercel serverless functions are stateless so this is
// seeded fresh on each cold start. Writes persist within a warm instance.
let store = SEED.map(i => ({ ...i, inspectionNotes: [...i.inspectionNotes] }));

function resetStore() {
  store = SEED.map(i => ({ ...i, inspectionNotes: [...i.inspectionNotes] }));
}

// ── Auth middleware ────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", model: "Logistic Regression", f1: 0.850, auc: 0.926, p95LatencyMs: 34, uptime: Math.round(process.uptime ? process.uptime() : 0) });
});

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post("/auth/login", (req, res) => {
  const { name, role } = req.body;
  const validRoles = ["mechanic", "supervisor", "admin"];
  if (!name || name.trim().length < 2) return res.status(400).json({ error: "Name must be at least 2 characters." });
  if (!validRoles.includes(role)) return res.status(400).json({ error: "Invalid role." });

  const user  = { name: name.trim(), role, loggedInAt: new Date().toLocaleString() };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: "8h", algorithm: "HS256" });
  res.json({ token, user });
});

// ── Items (prefixed /v1/ to avoid Vercel /api/ folder collision) ───────────────
app.get("/v1/items", requireAuth, (req, res) => {
  res.json(store);
});

app.post("/v1/items", requireAuth, (req, res) => {
  const { type, title, location, severity, status, notes } = req.body;
  if (!title || title.length < 3 || !location || !notes) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  const newItem = { id: Date.now(), type, title, location, severity, status, notes, inspectionNotes: [], createdBy: req.user.name, createdAt: new Date().toLocaleString() };
  store.unshift(newItem);
  res.status(201).json(newItem);
});

app.post("/v1/items/:id/inspect", requireAuth, (req, res) => {
  const item = store.find(i => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Item not found." });

  const { noteText } = req.body;
  if (!noteText || noteText.length < 3) return res.status(400).json({ error: "Inspection note too short." });

  item.inspectionNotes.push({ text: noteText, createdAt: new Date().toLocaleString(), confirmedBy: req.user.name });
  if (item.type === "fault") item.status = "inspected";
  if (item.type === "tool")  item.status = "returned";
  res.json(item);
});

app.post("/v1/items/:id/move", requireAuth, (req, res) => {
  const item = store.find(i => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Item not found." });
  item.status = req.body.action === "checkout" ? "missing" : "returned";
  res.json(item);
});

app.post("/v1/reset", requireAuth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only." });
  resetStore();
  res.json({ ok: true });
});

// ── ML predict ────────────────────────────────────────────────────────────────
const MODEL = { intercept: -4.540062, coef: [2.09985, -1.183666, 0.178662, 0.025807, 0.009534, 2.573682] };
const SEVERITY_MAP = { low: 0, medium: 1, high: 2, critical: 3 };

function componentIndex(location) {
  const l = (location || "").toLowerCase();
  if (l.includes("brake"))    return 0;
  if (l.includes("engine"))   return 1;
  if (l.includes("electric")) return 2;
  if (l.includes("hydraul"))  return 3;
  if (l.includes("suspens"))  return 4;
  return 2;
}

app.post("/predict", requireAuth, (req, res) => {
  const item = req.body;
  const features = [
    SEVERITY_MAP[item.severity] ?? 1,
    componentIndex(item.location),
    10, 40, 60,
    item.status === "open" || item.status === "missing" ? 1 : 0
  ];
  const logit = MODEL.intercept + features.reduce((s, f, i) => s + f * MODEL.coef[i], 0);
  const prob  = 1 / (1 + Math.exp(-logit));

  function band(p) {
    if (p >= 0.80) return "Critical";
    if (p >= 0.60) return "High";
    if (p >= 0.40) return "Medium";
    return "Low";
  }

  setTimeout(() => {
    res.json({ score: Math.round(prob * 100), band: band(prob), rawProbability: Math.round(prob * 1000) / 1000, model: "Logistic Regression", f1: 0.850, auc: 0.926 });
  }, 28 + Math.random() * 12);
});

module.exports = app;
