// Accessibility toggle module.
// Persists high-contrast and larger-text user preferences in localStorage,
// then re-applies them on every page load by adding/removing body classes.
// This supports the WCAG 2.1 AA target described in section 4a of the report.

const STORAGE_KEY = "techwork-a11y";

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function savePrefs(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function applyPrefs(prefs) {
  document.body.classList.toggle("high-contrast", !!prefs.highContrast);
  document.body.classList.toggle("larger-text",    !!prefs.largerText);
}

function renderToolbar(mount, prefs) {
  mount.innerHTML = `
    <div class="a11y-toggles" role="group" aria-label="Accessibility options">
      <button type="button" class="a11y-toggle js-a11y-contrast"
              aria-pressed="${!!prefs.highContrast}" title="High contrast mode">
        ◐ Contrast
      </button>
      <button type="button" class="a11y-toggle js-a11y-text"
              aria-pressed="${!!prefs.largerText}" title="Larger text">
        A+ Text
      </button>
    </div>
  `;

  const contrastBtn = mount.querySelector(".js-a11y-contrast");
  const textBtn     = mount.querySelector(".js-a11y-text");

  if (prefs.highContrast) contrastBtn.classList.add("active");
  if (prefs.largerText)   textBtn.classList.add("active");

  contrastBtn.addEventListener("click", () => {
    const next = !document.body.classList.contains("high-contrast");
    const stored = loadPrefs();
    stored.highContrast = next;
    applyPrefs(stored);
    savePrefs(stored);
    syncAll();
  });

  textBtn.addEventListener("click", () => {
    const next = !document.body.classList.contains("larger-text");
    const stored = loadPrefs();
    stored.largerText = next;
    applyPrefs(stored);
    savePrefs(stored);
    syncAll();
  });
}

function syncAll() {
  const prefs = loadPrefs();
  document.querySelectorAll(".a11y-mount").forEach(m => {
    const c = m.querySelector(".js-a11y-contrast");
    const t = m.querySelector(".js-a11y-text");
    if (c) { c.classList.toggle("active", !!prefs.highContrast); c.setAttribute("aria-pressed", String(!!prefs.highContrast)); }
    if (t) { t.classList.toggle("active", !!prefs.largerText);   t.setAttribute("aria-pressed", String(!!prefs.largerText)); }
  });
}

export function initAccessibility() {
  const prefs = loadPrefs();
  applyPrefs(prefs);
  document.querySelectorAll(".a11y-mount").forEach(mount => renderToolbar(mount, prefs));
}

// Apply saved preferences immediately on import.
// This runs before the DOM is fully parsed, so the page never flashes
// in the default theme before switching to high contrast.
applyPrefs(loadPrefs());
