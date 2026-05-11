import {
  getMaintenanceItems,
  addMaintenanceItem,
  confirmInspection,
  resetMockData,
  loginUser,
  logoutUser,
  getCurrentUser
} from "./api.js";

import {
  renderSummary,
  renderItems,
  renderDetails,
  showMessage
} from "./ui.js";

import { initToolCheck, renderToolBoard } from "./toolcheck.js";
import { runAnomalyDetectors, renderAnomalyPanel } from "./anomaly.js";
import { initAccessibility } from "./accessibility.js";

let items = [];
let selectedItemId = null;
let activeFilter = "all";
let currentUser = null;

function capitalise(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getFilteredItems() {
  if (activeFilter === "faults") {
    return items.filter(item => item.type === "fault");
  }

  if (activeFilter === "tools") {
    return items.filter(item => item.type === "tool");
  }

  if (activeFilter === "open") {
    return items.filter(item => item.status === "open");
  }

  if (activeFilter === "missing") {
    return items.filter(item => item.status === "missing");
  }

  if (activeFilter === "high-risk") {
    return items.filter(item => item.severity === "high" || item.severity === "critical");
  }

  return items;
}

function getFilterTitle() {
  const titles = {
    all: "All Records",
    faults: "Fault Records",
    tools: "Tool Records",
    open: "Open Issues",
    missing: "Missing Tools",
    "high-risk": "High Risk Records"
  };

  return titles[activeFilter] || "All Records";
}

function getRoleMessage(user) {
  if (!user) {
    return "No role selected.";
  }

  if (user.role === "mechanic") {
    return "Mechanic access: you can review records, add inspection notes, and confirm inspections. Admin-only controls are hidden.";
  }

  if (user.role === "supervisor") {
    return "Supervisor access: you can review all records, inspect issues, and monitor the dashboard. Admin-only reset controls are hidden.";
  }

  if (user.role === "admin") {
    return "Admin access: you can use all prototype controls, including resetting the demo data.";
  }

  return "Your role determines which prototype controls are shown.";
}

function updateAuthUI() {
  const loginScreen = document.getElementById("login-screen");
  const appHeader = document.getElementById("app-header");
  const appShell = document.getElementById("app-shell");
  const userPill = document.getElementById("user-pill");
  const roleMessage = document.getElementById("role-message");
  const adminOnlyElements = document.querySelectorAll(".admin-only");

  currentUser = getCurrentUser();

  if (!currentUser) {
    loginScreen.classList.remove("hidden");
    appHeader.classList.add("hidden");
    appShell.classList.add("hidden");
    return;
  }

  loginScreen.classList.add("hidden");
  appHeader.classList.remove("hidden");
  appShell.classList.remove("hidden");

  userPill.textContent = `${currentUser.name} · ${capitalise(currentUser.role)}`;
  roleMessage.textContent = getRoleMessage(currentUser);

  adminOnlyElements.forEach(element => {
    if (currentUser.role === "admin") {
      element.classList.remove("hidden");
    } else {
      element.classList.add("hidden");
    }
  });

  // Supervisor + admin can access analytics dashboard link
  document.querySelectorAll(".supervisor-only").forEach(el => {
    if (currentUser.role === "supervisor" || currentUser.role === "admin") {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });
}

function updateFilterButtons() {
  const filterButtons = document.querySelectorAll(".filter-button");

  filterButtons.forEach(button => {
    if (button.dataset.filter === activeFilter) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

function renderFilteredList() {
  const filteredItems = getFilteredItems();

  document.getElementById("list-title").textContent = getFilterTitle();

  document.getElementById("list-count").textContent =
    `${filteredItems.length} record${filteredItems.length === 1 ? "" : "s"} shown. Select an item to inspect it.`;

  if (filteredItems.length === 0) {
    document.getElementById("item-list").innerHTML = `
      <div class="empty-state">
        No records match this filter.
      </div>
    `;
    return;
  }

  renderItems(filteredItems);
}

async function loadPage() {
  items = await getMaintenanceItems();

  renderSummary(items);
  renderFilteredList();
  updateFilterButtons();

  const selectedItem = items.find(item => item.id === selectedItemId);
  renderDetails(selectedItem || null);

  // Tool board and anomaly panel update on every page reload
  renderToolBoard();
  runAnomalyDetectors();
}

document.addEventListener("DOMContentLoaded", async () => {
  initAccessibility();
  updateAuthUI();

  if (currentUser) {
    await loadPage();
    initToolCheck();
  }

  // Refresh KPI cards and records list when a tool is checked out or returned
  document.addEventListener("toolMoved", async () => {
    items = await getMaintenanceItems();
    renderSummary(items);
    renderFilteredList();
    showMessage("Tool movement recorded.", "success");
  });

  document.getElementById("login-form").addEventListener("submit", async event => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const name     = formData.get("name").trim();
    const password = formData.get("password");
    const role     = formData.get("role");

    if (name.length < 2) {
      alert("Please enter a username.");
      return;
    }

    try {
      await loginUser(name, password, role);
    } catch (err) {
      showMessage(err.message || "Login failed.", "error");
      return;
    }
    updateAuthUI();
    await loadPage();
    initToolCheck();

    showMessage(`Logged in as ${capitalise(role)}.`, "success");
  });

  document.getElementById("logout-button").addEventListener("click", async () => {
    await logoutUser();

    selectedItemId = null;
    activeFilter = "all";
    currentUser = null;

    updateAuthUI();
  });

  document.getElementById("reset-data-button").addEventListener("click", async () => {
    if (!currentUser || currentUser.role !== "admin") {
      showMessage("Only admin users can reset demo data.", "error");
      return;
    }

    selectedItemId = null;
    activeFilter = "all";

    await resetMockData();
    await loadPage();

    showMessage("Demo data has been reset.", "success");
  });

  document.getElementById("filter-buttons").addEventListener("click", event => {
    if (!event.target.classList.contains("filter-button")) {
      return;
    }

    activeFilter = event.target.dataset.filter;
    selectedItemId = null;

    renderFilteredList();
    updateFilterButtons();
    renderDetails(null);

    showMessage(`Filter changed to ${getFilterTitle()}.`, "info");
  });

  document.getElementById("add-item-form").addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentUser) {
      showMessage("Please log in before adding a record.", "error");
      return;
    }

    const formData = new FormData(event.target);

    const payload = {
      type: formData.get("type"),
      title: formData.get("title").trim(),
      location: formData.get("location").trim(),
      severity: formData.get("severity"),
      status: formData.get("status"),
      notes: formData.get("notes").trim()
    };

    if (
      payload.title.length < 3 ||
      payload.location.length < 3 ||
      payload.notes.length < 3
    ) {
      showMessage("Please complete the title, location, and notes properly.", "error");
      return;
    }

    try {
      const createdItem = await addMaintenanceItem(payload);

      selectedItemId = createdItem.id;
      activeFilter = "all";
      event.target.reset();

      await loadPage();

      const selectedItem = items.find(item => item.id === selectedItemId);
      renderDetails(selectedItem);

      showMessage("New maintenance record added.", "success");
    } catch (error) {
      showMessage(error.message, "error");
    }
  });

  document.getElementById("item-list").addEventListener("click", event => {
    if (!event.target.classList.contains("inspect-button")) {
      return;
    }

    selectedItemId = Number(event.target.dataset.id);
    const selectedItem = items.find(item => item.id === selectedItemId);

    renderDetails(selectedItem);
    showMessage(`${selectedItem.title} selected for inspection.`, "info");
  });

  document.getElementById("details-panel").addEventListener("click", async event => {
    if (event.target.id !== "confirm-button") {
      return;
    }

    if (!currentUser) {
      showMessage("Please log in before confirming an inspection.", "error");
      return;
    }

    const noteBox = document.getElementById("inspection-note");
    const noteText = noteBox.value.trim();

    if (noteText.length < 3) {
      showMessage("Please add a short inspection note before confirming.", "error");
      return;
    }

    try {
      await confirmInspection(selectedItemId, noteText);
      await loadPage();
      showMessage("Inspection confirmed and status updated.", "success");
    } catch (error) {
      showMessage(error.message, "error");
    }
  });
});