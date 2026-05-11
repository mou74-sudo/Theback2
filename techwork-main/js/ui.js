function capitalise(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function renderWorkflow(item) {
  const hasNote = item.inspectionNotes.length > 0;
  const isConfirmed = item.status === "inspected" || item.status === "returned";

  const steps = [
    {
      label: "Record selected",
      complete: true,
      current: false
    },
    {
      label: "Details reviewed",
      complete: true,
      current: false
    },
    {
      label: "Inspection note added",
      complete: hasNote,
      current: !hasNote
    },
    {
      label: "Inspection confirmed",
      complete: isConfirmed,
      current: hasNote && !isConfirmed
    }
  ];

  return `
    <div class="workflow">
      <h3>Inspection Progress</h3>
      <div class="workflow-steps">
        ${steps.map((step, index) => `
          <div class="workflow-step ${step.complete ? "complete" : ""} ${step.current ? "current" : ""}">
            <span class="step-number">${index + 1}</span>
            <span>${step.label}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

export function renderSummary(items) {
  const summaryGrid = document.getElementById("summary-grid");

  const openFaults = items.filter(item => item.type === "fault" && item.status === "open").length;
  const missingTools = items.filter(item => item.type === "tool" && item.status === "missing").length;
  const highSeverity = items.filter(item => item.severity === "high" || item.severity === "critical").length;

  summaryGrid.innerHTML = `
    <article class="summary-card">
      <h3>Open Faults</h3>
      <strong>${openFaults}</strong>
    </article>

    <article class="summary-card">
      <h3>Missing Tools</h3>
      <strong>${missingTools}</strong>
    </article>

    <article class="summary-card">
      <h3>High Severity Issues</h3>
      <strong>${highSeverity}</strong>
    </article>
  `;
}

export function renderItems(items) {
  const itemList = document.getElementById("item-list");

  itemList.innerHTML = items.map(item => `
    <article class="item-card">
      <div>
        <h3>${item.title}</h3>
        <p class="item-meta">${item.location}</p>
      </div>

      <div class="badge-row">
        <span class="badge ${item.type}">${item.type}</span>
        <span class="badge ${item.severity}">${item.severity}</span>
        <span class="badge ${item.status}">${item.status}</span>
      </div>

      <p>${item.notes}</p>

      <button class="primary-button inspect-button" data-id="${item.id}">
        Inspect
      </button>
    </article>
  `).join("");
}

export function renderDetails(item) {
  const detailsPanel = document.getElementById("details-panel");

  if (!item) {
    detailsPanel.innerHTML = `
      <h2>Inspection Details</h2>
      <p class="muted">Choose a fault or tool from the list.</p>
    `;
    return;
  }

  const noteHistory = item.inspectionNotes.length
    ? item.inspectionNotes.map(note => `
        <p><strong>${note.createdAt}</strong><br>${note.text}</p>
      `).join("")
    : `<p class="muted">No inspection notes yet.</p>`;

  detailsPanel.innerHTML = `
    <h2>${item.title}</h2>
    <p class="item-meta">${item.location}</p>

    <div class="badge-row">
      <span class="badge ${item.type}">${capitalise(item.type)}</span>
      <span class="badge ${item.severity}">${capitalise(item.severity)}</span>
      <span class="badge ${item.status}">${capitalise(item.status)}</span>
    </div>

    ${renderWorkflow(item)}

    <p>${item.notes}</p>

    <label for="inspection-note"><strong>Inspection note</strong></label>
    <textarea id="inspection-note" placeholder="Example: Checked the brake area and confirmed visible wear."></textarea>

    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
      <button class="primary-button" id="confirm-button" data-id="${item.id}">
        Confirm Inspection
      </button>
      <button class="secondary-button print-hide" onclick="window.print()" type="button">
        Print Job Sheet
      </button>
    </div>

    <div class="note-list">
      <h3>Previous Notes</h3>
      ${noteHistory}
    </div>
  `;
}

export function showMessage(message, type = "info") {
  const messageBox = document.getElementById("message-box");

  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;

  setTimeout(() => {
    messageBox.className = "message-box hidden";
  }, 3000);
}