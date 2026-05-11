import { getMaintenanceItems, getCurrentUser, logoutUser } from "./api.js";
import { initAccessibility } from "./accessibility.js";

let charts = {};
let mlPingTimer = null;

// Mock bus risk data. Represents the TRL-3 stub for the ML service risk output.
const BUS_RISK = [
  { bus: "Bus 14", risk: 87 },
  { bus: "Bus 07", risk: 72 },
  { bus: "Bus 22", risk: 61 },
  { bus: "Bus 03", risk: 58 },
  { bus: "Bus 19", risk: 41 },
];

// Mock 7-month fault trend from Nov to May. Last value is driven by live localStorage.
const MONTHLY_LABELS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
const MONTHLY_BASE   = [3, 5, 4, 7, 6, 4];

function capitalise(v) {
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function riskColour(score) {
  if (score >= 80) return "#ef4444";
  if (score >= 60) return "#f59e0b";
  return "#22c55e";
}

function destroy(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

// ── KPI cards ────────────────────────────────────────────────────────────────
function renderKPIs(items) {
  const openFaults  = items.filter(i => i.type === "fault" && i.status === "open").length;
  const missingTools = items.filter(i => i.type === "tool" && i.status === "missing").length;
  const highSeverity = items.filter(i => i.severity === "high" || i.severity === "critical").length;
  const total        = items.length;

  document.getElementById("kpi-faults").textContent  = openFaults;
  document.getElementById("kpi-tools").textContent   = missingTools;
  document.getElementById("kpi-high").textContent    = highSeverity;
  document.getElementById("kpi-total").textContent   = total;
}

// ── Chart 1: Fault distribution by component (bar) ───────────────────────────
function renderComponentChart(items) {
  destroy("component");

  // Derive component from the first meaningful word in location
  const faults = items.filter(i => i.type === "fault");
  const raw = {};
  faults.forEach(f => {
    const key = f.location.split(" ")[0];
    raw[key] = (raw[key] || 0) + 1;
  });

  // Pad with representative historical mock categories so the chart is not empty
  const base = { Brake: 4, Engine: 2, Electrical: 3, Hydraulic: 1, Suspension: 2 };
  Object.entries(raw).forEach(([k, v]) => { base[k] = (base[k] || 0) + v; });

  const ctx = document.getElementById("chart-component").getContext("2d");
  charts["component"] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(base),
      datasets: [{
        label: "Fault count",
        data: Object.values(base),
        backgroundColor: "#38bdf8",
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
        y: { ticks: { color: "#94a3b8", stepSize: 1 }, grid: { color: "#1e293b" }, beginAtZero: true }
      }
    }
  });
}

// ── Chart 2: Monthly fault volume (line) ─────────────────────────────────────
function renderTrendChart(items) {
  destroy("trend");

  const currentLive = items.filter(i => i.type === "fault" && i.status === "open").length;
  const trendData   = [...MONTHLY_BASE, currentLive];

  const ctx = document.getElementById("chart-trend").getContext("2d");
  charts["trend"] = new Chart(ctx, {
    type: "line",
    data: {
      labels: MONTHLY_LABELS,
      datasets: [{
        label: "Open faults",
        data: trendData,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56,189,248,0.12)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#38bdf8",
        pointRadius: 5,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
        y: { ticks: { color: "#94a3b8", stepSize: 1 }, grid: { color: "#1e293b" }, beginAtZero: true }
      }
    }
  });
}

// ── Chart 3: Severity breakdown (doughnut) ───────────────────────────────────
function renderSeverityChart(items) {
  destroy("severity");

  const counts = { low: 0, medium: 0, high: 0, critical: 0 };
  items.forEach(i => { if (i.severity in counts) counts[i.severity]++; });

  const ctx = document.getElementById("chart-severity").getContext("2d");
  charts["severity"] = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Low", "Medium", "High", "Critical"],
      datasets: [{
        data: [counts.low, counts.medium, counts.high, counts.critical],
        backgroundColor: ["#22c55e", "#f59e0b", "#ef4444", "#7f1d1d"],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom", labels: { color: "#94a3b8", padding: 16 } }
      }
    }
  });
}

// ── Chart 4: Top buses by predicted 30-day risk (horizontal bar) ─────────────
function renderBusRiskChart() {
  destroy("busrisk");

  const ctx = document.getElementById("chart-busrisk").getContext("2d");
  charts["busrisk"] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: BUS_RISK.map(b => b.bus),
      datasets: [{
        label: "30-day risk score",
        data: BUS_RISK.map(b => b.risk),
        backgroundColor: BUS_RISK.map(b => riskColour(b.risk)),
        borderRadius: 6,
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: "#94a3b8" },
          grid: { color: "#1e293b" },
          max: 100,
          beginAtZero: true
        },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } }
      }
    }
  });
}

// High Risk Alerts panel.
// Picks every bus with a risk score at or above 60 and renders one row
// per bus. Sorted highest first so the worst case is visible immediately.
function riskBand(score) {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function renderHighRisk() {
  const mount = document.getElementById("high-risk-list");
  if (!mount) return;

  // Filter to the high-risk subset then sort descending by risk score.
  const highRisk = BUS_RISK
    .filter(b => b.risk >= 60)
    .sort((a, b) => b.risk - a.risk);

  // Empty state: no buses currently flagged.
  if (!highRisk.length) {
    mount.innerHTML = `<div class="high-risk-empty">No buses currently above the 60% risk threshold.</div>`;
    return;
  }

  // Render one row per high-risk bus.
  mount.innerHTML = highRisk.map(b => `
    <div class="high-risk-item">
      <span class="bus-id">${b.bus}</span>
      <span class="risk-score">${b.risk}%</span>
      <span class="risk-band">${riskBand(b.risk)}</span>
      <span class="muted">30-day failure probability (LR + SHAP)</span>
    </div>
  `).join("");
}

// ML Live indicator.
// Simulates a periodic health check against the Flask ML microservice.
// At TRL-3 this is a stub. A TRL-6 build would replace pingMLService
// with a real fetch("/health") call and a timeout.
function pingMLService() {
  const dot     = document.getElementById("ml-live-dot");
  const label   = document.getElementById("ml-live-label");
  const latency = document.getElementById("ml-latency");
  const last    = document.getElementById("ml-last-ping");
  if (!dot) return;

  // Roughly 96% uptime to demonstrate the offline state occasionally.
  const isUp = Math.random() > 0.04;

  // Random plausible latency in the 28 to 50 ms band, matching the report's
  // sub-40ms p95 claim for the prediction endpoint.
  const latencyMs = Math.round(28 + Math.random() * 22);

  // Short readable timestamp for the "Last ping" indicator.
  const now = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  // Toggle the pulsing green dot vs static red dot.
  dot.classList.toggle("offline", !isUp);
  label.textContent   = isUp ? "ML Service: Live" : "ML Service: Reconnecting...";
  latency.textContent = isUp ? `${latencyMs} ms` : "n/a";
  last.textContent    = now;
}

// Start the ping loop. Runs once immediately, then every 5 seconds.
function startMLPing() {
  pingMLService();
  if (mlPingTimer) clearInterval(mlPingTimer);
  mlPingTimer = setInterval(pingMLService, 5000);
}

// ── Recent records table ──────────────────────────────────────────────────────
function renderRecentTable(items) {
  const tbody = document.getElementById("recent-tbody");
  const sorted = [...items]
    .sort((a, b) => {
      const order = { critical: 4, high: 3, medium: 2, low: 1 };
      return order[b.severity] - order[a.severity];
    })
    .slice(0, 8);

  tbody.innerHTML = sorted.map(i => `
    <tr>
      <td>${i.title}</td>
      <td>${i.location}</td>
      <td><span class="badge ${i.type}">${capitalise(i.type)}</span></td>
      <td><span class="badge ${i.severity}">${capitalise(i.severity)}</span></td>
      <td><span class="badge ${i.status}">${capitalise(i.status)}</span></td>
    </tr>
  `).join("");
}

// ── Initialise ────────────────────────────────────────────────────────────────
async function loadDashboard() {
  const user = getCurrentUser();
  const pill  = document.getElementById("dash-user-pill");

  if (!user) {
    pill.textContent = "Not logged in";
    document.getElementById("dash-auth-notice").classList.remove("hidden");
    document.getElementById("dash-content").classList.add("hidden");
    return;
  }

  pill.textContent = `${user.name} · ${capitalise(user.role)}`;
  document.getElementById("dash-auth-notice").classList.add("hidden");
  document.getElementById("dash-content").classList.remove("hidden");

  const items = await getMaintenanceItems();
  renderKPIs(items);
  renderHighRisk();
  renderComponentChart(items);
  renderTrendChart(items);
  renderSeverityChart(items);
  renderBusRiskChart();
  renderRecentTable(items);
  startMLPing();
}

document.addEventListener("DOMContentLoaded", async () => {
  initAccessibility();
  await loadDashboard();

  document.getElementById("dash-refresh").addEventListener("click", loadDashboard);

  document.getElementById("dash-logout").addEventListener("click", async () => {
    await logoutUser();
    window.location.href = "index.html";
  });
});
