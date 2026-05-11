/**
 * Unit tests for the ML service module.
 * Tests the real logistic regression inference logic independently
 * of any network calls or browser APIs.
 */

// Inline the pure logic from mlService.js (no ES module imports needed for Jest)
const MODEL_COEF = {
  intercept: -4.540062,
  coef: [2.09985, -1.183666, 0.178662, 0.025807, 0.009534, 2.573682]
};

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

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

function inferLocally(record) {
  const features = [
    SEVERITY_MAP[record.severity] ?? 1,
    componentIndex(record.location),
    10, 40, 60,
    (record.status === "open" || record.status === "missing") ? 1 : 0
  ];
  const logit = MODEL_COEF.intercept +
    features.reduce((sum, f, i) => sum + f * MODEL_COEF.coef[i], 0);
  return sigmoid(logit);
}

function riskBand(score) {
  if (score >= 0.80) return "Critical";
  if (score >= 0.60) return "High";
  if (score >= 0.40) return "Medium";
  return "Low";
}

// ── riskBand thresholds ───────────────────────────────────────────────────────
describe("riskBand", () => {
  test("returns Critical for score >= 0.80", () => {
    expect(riskBand(0.80)).toBe("Critical");
    expect(riskBand(0.95)).toBe("Critical");
    expect(riskBand(1.00)).toBe("Critical");
  });

  test("returns High for 0.60 <= score < 0.80", () => {
    expect(riskBand(0.60)).toBe("High");
    expect(riskBand(0.70)).toBe("High");
    expect(riskBand(0.79)).toBe("High");
  });

  test("returns Medium for 0.40 <= score < 0.60", () => {
    expect(riskBand(0.40)).toBe("Medium");
    expect(riskBand(0.50)).toBe("Medium");
    expect(riskBand(0.59)).toBe("Medium");
  });

  test("returns Low for score < 0.40", () => {
    expect(riskBand(0.39)).toBe("Low");
    expect(riskBand(0.10)).toBe("Low");
    expect(riskBand(0.00)).toBe("Low");
  });
});

// ── componentIndex mapping ────────────────────────────────────────────────────
describe("componentIndex", () => {
  test("maps brake locations to index 0", () => {
    expect(componentIndex("Front wheel - Brake system")).toBe(0);
  });

  test("maps engine locations to index 1", () => {
    expect(componentIndex("Engine bay - Bus 22")).toBe(1);
  });

  test("defaults to index 2 for unknown locations", () => {
    expect(componentIndex("Unknown area")).toBe(2);
    expect(componentIndex("")).toBe(2);
  });
});

// ── inferLocally produces plausible probabilities ─────────────────────────────
describe("inferLocally", () => {
  test("returns probability between 0 and 1", () => {
    const prob = inferLocally({ severity: "high", location: "Brake system", status: "open" });
    expect(prob).toBeGreaterThan(0);
    expect(prob).toBeLessThan(1);
  });

  test("critical open fault scores higher than low returned fault", () => {
    const high = inferLocally({ severity: "critical", location: "Engine bay", status: "open" });
    const low  = inferLocally({ severity: "low",      location: "Suspension", status: "returned" });
    expect(high).toBeGreaterThan(low);
  });

  test("open status raises probability vs returned status", () => {
    const base = { severity: "medium", location: "Electrical panel" };
    const open     = inferLocally({ ...base, status: "open" });
    const returned = inferLocally({ ...base, status: "returned" });
    expect(open).toBeGreaterThan(returned);
  });

  test("brake component scores higher risk than suspension for same severity", () => {
    const base = { severity: "high", status: "open" };
    const brake = inferLocally({ ...base, location: "Brake system" });
    const susp  = inferLocally({ ...base, location: "Suspension" });
    expect(brake).toBeGreaterThan(susp);
  });
});

// ── sigmoid function ──────────────────────────────────────────────────────────
describe("sigmoid", () => {
  test("sigmoid(0) = 0.5", () => {
    expect(sigmoid(0)).toBeCloseTo(0.5, 5);
  });

  test("sigmoid outputs are between 0 and 1", () => {
    [-10, -1, 0, 1, 10].forEach(z => {
      const s = sigmoid(z);
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThan(1);
    });
  });

  test("large positive z approaches 1", () => {
    expect(sigmoid(20)).toBeCloseTo(1, 3);
  });

  test("large negative z approaches 0", () => {
    expect(sigmoid(-20)).toBeCloseTo(0, 3);
  });
});
