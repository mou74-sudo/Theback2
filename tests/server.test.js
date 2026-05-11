/**
 * Integration tests for the Express backend.
 * Tests auth (JWT), items CRUD, and the predict endpoint.
 */

const http = require("http");

const BASE = "http://localhost:3001";

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = new URL(BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: data ? { ...headers, "Content-Length": Buffer.byteLength(data) } : headers
    };

    const req = http.request(options, res => {
      let raw = "";
      res.on("data", chunk => { raw += chunk; });
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });

    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

let adminToken    = "";
let mechanicToken = "";
let createdItemId = null;

describe("Health endpoint", () => {
  test("GET /health returns ok", async () => {
    const res = await request("GET", "/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.f1).toBeGreaterThan(0);
  });
});

describe("Auth", () => {
  test("POST /auth/login returns a JWT for valid credentials", async () => {
    const res = await request("POST", "/auth/login", { name: "Test Admin", role: "admin" });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.role).toBe("admin");
    adminToken = res.body.token;
  });

  test("POST /auth/login returns a JWT for mechanic role", async () => {
    const res = await request("POST", "/auth/login", { name: "Test Mechanic", role: "mechanic" });
    expect(res.status).toBe(200);
    mechanicToken = res.body.token;
  });

  test("rejects invalid role", async () => {
    const res = await request("POST", "/auth/login", { name: "Bad", role: "hacker" });
    expect(res.status).toBe(400);
  });

  test("rejects name shorter than 2 chars", async () => {
    const res = await request("POST", "/auth/login", { name: "A", role: "mechanic" });
    expect(res.status).toBe(400);
  });
});

describe("Items - protected routes", () => {
  test("GET /v1/items requires auth", async () => {
    const res = await request("GET", "/v1/items");
    expect(res.status).toBe(401);
  });

  test("GET /v1/items returns array when authenticated", async () => {
    const res = await request("GET", "/v1/items", null, adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("POST /v1/items creates a new record", async () => {
    const payload = {
      type: "fault",
      title: "Test fault from Jest",
      location: "Brake system - Bus 99",
      severity: "high",
      status: "open",
      notes: "Created by automated test suite."
    };
    const res = await request("POST", "/v1/items", payload, adminToken);
    expect(res.status).toBe(201);
    expect(res.body.title).toBe(payload.title);
    expect(typeof res.body.id).toBe("number");
    createdItemId = res.body.id;
  });

  test("POST /v1/items/:id/inspect updates status to inspected", async () => {
    const res = await request("POST", `/v1/items/${createdItemId}/inspect`, { noteText: "Test inspection note from Jest." }, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("inspected");
    expect(res.body.inspectionNotes.length).toBeGreaterThan(0);
  });
});

describe("Predict endpoint", () => {
  test("POST /predict returns a score between 0 and 100", async () => {
    const res = await request("POST", "/predict", {
      severity: "high", location: "Brake system", status: "open"
    }, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.score).toBeGreaterThanOrEqual(0);
    expect(res.body.score).toBeLessThanOrEqual(100);
    expect(["Low","Medium","High","Critical"]).toContain(res.body.band);
  });

  test("critical fault scores higher than low fault", async () => {
    const [high, low] = await Promise.all([
      request("POST", "/predict", { severity: "critical", location: "Engine bay", status: "open" }, adminToken),
      request("POST", "/predict", { severity: "low",      location: "Suspension", status: "returned" }, adminToken)
    ]);
    expect(high.body.score).toBeGreaterThan(low.body.score);
  });
});
