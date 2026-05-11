import { mockItems } from "./mockData.js";

const STORAGE_KEY = "maintenance_items";
const USER_KEY = "maintenance_current_user";

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

export async function loginUser(name, role) {
  await wait();

  const user = {
    name,
    role,
    loggedInAt: new Date().toLocaleString()
  };

  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return copy(user);
}

export function getCurrentUser() {
  const stored = localStorage.getItem(USER_KEY);

  if (!stored) {
    return null;
  }

  return JSON.parse(stored);
}

export async function logoutUser() {
  await wait();
  localStorage.removeItem(USER_KEY);
}

export async function getMaintenanceItems() {
  await wait();
  return copy(loadStoredItems());
}

export async function addMaintenanceItem(payload) {
  await wait();

  const items = loadStoredItems();

  const newItem = {
    id: Date.now(),
    type: payload.type,
    title: payload.title,
    location: payload.location,
    severity: payload.severity,
    status: payload.status,
    notes: payload.notes,
    inspectionNotes: []
  };

  items.unshift(newItem);
  saveStoredItems(items);

  return copy(newItem);
}

export async function confirmInspection(itemId, noteText) {
  await wait();

  const items = loadStoredItems();
  const item = items.find(item => item.id === itemId);

  if (!item) {
    throw new Error("Item not found.");
  }

  item.inspectionNotes.push({
    text: noteText,
    createdAt: new Date().toLocaleString()
  });

  if (item.type === "fault") {
    item.status = "inspected";
  }

  if (item.type === "tool") {
    item.status = "returned";
  }

  saveStoredItems(items);

  return copy(item);
}

export async function resetMockData() {
  await wait();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockItems));
  return copy(mockItems);
}