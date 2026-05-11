/**
 * ML service simulator.
 *
 * At TRL-3 we run pure frontend, so this module stands in for the Flask
 * microservice described in s4d of the report. A TRL-6 deployment swaps
 * predictMaintenance for a real fetch call to POST /predict on the
 * Flask service, and the rest of the dashboard code stays unchanged.
 *
 * The numbers here mirror the report:
 *   F1: 0.638, AUC-ROC: 0.773, recall: 0.751, p95 latency: under 40 ms.
 *   SHAP feature importance ordering: Severity, Component, Bus Age, Mileage.
 */

// Static model metadata reported by /health.
export const MODEL_INFO = {
  name: "Logistic Regression",
  f1: 0.638,
  auc: 0.773,
  recall: 0.751,
  precision: 0.553,
  p95LatencyMs: 38,
  trainSamples: 5000,
  testSamples: 1250
};

// SHAP mean absolute values (Figure 8 in the report).
// Severity dominates, with component and bus age as secondary signal.
export const SHAP_FEATURES = [
  { feature: "Fault Severity",   importance: 0.42 },
  { feature: "Component Type",   importance: 0.21 },
  { feature: "Bus Age (years)",  importance: 0.17 },
  { feature: "Mileage (10k km)", importance: 0.11 },
  { feature: "Days Since Service", importance: 0.06 },
  { feature: "Status",           importance: 0.03 }
];

// Confusion matrix from Figure 9 in the report.
// 1,250 test samples, class-weight balanced.
export const CONFUSION_MATRIX = {
  truePositive: 432,
  falsePositive: 225,
  trueNegative: 500,
  falseNegative: 93,
  total: 1250
};

// Map severity strings to a numeric weight used by the logistic model.
function severityWeight(severity) {
  return { low: 0.15, medium: 0.40, high: 0.70, critical: 0.90 }[severity] || 0.20;
}

// Map component category to a numeric risk multiplier.
function componentWeight(location = "") {
  const key = location.toLowerCase();
  if (key.includes("brake"))    return 1.20;
  if (key.includes("engine"))   return 1.10;
  if (key.includes("electric")) return 1.05;
  if (key.includes("hydraul"))  return 1.00;
  if (key.includes("suspens"))  return 0.95;
  return 0.85;
}

// Convert raw risk score to a band label.
export function riskBand(score) {
  if (score >= 0.80) return "Critical";
  if (score >= 0.60) return "High";
  if (score >= 0.40) return "Medium";
  return "Low";
}

/**
 * Predict 30-day failure probability for a single record.
 * Mirrors the report s4e Step 4 call: POST /predict.
 * Returns a Promise so callers can await it just like a real fetch.
 */
export async function predictMaintenance(record) {
  // Simulate p95 sub-40ms latency.
  await new Promise(resolve => setTimeout(resolve, 28 + Math.random() * 12));

  const base = severityWeight(record.severity);
  const mult = componentWeight(record.location);

  // Aggregate to a probability in [0, 1], with mild noise for realism.
  const noise = (Math.random() - 0.5) * 0.06;
  const prob  = Math.min(0.98, Math.max(0.04, base * mult + noise));

  return {
    score: Math.round(prob * 100),
    band:  riskBand(prob),
    rawProbability: prob,
    model: MODEL_INFO.name,
    f1: MODEL_INFO.f1,
    auc: MODEL_INFO.auc
  };
}

/**
 * Population Stability Index (PSI) drift simulator.
 *
 * Real PSI compares two distributions, expected vs observed. Here we
 * report a plausible value that varies slightly each call so the UI
 * shows a live monitoring signal during the demo.
 */
export function getDriftStatus() {
  const psi = 0.08 + Math.random() * 0.06;
  let state = "stable";
  if (psi > 0.20) state = "retrain";
  else if (psi > 0.10) state = "warning";

  return {
    psi: Math.round(psi * 1000) / 1000,
    state,
    windowSize: 500,
    threshold: 0.10
  };
}
