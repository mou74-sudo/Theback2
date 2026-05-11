/**
 * Anomaly and suspicious-behaviour monitoring. TRL-3 rule-based stubs.
 *
 * Three detectors run inline on every page load and data mutation:
 *   D1, Rate detector:       flags if session action count exceeds threshold.
 *   D2, Role-claim drift:    compares current JWT role against stored role.
 *   D3, Audit-log integrity: detects unexpected gaps in the movement log.
 *
 * A TRL-6 replacement would be OpenTelemetry metrics fed to Prometheus
 * plus Alertmanager, with these rule stubs ported to PromQL queries.
 */

const ALERT_KEY   = "anomaly_alerts";
const ACTION_KEY  = "session_action_count";
const RATE_LIMIT  = 20;   // mock threshold: 20 actions per session

function loadAlerts() {
  return JSON.parse(localStorage.getItem(ALERT_KEY) || "[]");
}

function saveAlerts(alerts) {
  localStorage.setItem(ALERT_KEY, JSON.stringify(alerts));
}

function pushAlert(type, message) {
  const alerts = loadAlerts();
  // Deduplicate within same type for this session
  const alreadyOpen = alerts.find(a => a.type === type && !a.resolved);
  if (alreadyOpen) return;

  alerts.unshift({
    id: Date.now(),
    type,
    message,
    timestamp: new Date().toLocaleString(),
    resolved: false
  });
  if (alerts.length > 30) alerts.pop();
  saveAlerts(alerts);
}

function resolveAlert(id) {
  const alerts = loadAlerts();
  const alert  = alerts.find(a => a.id === id);
  if (alert) alert.resolved = true;
  saveAlerts(alerts);
}

// Resets the per-session action counter. Call this on successful login so
// the counter does not carry over from a previous session in the same tab.
export function resetActionCount() {
  localStorage.removeItem(ACTION_KEY);
}

// ── D1: Session request-rate detector ────────────────────────────────────────
function runRateDetector() {
  const count = Number(localStorage.getItem(ACTION_KEY) || 0) + 1;
  localStorage.setItem(ACTION_KEY, count);

  if (count > RATE_LIMIT) {
    pushAlert(
      "rate-exceeded",
      `Session action count (${count}) exceeds threshold (${RATE_LIMIT}). ` +
      `Possible automated or anomalous activity detected. Account: ` +
      `${JSON.parse(localStorage.getItem("maintenance_current_user") || "{}").name || "unknown"}.`
    );
  }
}

// ── D2: Role-claim drift detector ────────────────────────────────────────────
function runRoleDriftDetector() {
  const stored = JSON.parse(localStorage.getItem("maintenance_current_user") || "null");
  if (!stored) return;

  // In production this would compare the JWT claim against the DB record.
  // At TRL-3 we flag if the role field is absent or unrecognised.
  const validRoles = ["mechanic", "supervisor", "admin"];
  if (!validRoles.includes(stored.role)) {
    pushAlert(
      "role-drift",
      `Role claim "${stored.role}" for user "${stored.name}" is not a recognised role. ` +
      `Possible token-manipulation attempt flagged for audit review.`
    );
  }
}

// ── D3: Audit-log integrity check ─────────────────────────────────────────────
function runIntegrityCheck() {
  const log = JSON.parse(localStorage.getItem("tool_movement_log") || "[]");
  if (log.length < 2) return;

  // Check for duplicate timestamps. Would indicate log tampering.
  const timestamps = log.map(e => e.timestamp);
  const dupes = timestamps.filter((t, i) => timestamps.indexOf(t) !== i);
  if (dupes.length > 0) {
    pushAlert(
      "log-integrity",
      `Duplicate timestamp detected in tool movement log (${dupes[0]}). ` +
      `Possible audit-log tampering flagged for security review.`
    );
  }
}

// ── Render the anomaly panel ──────────────────────────────────────────────────
export function renderAnomalyPanel() {
  const container = document.getElementById("anomaly-list");
  if (!container) return;

  const alerts = loadAlerts();
  const active  = alerts.filter(a => !a.resolved);

  if (active.length === 0) {
    container.innerHTML = `
      <div class="anomaly-clear">
        <span class="anomaly-icon">✓</span>
        <span>No active anomalies detected.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = active.map(a => `
    <div class="anomaly-entry">
      <div class="anomaly-header">
        <span class="anomaly-badge anomaly-${a.type}">${a.type.replace("-", " ").toUpperCase()}</span>
        <span class="muted">${a.timestamp}</span>
        <button class="resolve-btn secondary-button" data-alert-id="${a.id}">Resolve</button>
      </div>
      <p class="anomaly-msg">${a.message}</p>
    </div>
  `).join("");

  // Wire up resolve buttons
  container.querySelectorAll(".resolve-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      resolveAlert(Number(btn.dataset.alertId));
      renderAnomalyPanel();
    });
  });
}

// ── Run all detectors then render ─────────────────────────────────────────────
export function runAnomalyDetectors() {
  runRateDetector();
  runRoleDriftDetector();
  runIntegrityCheck();
  renderAnomalyPanel();
}
