/**
 * API module. Talks to the Express backend when available,
 * falls back to localStorage so the frontend still works standalone.
 *
 * The backend runs on localhost:3001. A TRL-6 deployment would point
 * BASE_URL at the production server and add HTTPS + refresh-token logic.
 */

import { mockItems } from "./mockData.js";

const BASE_URL    = "http://localhost:3001";
const STORAGE_KEY = "maintenance_items";
const USER_KEY    = "maintenance_current_user";
const TOKEN_KEY   = "maintenance_jwt";

let useBackend = false;

// Test whether the backend is reachable. Called once on module load.
async function detectBackend() {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      useBackend = true;
      console.info("[api] Backend detected. Using real server.");
    }
  } catch {
    console.info("[api] Backend not reachable. Using localStorage fallback.");
  }
}

// Run detection immediately so it completes before the first API call.
const backendReady = detectBackend();

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

function copy(data) {
  return JSON.parse(JSON.stringify(data));
}

function wait(ms = 200) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadStoredItems() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockItems));
    return copy(mockItems);
  }
  return JSON.parse(stored);
}

function saveStoredItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function loginUser(name, role) {
  await backendReady;

  if (useBackend) {
    const res  = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role })
    });
    if (!res.ok) throw new Error((await res.json()).error || "Login failed.");
    const { token, user } = await res.json();
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }

  await wait();
  const user = { name, role, loggedInAt: new Date().toLocaleString() };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return copy(user);
}

export function getCurrentUser() {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export async function logoutUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

// ── Items ─────────────────────────────────────────────────────────────────────
export async function getMaintenanceItems() {
  await backendReady;

  if (useBackend) {
    const res = await fetch(`${BASE_URL}/api/items`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load items.");
    return res.json();
  }

  await wait();
  return copy(loadStoredItems());
}

export async function addMaintenanceItem(payload) {
  await backendReady;

  if (useBackend) {
    const res = await fetch(`${BASE_URL}/api/items`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to add item.");
    return res.json();
  }

  await wait();
  const items   = loadStoredItems();
  const newItem = { id: Date.now(), ...payload, inspectionNotes: [] };
  items.unshift(newItem);
  saveStoredItems(items);
  return copy(newItem);
}

export async function confirmInspection(itemId, noteText) {
  await backendReady;

  if (useBackend) {
    const res = await fetch(`${BASE_URL}/api/items/${itemId}/inspect`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ noteText })
    });
    if (!res.ok) throw new Error((await res.json()).error || "Inspection failed.");
    return res.json();
  }

  await wait();
  const items = loadStoredItems();
  const item  = items.find(i => i.id === itemId);
  if (!item) throw new Error("Item not found.");

  item.inspectionNotes.push({ text: noteText, createdAt: new Date().toLocaleString() });
  if (item.type === "fault") item.status = "inspected";
  if (item.type === "tool")  item.status = "returned";

  saveStoredItems(items);
  return copy(item);
}

export async function moveToolItem(itemId, action) {
  await backendReady;

  if (useBackend) {
    const res = await fetch(`${BASE_URL}/api/items/${itemId}/move`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ action })
    });
    if (!res.ok) throw new Error("Tool move failed.");
    return res.json();
  }

  await wait();
  const items = loadStoredItems();
  const item  = items.find(i => i.id === itemId);
  if (!item) throw new Error("Item not found.");
  item.status = action === "checkout" ? "missing" : "returned";
  saveStoredItems(items);
  return copy(item);
}

export async function resetMockData() {
  await backendReady;

  if (useBackend) {
    const res = await fetch(`${BASE_URL}/api/reset`, {
      method: "POST",
      headers: authHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || "Reset failed.");
    return getMaintenanceItems();
  }

  await wait();
  saveStoredItems(mockItems);
  return copy(mockItems);
}

// ── ML predict (calls real backend /predict endpoint) ─────────────────────────
export async function fetchPrediction(item) {
  await backendReady;

  if (useBackend) {
    const res = await fetch(`${BASE_URL}/predict`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error("Prediction failed.");
    return res.json();
  }

  // localStorage fallback: use the mlService simulator
  return null;
}
