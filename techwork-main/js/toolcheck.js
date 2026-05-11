/**
 * Tool checkout / return simulation module.
 * Implements the brief-mandated tool-accountability flow at TRL-3:
 * checkout and return buttons simulate the QR-scan event that a physical
 * scanner would trigger in a TRL-6 deployment.
 */

import { getMaintenanceItems, getCurrentUser } from "./api.js";

const STORAGE_KEY  = "maintenance_items";
const LOG_KEY      = "tool_movement_log";

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadItems() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function loadLog() {
  return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
}

function appendLog(entry) {
  const log = loadLog();
  log.unshift(entry);
  if (log.length > 50) log.pop();
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

function capitalise(v) {
  return v.charAt(0).toUpperCase() + v.slice(1);
}

// ── Simulate a QR scan with a short animated delay ───────────────────────────
function simulateScan(toolTitle) {
  return new Promise(resolve => {
    const overlay = document.getElementById("qr-overlay");
    const label   = document.getElementById("qr-scan-label");
    label.textContent = `Scanning QR tag for: ${toolTitle}…`;
    overlay.classList.remove("hidden");
    setTimeout(() => {
      overlay.classList.add("hidden");
      resolve();
    }, 1800);
  });
}

// ── Render the tool-board panel ───────────────────────────────────────────────
export function renderToolBoard() {
  const user      = getCurrentUser();
  const items     = loadItems();
  const tools     = items.filter(i => i.type === "tool");
  const container = document.getElementById("tool-board-list");

  if (!container) return;

  if (!user) {
    container.innerHTML = `<p class="muted">Log in to view the tool board.</p>`;
    return;
  }

  if (tools.length === 0) {
    container.innerHTML = `<p class="muted">No tool records found.</p>`;
    return;
  }

  container.innerHTML = tools.map(tool => {
    const isOut     = tool.status === "missing";
    const isBack    = tool.status === "returned";
    const isOpen    = tool.status === "open";

    const actionBtn = (isOut || isOpen)
      ? `<button class="primary-button tool-return-btn" data-id="${tool.id}">↩ Return (Scan)</button>`
      : `<button class="secondary-button tool-checkout-btn" data-id="${tool.id}">↗ Check Out (Scan)</button>`;

    return `
      <article class="tool-card">
        <div class="tool-card-info">
          <strong>${tool.title}</strong>
          <span class="item-meta">${tool.location}</span>
        </div>
        <div class="badge-row">
          <span class="badge tool">Tool</span>
          <span class="badge ${tool.severity}">${capitalise(tool.severity)}</span>
          <span class="badge ${tool.status}">${capitalise(tool.status)}</span>
        </div>
        ${actionBtn}
      </article>
    `;
  }).join("");
}

// ── Render movement log ───────────────────────────────────────────────────────
function renderMovementLog() {
  const container = document.getElementById("movement-log");
  if (!container) return;

  const log = loadLog();

  if (log.length === 0) {
    container.innerHTML = `<p class="muted">No tool movements recorded this session.</p>`;
    return;
  }

  container.innerHTML = log.map(entry => `
    <div class="log-entry">
      <span class="log-action ${entry.action}">${capitalise(entry.action)}</span>
      <span>${entry.toolTitle}</span>
      <span class="muted">by ${entry.user} at ${entry.timestamp}</span>
    </div>
  `).join("");
}

// ── Handle checkout ───────────────────────────────────────────────────────────
async function handleCheckout(itemId) {
  const user  = getCurrentUser();
  const items = loadItems();
  const tool  = items.find(i => i.id === itemId);
  if (!tool || !user) return;

  await simulateScan(tool.title);

  tool.status = "missing";
  saveItems(items);

  appendLog({
    action: "checkout",
    toolTitle: tool.title,
    user: user.name,
    timestamp: new Date().toLocaleTimeString()
  });

  renderToolBoard();
  renderMovementLog();

  // Dispatch event so main.js can refresh KPIs and list
  document.dispatchEvent(new CustomEvent("toolMoved", { detail: { action: "checkout", toolId: itemId } }));
}

// ── Handle return ─────────────────────────────────────────────────────────────
async function handleReturn(itemId) {
  const user  = getCurrentUser();
  const items = loadItems();
  const tool  = items.find(i => i.id === itemId);
  if (!tool || !user) return;

  await simulateScan(tool.title);

  tool.status = "returned";
  saveItems(items);

  appendLog({
    action: "return",
    toolTitle: tool.title,
    user: user.name,
    timestamp: new Date().toLocaleTimeString()
  });

  renderToolBoard();
  renderMovementLog();

  document.dispatchEvent(new CustomEvent("toolMoved", { detail: { action: "return", toolId: itemId } }));
}

// ── Wire up the tool-board section ────────────────────────────────────────────
export function initToolCheck() {
  renderToolBoard();
  renderMovementLog();

  document.getElementById("tool-board-list")?.addEventListener("click", async event => {
    const checkoutBtn = event.target.closest(".tool-checkout-btn");
    const returnBtn   = event.target.closest(".tool-return-btn");

    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      await handleCheckout(Number(checkoutBtn.dataset.id));
    }

    if (returnBtn) {
      returnBtn.disabled = true;
      await handleReturn(Number(returnBtn.dataset.id));
    }
  });
}
