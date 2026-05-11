import {
  getMaintenanceItems,
  confirmInspection,
  getCurrentUser,
  logoutUser
} from "./api.js";

import { showMessage } from "./ui.js";
import { initAccessibility } from "./accessibility.js";

let items = [];
let selectedItem = null;
let currentUser = null;
let markerVisible = false;
let arCameraReady = false;
let lastARRecordMessage = null;

function capitalise(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getRoleMessage(user) {
  if (!user) {
    return "You are not logged in. Return to the dashboard and choose a role before using the AR inspection view.";
  }

  if (user.role === "mechanic") {
    return "Mechanic access: you can view marker overlays and confirm inspections.";
  }

  if (user.role === "supervisor") {
    return "Supervisor access: you can review AR inspection records and confirm inspection activity.";
  }

  if (user.role === "admin") {
    return "Admin access: you can use all AR inspection controls.";
  }

  return "Your role controls what AR actions are available.";
}

function getPriorityItem() {
  const priorityOrder = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const activeItems = items.filter(item =>
    item.status === "open" || item.status === "missing"
  );

  if (activeItems.length === 0) {
    return items[0] || null;
  }

  return activeItems.sort((a, b) => {
    return priorityOrder[b.severity] - priorityOrder[a.severity];
  })[0];
}

function updateAuthUI() {
  currentUser = getCurrentUser();

  const userPill = document.getElementById("ar-user-pill");
  const roleMessage = document.getElementById("ar-role-message");
  const priorityButton = document.getElementById("select-priority-button");
  const clearButton = document.getElementById("clear-selection-button");
  const status = document.getElementById("ar-status");

  if (!currentUser) {
    userPill.textContent = "Not logged in";
    roleMessage.textContent = getRoleMessage(null);
    priorityButton.disabled = true;
    clearButton.disabled = true;
    status.textContent = "AR controls are locked until login.";
    return;
  }

  userPill.textContent = `${currentUser.name} · ${capitalise(currentUser.role)}`;
  roleMessage.textContent = getRoleMessage(currentUser);
  priorityButton.disabled = false;
  clearButton.disabled = false;
}

function renderRecordList() {
  const list = document.getElementById("ar-record-list");

  if (!currentUser) {
    list.innerHTML = `
      <div class="empty-state">
        Login required. Return to the dashboard and choose a role before using AR inspection.
      </div>
    `;
    return;
  }

  if (items.length === 0) {
    list.innerHTML = `<p class="muted">No records available.</p>`;
    return;
  }

  list.innerHTML = items.map(item => `
    <button class="ar-record-button" data-id="${item.id}">
      <strong>${item.title}</strong><br>
      <span class="muted">${item.type} · ${item.severity} · ${item.status}</span>
    </button>
  `).join("");
}

function renderDetailCard(item) {
  const detailCard = document.getElementById("ar-detail-card");
  const status = document.getElementById("ar-status");

  if (!currentUser) {
    detailCard.innerHTML = `
      <h3>Login Required</h3>
      <p class="muted">Return to the dashboard and choose a role before using AR inspection.</p>
    `;

    status.textContent = "AR controls are locked until login.";
    return;
  }

  if (!item) {
    detailCard.innerHTML = `
      <p class="muted">Select a maintenance record or use the priority record button.</p>
    `;

    status.textContent = "Waiting for marker detection.";
    updateARLabel(null);
    return;
  }

  status.textContent = markerVisible
    ? `Marker detected for: ${item.title}`
    : `Selected marker record: ${item.title}`;

  detailCard.innerHTML = `
    <h3>${item.title}</h3>
    <p class="item-meta">${item.location}</p>

    <div class="badge-row">
      <span class="badge ${item.type}">${capitalise(item.type)}</span>
      <span class="badge ${item.severity}">${capitalise(item.severity)}</span>
      <span class="badge ${item.status}">${capitalise(item.status)}</span>
    </div>

    <p>${item.notes}</p>

    <label for="ar-note"><strong>Inspection note</strong></label>
    <textarea id="ar-note" placeholder="Example: Confirmed the marker location and checked the component."></textarea>

    <button class="primary-button" id="ar-confirm-button">
      Confirm Inspection
    </button>
  `;
}

function getSeverityColour(severity) {
  if (severity === "critical" || severity === "high") {
    return "#ef4444";
  }

  if (severity === "medium") {
    return "#f59e0b";
  }

  return "#22c55e";
}

function sendRecordToCamera(record) {
  const iframe = document.getElementById("ar-camera-frame");

  if (!iframe || !iframe.contentWindow) {
    return;
  }

  lastARRecordMessage = {
    type: "set-ar-record",
    record
  };

  iframe.contentWindow.postMessage(lastARRecordMessage, "*");
}

function updateARLabel(item) {
  const helpText = document.getElementById("marker-help-text");

  if (!helpText) {
    return;
  }

  if (!item) {
    helpText.textContent = "Point the camera at a Hiro marker.";
    sendRecordToCamera(null);
    return;
  }

  const record = {
    title: item.title,
    severity: capitalise(item.severity),
    status: capitalise(item.status),
    colour: getSeverityColour(item.severity)
  };

  helpText.textContent = `Point the camera at a Hiro marker for: ${item.title}`;
  sendRecordToCamera(record);
}

async function reloadItems() {
  currentUser = getCurrentUser();

  if (!currentUser) {
    updateAuthUI();
    renderRecordList();
    renderDetailCard(null);
    return;
  }

  items = await getMaintenanceItems();

  updateAuthUI();
  renderRecordList();

  if (selectedItem) {
    selectedItem = items.find(item => item.id === selectedItem.id) || null;
  }

  renderDetailCard(selectedItem);
  updateARLabel(selectedItem);
}

window.addEventListener("message", event => {
  const message = event.data;

  if (!message || !message.type) {
    return;
  }

  if (message.type === "ar-camera-ready") {
    arCameraReady = true;

    if (lastARRecordMessage) {
      const iframe = document.getElementById("ar-camera-frame");
      iframe.contentWindow.postMessage(lastARRecordMessage, "*");
    }

    return;
  }

  if (message.type === "marker-found") {
    markerVisible = true;

    if (!selectedItem) {
      selectedItem = getPriorityItem();
    }

    renderDetailCard(selectedItem);
    updateARLabel(selectedItem);
    showMessage("Hiro marker detected.", "success");
    return;
  }

  if (message.type === "marker-lost") {
    markerVisible = false;
    renderDetailCard(selectedItem);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  initAccessibility();
  updateAuthUI();
  await reloadItems();

  document.getElementById("select-priority-button").addEventListener("click", () => {
    if (!currentUser) {
      showMessage("Please log in from the dashboard before using AR inspection.", "error");
      return;
    }

    const item = getPriorityItem();

    if (!item) {
      showMessage("No maintenance records available.", "error");
      return;
    }

    selectedItem = item;
    markerVisible = false;

    renderDetailCard(item);
    updateARLabel(item);

    showMessage(`${item.title} selected as the AR marker record.`, "success");
  });

  document.getElementById("clear-selection-button").addEventListener("click", () => {
    selectedItem = null;
    markerVisible = false;

    renderDetailCard(null);
    updateARLabel(null);

    showMessage("Marker record selection cleared.", "info");
  });

  document.getElementById("ar-record-list").addEventListener("click", event => {
    if (!currentUser) {
      showMessage("Please log in before selecting AR records.", "error");
      return;
    }

    const button = event.target.closest(".ar-record-button");

    if (!button) {
      return;
    }

    const itemId = Number(button.dataset.id);
    const item = items.find(item => item.id === itemId);

    selectedItem = item;
    markerVisible = false;

    renderDetailCard(item);
    updateARLabel(item);

    showMessage(`${item.title} selected.`, "info");
  });

  document.getElementById("ar-detail-card").addEventListener("click", async event => {
    if (event.target.id !== "ar-confirm-button") {
      return;
    }

    if (!currentUser) {
      showMessage("Please log in before confirming an inspection.", "error");
      return;
    }

    if (!selectedItem) {
      showMessage("Please select a record first.", "error");
      return;
    }

    const noteBox = document.getElementById("ar-note");
    const noteText = noteBox.value.trim();

    if (noteText.length < 3) {
      showMessage("Please add a short inspection note.", "error");
      return;
    }

    try {
      await confirmInspection(selectedItem.id, noteText);
      await reloadItems();
      showMessage("Inspection confirmed and record updated.", "success");
    } catch (error) {
      showMessage(error.message, "error");
    }
  });

  document.getElementById("ar-logout-button").addEventListener("click", async () => {
    await logoutUser();

    selectedItem = null;
    currentUser = null;
    markerVisible = false;

    updateAuthUI();
    renderRecordList();
    renderDetailCard(null);
    updateARLabel(null);

    showMessage("Logged out. AR controls are now locked.", "info");
  });
});