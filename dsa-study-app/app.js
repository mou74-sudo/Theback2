/* app.js — v2: mock exam, animated graph, swipe gestures, polish */

const STATE = {
  route: "home", routeArg: null, history: [],
  flashIndex: 0, flashSet: null, flashFilter: null,
  bigOIndex: 0, bigOScore: 0, bigOAnswered: false, bigOOrder: null,
  streak: 0, mock: null
};

const STORE = {
  load() { try { return JSON.parse(localStorage.getItem("dsa_app")) || {}; } catch { return {}; } },
  save(d) { localStorage.setItem("dsa_app", JSON.stringify(d)); },
  get(k, fb) { const d = this.load(); return k in d ? d[k] : fb; },
  set(k, v) { const d = this.load(); d[k] = v; this.save(d); }
};

function applyTheme() {
  const theme = STORE.get("theme", "dark");
  document.documentElement.dataset.theme = theme;
  document.getElementById("theme-btn").textContent = theme === "dark" ? "☼" : "☾";
}
document.getElementById("theme-btn").addEventListener("click", () => {
  STORE.set("theme", STORE.get("theme", "dark") === "dark" ? "light" : "dark");
  applyTheme();
});
applyTheme();

(function tickStreak() {
  const today = new Date().toISOString().slice(0,10);
  const last = STORE.get("lastVisit", null);
  let streak = STORE.get("streak", 0);
  if (last !== today) {
    const yest = new Date(Date.now() - 86400000).toISOString().slice(0,10);
    streak = last === yest ? streak + 1 : 1;
    STORE.set("streak", streak);
    STORE.set("lastVisit", today);
  }
  STATE.streak = streak;
})();

const SCREENS = {};

function go(route, arg) {
  if (STATE.route !== route || STATE.routeArg !== arg) {
    STATE.history.push({ route: STATE.route, arg: STATE.routeArg });
    if (STATE.history.length > 30) STATE.history.shift();
  }
  STATE.route = route; STATE.routeArg = arg;
  if (route !== "mock") stopMockTimer();
  render();
}
function back() {
  const prev = STATE.history.pop();
  if (prev) { STATE.route = prev.route; STATE.routeArg = prev.arg; render(); }
  else go("home");
}
document.getElementById("back-btn").addEventListener("click", back);
document.querySelectorAll(".tabbar .tab").forEach(t => {
  t.addEventListener("click", () => { STATE.history = []; go(t.dataset.route); });
});

const TITLES = {
  home:       { t: "DSA Study",        s: "COMP5066 · Exam revision" },
  flashcards: { t: "Flashcards",       s: "Q1 · concept review" },
  bigO:       { t: "Big-O Quiz",       s: "Q2 · complexity practice" },
  sort:       { t: "Sort Visualiser",  s: "Q3 · step-by-step" },
  bst:        { t: "BST Builder",      s: "Q4 · same format, different numbers" },
  graph:      { t: "Graph Traversal",  s: "Q5 · BFS / DFS practice" },
  mock:       { t: "Mock Exam",        s: "Full 2-hour timed simulation" },
  lecture:    { t: "Lecture",          s: "Notes & key points" },
  lectures:   { t: "Lectures",         s: "All 12 topics" }
};

function render() {
  const r = STATE.route;
  const meta = TITLES[r] || TITLES.home;
  document.getElementById("screen-title").textContent = meta.t;
  document.getElementById("screen-subtitle").textContent = meta.s;
  document.getElementById("back-btn").hidden = (r === "home");
  document.querySelectorAll(".tabbar .tab").forEach(t => t.classList.toggle("active", t.dataset.route === r));
  const app = document.getElementById("app");
  app.innerHTML = "";
  (SCREENS[r] || SCREENS.home)(app, STATE.routeArg);
  window.scrollTo({ top: 0, behavior: "instant" });
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
    else if (v === true) node.setAttribute(k, "");
    else if (v !== false && v != null) node.setAttribute(k, v);
  }
  for (const c of children) {
    if (c == null || c === false) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}
function toast(msg, type, ms = 1700) {
  const t = el("div", { class: "toast" + (type ? " " + type : "") }, msg);
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function daysUntil() {
  const target = new Date("2026-05-26T14:00:00");
  return Math.ceil((target - new Date()) / 86400000);
}
function confetti() {
  const colors = ["#10b981", "#34d399", "#f59e0b", "#ef4444", "#38bdf8", "#a78bfa", "#f472b6"];
  for (let i = 0; i < 60; i++) {
    const p = el("div", { class: "confetti-piece" });
    p.style.left = Math.random() * 100 + "vw";
    p.style.top = "-20px";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    p.style.animationDelay = (Math.random() * 0.4) + "s";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 2200);
  }
}

/* ============================================================
 *  HOME
 * ============================================================ */
const ICONS = {
  cards:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="14" height="11" rx="2"/><path d="M7 3h14v11"/></svg>`,
  bigO:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M9 15l6-6"/></svg>`,
  sort:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="13" width="4" height="8" rx="1"/><rect x="10" y="9" width="4" height="12" rx="1"/><rect x="17" y="5" width="4" height="16" rx="1"/></svg>`,
  bst:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.2"/><circle cx="6" cy="13" r="2.2"/><circle cx="18" cy="13" r="2.2"/><circle cx="9" cy="20" r="2"/><circle cx="15" cy="20" r="2"/><path d="M10.4 6.6L7.2 11.4M13.6 6.6l3.2 4.8M6.8 14.8L8.5 18.4M17.2 14.8L15.5 18.4"/></svg>`,
  graph:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="12" cy="14" r="2.2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/><path d="M7.5 7.2L11 13M16.5 7.2L13 13M11 15l-3.5 3.4M13 15l3.5 3.4"/></svg>`,
  books:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v16a2 2 0 0 0 2 2h14V4H6a2 2 0 0 0-2 2z"/><path d="M8 7h9M8 11h9M8 15h6"/></svg>`,
  clock:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg>`,
  arrow:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>`,
  flame:  `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4-1 3 1 4 2 4 0-3-2-5 0-9z"/></svg>`
};

SCREENS.home = function(root) {
  const days = daysUntil();

  const hero = el("section", { class: "hero" },
    el("h2", {}, "Smash the DSA exam"),
    el("p", {}, EXAM_INFO.date + " · " + EXAM_INFO.time),
    el("div", { class: "countdown-big" },
      el("span", { class: "num" }, days >= 0 ? String(days) : "0"),
      el("span", { class: "unit" }, days === 1 ? "day to go" : days >= 0 ? "days to go" : "exam done")
    ),
    el("div", { style: { marginTop: "8px" } },
      el("span", { class: "countdown" }, EXAM_INFO.location.split(",")[0]),
      STATE.streak > 0 ? " " : null,
      STATE.streak > 0 ? el("span", { class: "streak", html: ICONS.flame + " " + STATE.streak + " day streak" }) : null
    )
  );
  root.appendChild(hero);

  root.appendChild(el("button", { class: "mock-cta", onclick: () => go("mock") },
    el("div", { class: "ico", html: ICONS.clock }),
    el("div", {},
      el("div", { class: "ttl" }, "Take the full mock exam"),
      el("div", { class: "sub" }, "2 hours · 5 questions · auto-marked")
    ),
    el("div", { class: "arr", html: ICONS.arrow })
  ));

  root.appendChild(el("div", { class: "section-label" }, "Quick practice"));

  root.appendChild(el("section", { class: "quick-grid" },
    quickTile(ICONS.cards,  "Concept cards", "Q1 · swipe to study",    "flashcards", ""),
    quickTile(ICONS.bigO,   "Big-O quiz",    "Q2 · complexity",         "bigO",       "blue"),
    quickTile(ICONS.sort,   "Sort visualiser","Q3 · step-by-step",      "sort",       "orange"),
    quickTile(ICONS.bst,    "BST builder",   "Q4 · animated tree",      "bst",        "purple"),
    quickTile(ICONS.graph,  "Graph traversal","Q5 · queue + stack",     "graph",      "teal"),
    quickTile(ICONS.books,  "Lectures",      "All 12 topics",           "lectures",   "red")
  ));

  root.appendChild(el("div", { class: "section-label" }, "The exam · 5 questions"));
  const qWrap = el("section", { class: "card" });
  EXAM_INFO.questions.forEach((q, idx) => {
    qWrap.appendChild(el("div", { style: { padding: "10px 0", borderTop: idx === 0 ? "none" : ".5px solid var(--separator-soft)" } },
      el("div", { class: "row-between" },
        el("strong", { style: { letterSpacing: "-0.01em" } }, "Q" + q.n),
        q.note ? el("span", { class: "tag-pill amber" }, q.note) : el("span", { class: "tag-pill" }, q.topic)
      ),
      el("p", { style: { fontSize: "13px", margin: "4px 0 0" } }, q.desc)
    ));
  });
  root.appendChild(qWrap);

  root.appendChild(el("div", { class: "section-label" }, "Lectures 1 – 12"));
  const gridWrap = el("div", { class: "lect-grid" });
  LECTURES.forEach(l => {
    gridWrap.appendChild(el("button", { class: "lect-tile" + (l.examQ ? " exam" : ""), onclick: () => go("lecture", l.n) },
      el("span", { class: "num" }, "LECTURE " + l.n),
      el("div", { class: "name" }, l.title),
      el("span", { class: "tag" }, l.tag)
    ));
  });
  root.appendChild(gridWrap);

  const best = STORE.get("mockBest", null);
  if (best) {
    root.appendChild(el("div", { class: "section-label" }, "Best mock score"));
    root.appendChild(el("section", { class: "card" },
      el("div", { class: "stat-grid" },
        el("div", { class: "stat" },
          el("div", { class: "val", style: { color: "var(--accent)" } }, best.score + " / 100"),
          el("div", { class: "lbl" }, "Score")
        ),
        el("div", { class: "stat" },
          el("div", { class: "val" }, best.timeStr),
          el("div", { class: "lbl" }, "Time · " + best.date)
        )
      )
    ));
  }

  root.appendChild(el("div", { class: "spacer" }));
};

function quickTile(iconHTML, ttl, sub, route, colour) {
  return el("button", { class: "quick-tile", onclick: () => go(route) },
    el("div", { class: "icon-wrap " + (colour || ""), html: iconHTML }),
    el("div", { class: "ttl" }, ttl),
    el("div", { class: "sub" }, sub));
}

/* ============================================================
 *  LECTURES
 * ============================================================ */
SCREENS.lectures = function(root) {
  const grid = el("div", { class: "lect-grid" });
  LECTURES.forEach(l => {
    grid.appendChild(el("button", { class: "lect-tile" + (l.examQ ? " exam" : ""), onclick: () => go("lecture", l.n) },
      el("span", { class: "num" }, "LECTURE " + l.n),
      el("div", { class: "name" }, l.title),
      el("span", { class: "tag" }, l.tag)));
  });
  root.appendChild(grid);
};

SCREENS.lecture = function(root, n) {
  const l = LECTURES.find(x => x.n === Number(n));
  if (!l) { root.appendChild(el("p", {}, "Lecture not found.")); return; }
  document.getElementById("screen-title").textContent = "L" + l.n + " · " + l.title;
  document.getElementById("screen-subtitle").textContent = l.tag;
  root.appendChild(el("section", { class: "card" },
    el("h2", {}, "Lecture " + l.n + " — " + l.title),
    l.examQ ? el("span", { class: "tag-pill amber" }, "Mock exam Q" + l.examQ) : null,
    el("p", { style: { marginTop: "8px" } }, l.exam || "")
  ));
  root.appendChild(el("section", { class: "card detail-section" }, el("h3", {}, "Outline"), el("ul", {}, ...l.outline.map(x => el("li", {}, x)))));
  root.appendChild(el("section", { class: "card detail-section" }, el("h3", {}, "Key points"), el("ul", {}, ...l.keypoints.map(x => el("li", {}, x)))));
  if (l.code) root.appendChild(el("section", { class: "card detail-section" }, el("h3", {}, "Code"), el("pre", { class: "code-block" }, l.code)));
  const practice = el("div", { class: "btn-row", style: { marginTop: "12px" } });
  if (l.examQ === 4 || l.n === 6) practice.appendChild(el("button", { class: "btn", onclick: () => go("bst") }, "🌳 Practise BST"));
  if (l.examQ === 5 || l.n === 5) practice.appendChild(el("button", { class: "btn", onclick: () => go("graph") }, "🕸️ Practise BFS / DFS"));
  if ([2,3].includes(l.n)) practice.appendChild(el("button", { class: "btn", onclick: () => go("sort") }, "🔢 Sort visualiser"));
  practice.appendChild(el("button", { class: "btn btn-secondary", onclick: () => go("flashcards") }, "📝 Flashcards"));
  root.appendChild(practice);
};

/* ============================================================
 *  FLASHCARDS  (Q1) — with swipe
 * ============================================================ */
SCREENS.flashcards = function(root) {
  if (!STATE.flashSet) STATE.flashSet = shuffle(FLASHCARDS);
  let i = STATE.flashIndex;
  if (i >= STATE.flashSet.length) { STATE.flashSet = shuffle(FLASHCARDS); STATE.flashIndex = i = 0; }
  const card = STATE.flashSet[i];

  const filterRow = el("div", { class: "chip-row" });
  const topics = ["all", ...new Set(FLASHCARDS.map(c => c.topic))];
  const curFilter = STATE.flashFilter || "all";
  topics.forEach(tp => {
    filterRow.appendChild(el("button", {
      class: "chip" + (curFilter === tp ? " active" : ""),
      onclick: () => {
        STATE.flashFilter = tp;
        STATE.flashSet = shuffle(tp === "all" ? FLASHCARDS : FLASHCARDS.filter(c => c.topic === tp));
        STATE.flashIndex = 0;
        render();
      }
    }, tp === "all" ? "All topics" : tp));
  });
  root.appendChild(filterRow);

  const flash = el("div", { class: "flashcard" },
    el("div", { class: "flashcard-inner" },
      el("div", { class: "flash-face flash-front" },
        el("div", { class: "label" }, card.tag),
        el("div", { class: "q" }, card.q),
        el("div", { class: "label", style: { marginTop: "auto", fontStyle: "italic" } }, "Tap to reveal →")
      ),
      el("div", { class: "flash-face flash-back" },
        el("div", { class: "label" }, "ANSWER"),
        el("div", { class: "a" }, card.a)
      )
    )
  );

  let startX = 0, startY = 0, dragX = 0, dragging = false;
  flash.addEventListener("click", e => { if (!dragging) flash.classList.toggle("flipped"); });
  flash.addEventListener("touchstart", e => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; dragging = false; }, { passive: true });
  flash.addEventListener("touchmove", e => {
    dragX = e.touches[0].clientX - startX;
    const dy = Math.abs(e.touches[0].clientY - startY);
    if (Math.abs(dragX) > 8 && dy < 40) {
      dragging = true;
      flash.querySelector(".flashcard-inner").style.transform =
        `translateX(${dragX}px) rotateZ(${dragX * 0.05}deg)${flash.classList.contains("flipped") ? " rotateY(180deg)" : ""}`;
    }
  }, { passive: true });
  flash.addEventListener("touchend", () => {
    if (!dragging) return;
    if (dragX < -90) {
      flash.classList.add("swipe-left");
      setTimeout(() => { STATE.flashIndex = i + 1; toast("Skipped"); render(); }, 280);
    } else if (dragX > 90) {
      flash.classList.add("swipe-right");
      setTimeout(() => { STATE.flashIndex = i + 1; toast("Got it ✓", "good"); render(); }, 280);
    } else {
      flash.querySelector(".flashcard-inner").style.transform = "";
    }
    dragX = 0;
  });

  root.appendChild(flash);
  root.appendChild(el("p", { class: "flash-hint" }, "Tap to flip · swipe → if you knew it · swipe ← to revisit"));
  root.appendChild(el("div", { class: "flashcard-meta" },
    el("span", {}, `Card ${i + 1} / ${STATE.flashSet.length}`),
    el("span", { class: "progress-pill" }, card.tag)
  ));

  root.appendChild(el("div", { class: "btn-row", style: { marginTop: "12px", justifyContent: "space-between" } },
    el("button", { class: "btn btn-secondary", onclick: () => { STATE.flashIndex = Math.max(0, i - 1); render(); } }, "← Prev"),
    el("button", { class: "btn btn-ghost", onclick: () => { STATE.flashSet = shuffle(STATE.flashSet); STATE.flashIndex = 0; toast("Shuffled"); render(); } }, "🔀 Shuffle"),
    el("button", { class: "btn", onclick: () => { STATE.flashIndex = i + 1; render(); } }, "Next →")
  ));

  root.appendChild(el("p", { class: "muted", style: { textAlign: "center", marginTop: "12px" } },
    "Q1 of the exam is 4 × 5-mark concept questions like these."));
};

/* ============================================================
 *  BIG-O QUIZ  (Q2)
 * ============================================================ */
SCREENS.bigO = function(root) {
  if (!STATE.bigOOrder) { STATE.bigOOrder = shuffle(BIGO_QUIZ.map((_, i) => i)); STATE.bigOIndex = 0; STATE.bigOScore = 0; STATE.bigOAnswered = false; }
  if (STATE.bigOIndex >= STATE.bigOOrder.length) return renderBigOResult(root);
  const q = BIGO_QUIZ[STATE.bigOOrder[STATE.bigOIndex]];

  root.appendChild(el("div", { class: "quiz-meta" },
    el("span", {}, `Question ${STATE.bigOIndex + 1} / ${STATE.bigOOrder.length}`),
    el("span", { class: "tag-pill green" }, `Score: ${STATE.bigOScore}`)
  ));
  root.appendChild(el("h2", { style: { fontSize: "16px", margin: "6px 0 8px" } }, "What is the time complexity?"));
  root.appendChild(el("pre", { class: "quiz-stem" }, q.code));

  const opts = el("div", { class: "quiz-options" });
  q.options.forEach((opt, idx) => {
    const btn = el("button", { class: "quiz-opt", onclick: () => {
      if (STATE.bigOAnswered) return;
      STATE.bigOAnswered = true;
      Array.from(opts.children).forEach(c => c.classList.add("disabled"));
      if (idx === q.answer) { btn.classList.add("correct"); STATE.bigOScore++; toast("✓ Correct", "good"); }
      else { btn.classList.add("wrong"); opts.children[q.answer].classList.add("correct"); toast("✗ Not quite", "bad"); }
      root.appendChild(el("div", { class: "card", style: { marginTop: "12px" } },
        el("h3", {}, idx === q.answer ? "Right!" : "Explanation"), el("p", {}, q.why)));
      root.appendChild(el("button", {
        class: "btn", style: { marginTop: "10px", width: "100%" },
        onclick: () => { STATE.bigOIndex++; STATE.bigOAnswered = false; render(); }
      }, STATE.bigOIndex + 1 >= STATE.bigOOrder.length ? "See results" : "Next question →"));
    } }, opt);
    opts.appendChild(btn);
  });
  root.appendChild(opts);
};

function renderBigOResult(root) {
  const total = STATE.bigOOrder.length, score = STATE.bigOScore, pct = Math.round((score / total) * 100);
  if (pct >= 80) confetti();
  root.appendChild(el("section", { class: "hero" },
    el("h2", {}, "🎉 Quiz complete"),
    el("p", {}, `You scored ${score} / ${total} (${pct}%)`)
  ));
  const msg = pct >= 80 ? "Excellent — you'd nail Q2." : pct >= 50 ? "Solid — review the explanations and try again." : "Keep going — re-read Lectures 2 & 3 on complexity.";
  root.appendChild(el("p", { class: "muted", style: { textAlign: "center" } }, msg));
  root.appendChild(el("button", { class: "btn", style: { width: "100%", marginTop: "12px" }, onclick: () => { STATE.bigOOrder = null; render(); } }, "Restart quiz"));
}

/* ============================================================
 *  SORT VISUALISER (Q3)
 * ============================================================ */
SCREENS.sort = function(root) {
  if (!STATE.sort) { STATE.sort = { algo: "insertion", values: SORT_PRESETS[0].values.slice(), input: SORT_PRESETS[0].values.join(", "), steps: null, stepIdx: 0 }; buildSortSteps(); }
  const s = STATE.sort;
  const algos = [{id:"insertion",label:"Insertion"},{id:"bubble",label:"Bubble"},{id:"selection",label:"Selection"},{id:"merge",label:"Merge"}];
  const chips = el("div", { class: "chip-row" });
  algos.forEach(a => chips.appendChild(el("button", { class: "chip" + (s.algo === a.id ? " active" : ""), onclick: () => { s.algo = a.id; buildSortSteps(); render(); } }, a.label)));
  root.appendChild(chips);
  const presetRow = el("div", { class: "chip-row" });
  SORT_PRESETS.forEach(p => presetRow.appendChild(el("button", { class: "chip", onclick: () => { s.values = p.values.slice(); s.input = p.values.join(", "); buildSortSteps(); render(); } }, p.name)));
  root.appendChild(presetRow);
  root.appendChild(el("section", { class: "card" },
    el("label", { class: "field" }, "Array (comma separated):"),
    el("input", { type: "text", value: s.input, inputmode: "numeric", oninput: e => { s.input = e.target.value; } }),
    el("div", { class: "btn-row", style: { marginTop: "10px" } },
      el("button", { class: "btn", onclick: () => {
        const parsed = s.input.split(/[,\s]+/).map(x => Number(x.trim())).filter(x => !isNaN(x));
        if (!parsed.length) { toast("Enter at least one number", "bad"); return; }
        s.values = parsed.slice(0, 12); s.input = s.values.join(", "); buildSortSteps(); render();
      } }, "Apply"),
      el("button", { class: "btn btn-secondary", onclick: () => {
        s.values = Array.from({length: 6}, () => Math.floor(Math.random() * 90) + 5);
        s.input = s.values.join(", "); buildSortSteps(); render();
      } }, "🎲 Random")
    )
  ));
  const step = s.steps[s.stepIdx];
  const vizRow = el("div", { class: "array-row" });
  step.array.forEach((v, i) => {
    let cls = "arr-cell";
    if (step.sortedIdx && step.sortedIdx.includes(i)) cls += " sorted";
    if (step.compareIdx && step.compareIdx.includes(i)) cls += " compare";
    if (step.activeIdx && step.activeIdx.includes(i)) cls += " active";
    vizRow.appendChild(el("div", { class: cls }, String(v)));
  });
  root.appendChild(el("div", { class: "viz" }, vizRow));
  root.appendChild(el("div", { class: "card" }, el("h3", {}, `Step ${s.stepIdx} / ${s.steps.length - 1}`), el("p", {}, step.desc)));
  root.appendChild(el("div", { class: "btn-row" },
    el("button", { class: "btn btn-secondary", onclick: () => { s.stepIdx = Math.max(0, s.stepIdx - 1); render(); } }, "← Step back"),
    el("button", { class: "btn", onclick: () => { if (s.stepIdx < s.steps.length - 1) { s.stepIdx++; render(); } else toast("Sorted!", "good"); } }, "Step →"),
    el("button", { class: "btn btn-ghost", onclick: () => { s.stepIdx = 0; render(); } }, "⟲ Reset"),
    el("button", { class: "btn btn-ghost", onclick: () => animateSort() }, "▶ Play")
  ));
  const cx = COMPLEXITY[s.algo];
  root.appendChild(el("section", { class: "card", style: { marginTop: "12px" } }, el("h3", {}, "Complexity of " + cx.name), el("p", { html: cx.html })));
};

function buildSortSteps() { const s = STATE.sort; s.steps = SORTERS[s.algo](s.values.slice()); s.stepIdx = 0; }
function animateSort() {
  const s = STATE.sort;
  if (s.timer) { clearInterval(s.timer); s.timer = null; return; }
  s.timer = setInterval(() => { if (s.stepIdx >= s.steps.length - 1) { clearInterval(s.timer); s.timer = null; return; } s.stepIdx++; render(); }, 600);
}

const SORTERS = {
  insertion(A) {
    const steps = [{ array: A.slice(), desc: "Initial array. Insertion sort: maintain sorted prefix, insert each new element in place.", sortedIdx: [0] }];
    for (let i = 1; i < A.length; i++) {
      const key = A[i];
      steps.push({ array: A.slice(), desc: `Take key = A[${i}] = ${key}. Compare backwards through the sorted prefix.`, activeIdx: [i], sortedIdx: Array.from({length: i}, (_, k) => k) });
      let j = i - 1;
      while (j >= 0 && A[j] > key) {
        A[j+1] = A[j];
        steps.push({ array: A.slice(), desc: `A[${j}] = ${A[j]} > ${key}, shift it right.`, compareIdx: [j, j+1], sortedIdx: Array.from({length: i+1}, (_, k) => k).filter(k => k !== j+1) });
        j--;
      }
      A[j+1] = key;
      steps.push({ array: A.slice(), desc: `Place key ${key} at position ${j+1}. Pass ${i} done.`, sortedIdx: Array.from({length: i+1}, (_, k) => k) });
    }
    steps.push({ array: A.slice(), desc: "✓ Array fully sorted.", sortedIdx: A.map((_, i) => i) });
    return steps;
  },
  bubble(A) {
    const steps = [{ array: A.slice(), desc: "Initial. Bubble sort: repeatedly compare adjacent pairs and swap if out of order." }];
    const n = A.length;
    for (let pass = 0; pass < n - 1; pass++) {
      let swapped = false;
      for (let j = 0; j < n - 1 - pass; j++) {
        steps.push({ array: A.slice(), desc: `Pass ${pass+1}: compare A[${j}]=${A[j]} and A[${j+1}]=${A[j+1]}.`, compareIdx: [j, j+1], sortedIdx: Array.from({length: pass}, (_, k) => n - 1 - k) });
        if (A[j] > A[j+1]) { [A[j], A[j+1]] = [A[j+1], A[j]]; swapped = true; steps.push({ array: A.slice(), desc: `Swap — now A[${j}]=${A[j]}, A[${j+1}]=${A[j+1]}.`, activeIdx: [j, j+1], sortedIdx: Array.from({length: pass}, (_, k) => n - 1 - k) }); }
      }
      steps.push({ array: A.slice(), desc: `End of pass ${pass+1}. Largest bubbled to position ${n-1-pass}.`, sortedIdx: Array.from({length: pass+1}, (_, k) => n - 1 - k) });
      if (!swapped) break;
    }
    steps.push({ array: A.slice(), desc: "✓ Array fully sorted.", sortedIdx: A.map((_, i) => i) });
    return steps;
  },
  selection(A) {
    const steps = [{ array: A.slice(), desc: "Initial. Selection sort: find min of unsorted suffix and swap into place." }];
    const n = A.length;
    for (let i = 0; i < n - 1; i++) {
      let min = i;
      steps.push({ array: A.slice(), desc: `Pass ${i+1}: assume A[${i}]=${A[i]} is the minimum.`, activeIdx: [i], sortedIdx: Array.from({length: i}, (_, k) => k) });
      for (let j = i + 1; j < n; j++) {
        steps.push({ array: A.slice(), desc: `Compare A[${j}]=${A[j]} with min A[${min}]=${A[min]}.`, compareIdx: [min, j], sortedIdx: Array.from({length: i}, (_, k) => k) });
        if (A[j] < A[min]) min = j;
      }
      if (min !== i) { [A[i], A[min]] = [A[min], A[i]]; steps.push({ array: A.slice(), desc: `Smallest = ${A[i]}. Swap with A[${i}].`, activeIdx: [i, min], sortedIdx: Array.from({length: i+1}, (_, k) => k) }); }
      else steps.push({ array: A.slice(), desc: `A[${i}] was already smallest.`, activeIdx: [i], sortedIdx: Array.from({length: i+1}, (_, k) => k) });
    }
    steps.push({ array: A.slice(), desc: "✓ Array fully sorted.", sortedIdx: A.map((_, i) => i) });
    return steps;
  },
  merge(A) {
    const steps = [{ array: A.slice(), desc: "Initial. Merge sort: divide in half recursively, merge sorted halves." }];
    function ms(arr, lo, hi) {
      if (hi - lo <= 1) return;
      const mid = Math.floor((lo + hi) / 2);
      steps.push({ array: A.slice(), desc: `Split A[${lo}..${hi-1}] at mid = ${mid}.`, activeIdx: Array.from({length: hi-lo}, (_, k) => k + lo) });
      ms(arr, lo, mid); ms(arr, mid, hi);
      const L = arr.slice(lo, mid), R = arr.slice(mid, hi);
      let i = 0, j = 0, k = lo;
      while (i < L.length && j < R.length) { if (L[i] <= R[j]) arr[k++] = L[i++]; else arr[k++] = R[j++]; }
      while (i < L.length) arr[k++] = L[i++];
      while (j < R.length) arr[k++] = R[j++];
      steps.push({ array: arr.slice(), desc: `Merged A[${lo}..${hi-1}] into sorted order.`, sortedIdx: Array.from({length: hi-lo}, (_, k) => k + lo) });
    }
    ms(A, 0, A.length);
    steps.push({ array: A.slice(), desc: "✓ Array fully sorted.", sortedIdx: A.map((_, i) => i) });
    return steps;
  }
};

const COMPLEXITY = {
  insertion: { name: "Insertion sort", html: "<strong>Best:</strong> O(n) — sorted, inner while never runs.<br><strong>Avg/Worst:</strong> O(n²) — reverse-sorted shifts every pass.<br><strong>Space:</strong> O(1) in-place. <strong>Stable:</strong> yes." },
  bubble:    { name: "Bubble sort",    html: "<strong>Best:</strong> O(n) — single pass detects sorted.<br><strong>Avg/Worst:</strong> O(n²).<br><strong>Space:</strong> O(1) in-place. <strong>Stable:</strong> yes." },
  selection: { name: "Selection sort", html: "<strong>All cases:</strong> O(n²) — inner loop runs regardless.<br><strong>Space:</strong> O(1) in-place. <strong>Stable:</strong> no." },
  merge:     { name: "Merge sort",     html: "<strong>All cases:</strong> O(n log n) — T(n) = 2T(n/2) + O(n).<br><strong>Space:</strong> O(n) auxiliary. <strong>Stable:</strong> yes." }
};

/* ============================================================
 *  BST BUILDER (Q4)
 * ============================================================ */
SCREENS.bst = function(root) {
  if (!STATE.bst) { STATE.bst = { values: BST_PRESETS[0].values.slice(), input: BST_PRESETS[0].values.join(", "), stepIdx: 0, preset: BST_PRESETS[0].name, presetNote: BST_PRESETS[0].note }; rebuildBST(); }
  const s = STATE.bst;
  const presets = el("div", { class: "chip-row" });
  BST_PRESETS.forEach(p => presets.appendChild(el("button", { class: "chip" + (s.preset === p.name ? " active" : ""), onclick: () => { s.preset = p.name; s.presetNote = p.note; s.values = p.values.slice(); s.input = p.values.join(", "); rebuildBST(); render(); } }, p.name)));
  root.appendChild(presets);
  root.appendChild(el("section", { class: "card" },
    el("label", { class: "field" }, "Insert values in order (comma separated):"),
    el("input", { type: "text", value: s.input, inputmode: "numeric", oninput: e => { s.input = e.target.value; } }),
    el("div", { class: "btn-row", style: { marginTop: "10px" } },
      el("button", { class: "btn", onclick: () => {
        const parsed = s.input.split(/[,\s]+/).map(x => Number(x.trim())).filter(x => !isNaN(x));
        if (!parsed.length) { toast("Enter at least one number", "bad"); return; }
        s.values = parsed.slice(0, 15); s.input = s.values.join(", "); s.preset = "Custom"; s.presetNote = "Your own input."; rebuildBST(); render();
      } }, "Apply"),
      el("button", { class: "btn btn-secondary", onclick: () => {
        const n = 6 + Math.floor(Math.random() * 3); const used = new Set(); const vals = [];
        while (vals.length < n) { const v = Math.floor(Math.random() * 90) + 10; if (!used.has(v)) { used.add(v); vals.push(v); } }
        s.values = vals; s.input = vals.join(", "); s.preset = "Random"; s.presetNote = "Random — try predicting balance!"; rebuildBST(); render();
      } }, "🎲 Random"),
      el("button", { class: "btn btn-ghost", onclick: () => { s.stepIdx = Math.max(0, s.stepIdx - 1); render(); } }, "← Back"),
      el("button", { class: "btn btn-ghost", onclick: () => { s.stepIdx = Math.min(s.values.length, s.stepIdx + 1); render(); } }, "Insert next →")
    )
  ));
  if (s.presetNote) root.appendChild(el("p", { class: "muted", style: { padding: "0 4px" } }, s.presetNote));
  const cur = s.stepIdx === 0 ? "Empty tree — tap 'Insert next' to add " + s.values[0] + "." : s.stepIdx <= s.values.length ? `Inserted ${s.values[s.stepIdx-1]}. ${s.steps[s.stepIdx-1].note}` : "All values inserted.";
  root.appendChild(el("div", { class: "card" }, el("h3", {}, `Step ${s.stepIdx} / ${s.values.length}`), el("p", {}, cur)));
  const tree = s.stepIdx === 0 ? null : s.snapshots[s.stepIdx - 1];
  root.appendChild(el("div", { class: "viz" }, renderBSTSVG(tree, s.stepIdx > 0 ? s.values[s.stepIdx-1] : null)));
  if (tree) {
    const info = bstAnalyse(tree);
    root.appendChild(el("section", { class: "card" }, el("h3", {}, "Balance check"), el("p", { html:
      `<strong>Height:</strong> ${info.height}<br><strong>Nodes:</strong> ${info.size}<br>` +
      `<strong>Min balanced height (⌈log₂(n+1)⌉):</strong> ${info.minH}<br>` +
      `<strong>Largest |L − R| diff at any node:</strong> ${info.maxDiff}<br><br>` +
      (info.maxDiff <= 1 ? `<span class="tag-pill green">BALANCED</span> — every node's subtree heights differ by ≤ 1.` : `<span class="tag-pill red">UNBALANCED</span> — node ${info.worstNode} has subtree heights differing by ${info.maxDiff}.`)
    })));
    const inorder = [], preorder = [], postorder = [];
    (function tr(n) { if (!n) return; preorder.push(n.key); tr(n.left); inorder.push(n.key); tr(n.right); postorder.push(n.key); })(tree);
    root.appendChild(el("section", { class: "card" }, el("h3", {}, "Traversals"), el("p", { html:
      `<strong>Inorder</strong> (L,N,R): ${inorder.join(" , ")}<br><em class="muted">Note: inorder of a BST is sorted — sanity check.</em><br>` +
      `<strong>Preorder</strong> (N,L,R): ${preorder.join(" , ")}<br><strong>Postorder</strong> (L,R,N): ${postorder.join(" , ")}`
    })));
  }
  if (s.stepIdx > 0) {
    const log = el("div", { class: "step-log" });
    s.steps.slice(0, s.stepIdx).forEach((st, i) => log.appendChild(el("div", { class: "row" + (i === s.stepIdx - 1 ? " current" : "") }, `${i+1}. ` + st.note)));
    root.appendChild(log);
  }
};

function rebuildBST() {
  const s = STATE.bst; s.steps = []; s.snapshots = []; let root = null;
  s.values.forEach(v => {
    const trace = []; root = bstInsert(root, v, trace);
    const path = trace.length === 0 ? "as the root" : "as " + trace.join(" → ");
    s.steps.push({ value: v, note: `Placed ${v} ${path}.` });
    s.snapshots.push(cloneTree(root));
  });
  s.stepIdx = 0;
}
function bstInsert(node, key, trace) {
  if (!node) return { key, left: null, right: null };
  if (key < node.key) { trace.push(`left of ${node.key} (since ${key} < ${node.key})`); node.left = bstInsert(node.left, key, trace); }
  else if (key > node.key) { trace.push(`right of ${node.key} (since ${key} > ${node.key})`); node.right = bstInsert(node.right, key, trace); }
  else trace.push(`(duplicate — ignored)`);
  return node;
}
function cloneTree(n) { if (!n) return null; return { key: n.key, left: cloneTree(n.left), right: cloneTree(n.right) }; }
function bstAnalyse(root) {
  let size = 0, maxDiff = 0, worstNode = null;
  function rec(n) {
    if (!n) return 0;
    size++;
    const l = rec(n.left), r = rec(n.right);
    const diff = Math.abs(l - r);
    if (diff > maxDiff) { maxDiff = diff; worstNode = n.key; }
    return 1 + Math.max(l, r);
  }
  const height = rec(root);
  return { size, height, maxDiff, worstNode, minH: Math.ceil(Math.log2(size + 1)) };
}

function renderBSTSVG(root, lastInserted) {
  if (!root) return el("svg", { viewBox: "0 0 300 80" },
    el("text", { x: "150", y: "45", "text-anchor": "middle", fill: "#94a3b8", "font-size": "14" }, "(empty tree)"));
  function depth(n) { return n ? 1 + Math.max(depth(n.left), depth(n.right)) : 0; }
  const H = depth(root); let x = 0;
  function layout(n, d) { if (!n) return; layout(n.left, d + 1); n._x = x++; n._d = d; layout(n.right, d + 1); }
  layout(root, 0);
  const cols = x, colW = Math.max(50, Math.min(80, Math.floor(360 / Math.max(cols, 1)))), rowH = 64;
  const W = Math.max(300, cols * colW + 30), Ht = H * rowH + 30;
  const nodes = [], edges = [];
  (function collect(n) {
    if (!n) return;
    const cx = 20 + n._x * colW, cy = 20 + n._d * rowH;
    nodes.push({ key: n.key, cx, cy, last: n.key === lastInserted });
    if (n.left)  { collect(n.left);  edges.push({ x1: cx, y1: cy, x2: 20 + n.left._x * colW,  y2: 20 + n.left._d * rowH }); }
    if (n.right) { collect(n.right); edges.push({ x1: cx, y1: cy, x2: 20 + n.right._x * colW, y2: 20 + n.right._d * rowH }); }
  })(root);
  const svg = el("svg", { viewBox: `0 0 ${W} ${Ht}`, xmlns: "http://www.w3.org/2000/svg", style: { maxHeight: "440px" } });
  edges.forEach(e => svg.appendChild(svgEl("line", { x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2, stroke: "#64748b", "stroke-width": 2 })));
  nodes.forEach(n => {
    const g = svgEl("g", {}), r = 20;
    g.appendChild(svgEl("circle", { cx: n.cx, cy: n.cy, r, fill: n.last ? "#10b981" : "#1e293b", stroke: n.last ? "#34d399" : "#94a3b8", "stroke-width": n.last ? 3 : 2 }));
    const txt = svgEl("text", { x: n.cx, y: n.cy + 4, "text-anchor": "middle", fill: n.last ? "#03261b" : "#e2e8f0", "font-size": "13", "font-weight": "800", "font-family": "system-ui" });
    txt.textContent = n.key; g.appendChild(txt); svg.appendChild(g);
  });
  return svg;
}
function svgEl(tag, attrs) {
  const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === "style" && typeof v === "object") Object.assign(n.style, v); else n.setAttribute(k, v); }
  return n;
}

/* ============================================================
 *  GRAPH BFS / DFS (Q5) — animated, with queue/stack visual
 * ============================================================ */
SCREENS.graph = function(root) {
  if (!STATE.graph) {
    const p = GRAPH_PRESETS[0];
    STATE.graph = { preset: p.name, nodes: p.nodes.slice(), edges: p.edges.map(e => e.slice()), start: p.start, directed: p.directed, algo: "bfs", steps: null, stepIdx: 0, note: p.note, layout: p.layout || null };
    buildGraphSteps();
  }
  const g = STATE.graph;
  const algoRow = el("div", { class: "chip-row" });
  ["bfs","dfs"].forEach(a => algoRow.appendChild(el("button", { class: "chip" + (g.algo === a ? " active" : ""), onclick: () => { g.algo = a; buildGraphSteps(); render(); } }, a === "bfs" ? "BFS (Queue)" : "DFS (Stack)")));
  root.appendChild(algoRow);
  const presetRow = el("div", { class: "chip-row" });
  GRAPH_PRESETS.forEach(p => presetRow.appendChild(el("button", { class: "chip" + (g.preset === p.name ? " active" : ""), onclick: () => {
    g.preset = p.name; g.nodes = p.nodes.slice(); g.edges = p.edges.map(e => e.slice());
    g.start = p.start; g.directed = p.directed; g.note = p.note; g.layout = p.layout || null;
    buildGraphSteps(); render();
  } }, p.name)));
  root.appendChild(presetRow);
  root.appendChild(el("section", { class: "card" },
    el("div", { class: "row-between" },
      el("label", { class: "field", style: { margin: 0 } }, "Start vertex: "),
      el("select", { onchange: e => { g.start = e.target.value; buildGraphSteps(); render(); }, style: { width: "100px" } },
        ...g.nodes.map(n => { const o = el("option", { value: n }, n); if (n === g.start) o.selected = true; return o; }))
    ),
    el("div", { class: "row-between", style: { marginTop: "8px" } },
      el("label", { class: "field", style: { margin: 0 } }, "Directed: "),
      el("button", { class: "btn " + (g.directed ? "" : "btn-secondary"), onclick: () => { g.directed = !g.directed; buildGraphSteps(); render(); } }, g.directed ? "Directed →" : "Undirected ↔")
    )
  ));
  if (g.note) root.appendChild(el("p", { class: "muted", style: { padding: "0 4px" } }, g.note));
  root.appendChild(el("div", { class: "viz" }, renderGraphSVG()));
  root.appendChild(el("div", { class: "graph-legend" },
    el("span", {}, el("span", { class: "swatch", style: { background: "#10b981" } }), "current"),
    el("span", {}, el("span", { class: "swatch", style: { background: "#38bdf8" } }), "visited"),
    el("span", {}, el("span", { class: "swatch", style: { background: "#f59e0b" } }), g.algo === "bfs" ? "in queue" : "on stack"),
    el("span", {}, el("span", { class: "swatch", style: { background: "#1e293b", border: "1px solid #475569" } }), "unvisited")
  ));

  /* queue / stack visual */
  const step = g.steps[g.stepIdx];
  const frontierBox = el("div", { class: "frontier" },
    el("div", { class: "frontier-label" }, g.algo === "bfs" ? "QUEUE (front → back)" : "STACK (top →)"),
    (() => {
      const items = el("div", { class: "frontier-items" });
      const data = g.algo === "dfs" ? step.frontier.slice().reverse() : step.frontier;
      if (data.length === 0) items.appendChild(el("span", { class: "frontier-empty" }, "empty"));
      else data.forEach(n => items.appendChild(el("div", { class: "frontier-cell" }, n)));
      return items;
    })()
  );
  root.appendChild(frontierBox);

  /* visit-order chips */
  const visited = g.steps.slice(0, g.stepIdx + 1).map(st => st.justVisited).filter(Boolean);
  if (visited.length) {
    const vo = el("div", { class: "visit-order" });
    visited.forEach((n, i) => vo.appendChild(el("span", { class: "visit-chip" }, el("span", { class: "idx" }, String(i + 1)), n)));
    root.appendChild(vo);
  }

  root.appendChild(el("div", { class: "card" }, el("h3", {}, `Step ${g.stepIdx} / ${g.steps.length - 1}`), el("p", { html: step.html })));
  if (g.stepIdx === g.steps.length - 1 && visited.length === g.nodes.filter(n => g.steps.some(s => s.visited && s.visited.has(n))).length) {
    root.appendChild(el("p", { class: "tag-pill green" }, "✓ Traversal complete"));
  }

  root.appendChild(el("div", { class: "btn-row" },
    el("button", { class: "btn btn-secondary", onclick: () => { g.stepIdx = Math.max(0, g.stepIdx - 1); render(); } }, "← Step back"),
    el("button", { class: "btn", onclick: () => { if (g.stepIdx < g.steps.length - 1) { g.stepIdx++; render(); } else toast("Traversal complete!", "good"); } }, "Step →"),
    el("button", { class: "btn btn-ghost", onclick: () => { g.stepIdx = 0; render(); } }, "⟲ Reset"),
    el("button", { class: "btn btn-ghost", onclick: () => animateGraph() }, "▶ Play")
  ));
  const log = el("div", { class: "step-log" });
  g.steps.forEach((st, i) => log.appendChild(el("div", { class: "row" + (i === g.stepIdx ? " current" : "") }, `${i}. ` + st.text)));
  root.appendChild(log);
  root.appendChild(el("p", { class: "muted", style: { textAlign: "center", marginTop: "12px" } },
    "Tie-break rule: when multiple unvisited neighbours, pick earliest in the alphabet."));
};

function animateGraph() {
  const g = STATE.graph;
  if (g.timer) { clearInterval(g.timer); g.timer = null; return; }
  g.timer = setInterval(() => { if (g.stepIdx >= g.steps.length - 1) { clearInterval(g.timer); g.timer = null; return; } g.stepIdx++; render(); }, 750);
}

function adjacency(graph) {
  const g = graph || STATE.graph, adj = {};
  g.nodes.forEach(n => adj[n] = new Set());
  g.edges.forEach(([u, v]) => { adj[u].add(v); if (!g.directed) adj[v].add(u); });
  const sorted = {};
  g.nodes.forEach(n => sorted[n] = [...adj[n]].sort());
  return sorted;
}

function buildGraphSteps() {
  const g = STATE.graph, adj = adjacency(), steps = [];
  if (!g.nodes.includes(g.start)) g.start = g.nodes[0];
  if (g.algo === "bfs") {
    const visited = new Set([g.start]), queue = [g.start];
    steps.push({ visited: new Set(visited), frontier: queue.slice(), current: null, text: `Init: enqueue ${g.start}. Queue=[${g.start}].`, html: `Initialise. Queue = <code>[${g.start}]</code>.` });
    while (queue.length) {
      const v = queue.shift();
      const newOnes = adj[v].filter(u => !visited.has(u));
      newOnes.forEach(u => { visited.add(u); queue.push(u); });
      steps.push({ visited: new Set(visited), frontier: queue.slice(), current: v, justVisited: v, currentEdges: newOnes.map(u => [v, u]),
        text: `Dequeue ${v}. ${newOnes.length ? "Enqueue " + newOnes.join(",") + "." : "No new neighbours."} Queue=[${queue.join(",") || "—"}].`,
        html: `Dequeue <strong>${v}</strong>. ${newOnes.length ? "Visit & enqueue " + newOnes.map(x => `<strong>${x}</strong>`).join(", ") + " (alpha)." : "No unvisited neighbours."} Queue = <code>[${queue.join(", ") || "—"}]</code>.` });
    }
    steps.push({ visited: new Set(visited), frontier: [], current: null, text: `✓ BFS complete.`, html: `✓ Queue empty — BFS done. Order: <strong>${steps.filter(s => s.justVisited).map(s => s.justVisited).join(" → ")}</strong>.` });
  } else {
    const visited = new Set(), stack = [g.start];
    steps.push({ visited: new Set(visited), frontier: stack.slice(), current: null, text: `Init: push ${g.start}. Stack=[${g.start}].`, html: `Initialise. Stack = <code>[${g.start}]</code>.` });
    while (stack.length) {
      const v = stack.pop();
      if (visited.has(v)) { steps.push({ visited: new Set(visited), frontier: stack.slice(), current: null, text: `Pop ${v} — already visited, skip.`, html: `Pop <strong>${v}</strong> — already visited, skip.` }); continue; }
      visited.add(v);
      const newOnes = adj[v].filter(u => !visited.has(u));
      const reversed = newOnes.slice().reverse();
      reversed.forEach(u => stack.push(u));
      steps.push({ visited: new Set(visited), frontier: stack.slice(), current: v, justVisited: v, currentEdges: newOnes.map(u => [v, u]),
        text: `Pop & visit ${v}. Push (rev-alpha): ${reversed.join(",") || "none"}. Stack=[${stack.join(",") || "—"}].`,
        html: `Pop & visit <strong>${v}</strong>. ${newOnes.length ? "Push " + newOnes.map(x => `<strong>${x}</strong>`).join(", ") + " — earliest letter popped first." : "No unvisited neighbours."} Stack = <code>[${stack.join(", ") || "—"}]</code>.` });
    }
    steps.push({ visited: new Set(visited), frontier: [], current: null, text: `✓ DFS complete.`, html: `✓ Stack empty — DFS done. Order: <strong>${steps.filter(s => s.justVisited).map(s => s.justVisited).join(" → ")}</strong>.` });
  }
  g.steps = steps; g.stepIdx = 0;
}

function renderGraphSVG() {
  const g = STATE.graph, W = 340, H = 320, cx = W/2, cy = H/2;
  const pos = {};
  if (g.layout) {
    Object.entries(g.layout).forEach(([k, v]) => pos[k] = { x: v[0], y: v[1] });
  } else {
    const R = Math.min(W, H) / 2 - 32, n = g.nodes.length;
    g.nodes.forEach((node, i) => { const a = -Math.PI/2 + (2*Math.PI*i)/n; pos[node] = { x: cx + R*Math.cos(a), y: cy + R*Math.sin(a) }; });
  }
  const step = g.steps[g.stepIdx];
  const visitOrderMap = {};
  g.steps.slice(0, g.stepIdx + 1).forEach((s, i) => { if (s.justVisited) visitOrderMap[s.justVisited] = Object.keys(visitOrderMap).length + 1; });
  const currentEdges = step.currentEdges || [];

  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, style: { maxHeight: "360px" } });
  const defs = svgEl("defs", {});
  ["arr", "arr-active"].forEach(id => {
    const m = svgEl("marker", { id, viewBox: "0 0 10 10", refX: "10", refY: "5", markerWidth: "8", markerHeight: "8", orient: "auto" });
    m.appendChild(svgEl("path", { d: "M0,0 L10,5 L0,10 z", fill: id === "arr" ? "#64748b" : "#10b981" }));
    defs.appendChild(m);
  });
  svg.appendChild(defs);

  g.edges.forEach(([u, v]) => {
    const a = pos[u], b = pos[v]; if (!a || !b) return;
    const dx = b.x-a.x, dy = b.y-a.y, len = Math.hypot(dx, dy), r = 20;
    const isCurrent = currentEdges.some(([cu, cv]) => cu === u && cv === v);
    svg.appendChild(svgEl("line", {
      x1: a.x+(dx/len)*r, y1: a.y+(dy/len)*r, x2: b.x-(dx/len)*r, y2: b.y-(dy/len)*r,
      stroke: isCurrent ? "#10b981" : "#64748b",
      "stroke-width": isCurrent ? 3 : 2,
      "marker-end": g.directed ? `url(#${isCurrent ? "arr-active" : "arr"})` : "",
      style: isCurrent ? { filter: "drop-shadow(0 0 4px rgba(16,185,129,.6))" } : {}
    }));
  });
  g.nodes.forEach(node => {
    const p = pos[node]; let fill = "#1e293b", stroke = "#94a3b8", textColor = "#e2e8f0", width = 2;
    if (step.current === node) { fill = "#10b981"; stroke = "#34d399"; textColor = "#03261b"; width = 3; }
    else if (step.visited && step.visited.has(node)) { fill = "#38bdf8"; stroke = "#0ea5e9"; textColor = "#022e44"; }
    else if (step.frontier && step.frontier.includes(node)) { fill = "#f59e0b"; stroke = "#fbbf24"; textColor = "#3a1d00"; }
    svg.appendChild(svgEl("circle", { cx: p.x, cy: p.y, r: 20, fill, stroke, "stroke-width": width, style: step.current === node ? { filter: "drop-shadow(0 0 8px rgba(16,185,129,.6))" } : {} }));
    const t = svgEl("text", { x: p.x, y: p.y + 5, "text-anchor": "middle", fill: textColor, "font-size": "15", "font-weight": "800", "font-family": "system-ui" });
    t.textContent = node; svg.appendChild(t);
    if (visitOrderMap[node]) {
      const badge = svgEl("g", {});
      badge.appendChild(svgEl("circle", { cx: p.x + 16, cy: p.y - 16, r: 9, fill: "#0a0e1a", stroke: "#10b981", "stroke-width": 2 }));
      const bt = svgEl("text", { x: p.x + 16, y: p.y - 13, "text-anchor": "middle", fill: "#10b981", "font-size": "10", "font-weight": "800", "font-family": "system-ui" });
      bt.textContent = visitOrderMap[node];
      badge.appendChild(bt);
      svg.appendChild(badge);
    }
  });
  return svg;
}

/* ============================================================
 *  MOCK EXAM — 2-hour timed simulation
 * ============================================================ */
let MOCK_TIMER = null;
function stopMockTimer() { if (MOCK_TIMER) { clearInterval(MOCK_TIMER); MOCK_TIMER = null; } }
function startMockTimer() {
  stopMockTimer();
  MOCK_TIMER = setInterval(() => {
    if (!STATE.mock || STATE.mock.finished || STATE.mock.paused) return;
    if (STATE.route !== "mock") { stopMockTimer(); return; }
    const bar = document.querySelector(".mock-bar .time");
    if (!bar) return;
    const elapsed = Date.now() - STATE.mock.startTime - STATE.mock.pausedAcc;
    const remaining = Math.max(0, STATE.mock.duration - elapsed);
    bar.textContent = formatTime(remaining);
    if (remaining === 0) finishMock();
    else if (remaining < 5 * 60 * 1000) document.querySelector(".mock-bar").classList.add("warn");
  }, 250);
}
function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60), s = total % 60;
  return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

function newMockQuestions() {
  const q1Cards = shuffle(FLASHCARDS).slice(0, 4);
  const q2 = BIGO_QUIZ[Math.floor(Math.random() * BIGO_QUIZ.length)];
  const sortChoices = ["insertion", "bubble", "selection", "merge"];
  const q3Algo = sortChoices[Math.floor(Math.random() * sortChoices.length)];
  const q3Arr = shuffle([12, 17, 23, 31, 9, 28, 41, 6]).slice(0, 6);
  const bstCount = 6;
  const q4Vals = []; const used = new Set();
  while (q4Vals.length < bstCount) { const v = Math.floor(Math.random() * 90) + 10; if (!used.has(v)) { used.add(v); q4Vals.push(v); } }
  const q5Graph = GRAPH_PRESETS[0];
  return { q1Cards, q2, q3Algo, q3Arr, q4Vals, q5Graph };
}

SCREENS.mock = function(root) {
  if (!STATE.mock) {
    root.appendChild(el("section", { class: "hero hero-mock" },
      el("h2", {}, "🔥 Mock Exam"),
      el("p", {}, "Full 2-hour simulation · 5 questions · auto-marked where possible"),
      el("span", { class: "countdown" }, EXAM_INFO.format)
    ));
    root.appendChild(el("section", { class: "card" },
      el("h3", {}, "How it works"),
      el("p", { html:
        "<strong>Q1</strong> · 4 concept cards — self-mark know / don't know (5 marks each)<br>" +
        "<strong>Q2</strong> · 1 Big-O multiple choice — auto-marked (20)<br>" +
        "<strong>Q3</strong> · Sort by hand, then check steps — self-mark (20)<br>" +
        "<strong>Q4</strong> · BST from 6 numbers — predict balance, auto-marked (20)<br>" +
        "<strong>Q5</strong> · BFS or DFS traversal — auto-marked letter-by-letter (20)<br><br>" +
        "<strong>Timer:</strong> 2 hours · pause anytime · early submit allowed."
      })
    ));
    root.appendChild(el("button", { class: "btn", style: { width: "100%", padding: "16px", fontSize: "16px" }, onclick: () => {
      const qs = newMockQuestions();
      STATE.mock = {
        startTime: Date.now(), pausedAcc: 0, pausedAt: null, paused: false,
        duration: 120 * 60 * 1000, finished: false, qIndex: 0,
        questions: qs,
        answers: { q1: [null, null, null, null], q2: null, q3: null, q4: null, q5: null },
        algoChoice: Math.random() < 0.5 ? "bfs" : "dfs"
      };
      startMockTimer();
      render();
    } }, "▶ Start mock exam"));
    return;
  }

  if (STATE.mock.finished) return renderMockResult(root);
  startMockTimer();

  /* timer bar */
  const elapsed = Date.now() - STATE.mock.startTime - STATE.mock.pausedAcc;
  const remaining = Math.max(0, STATE.mock.duration - elapsed);
  const bar = el("div", { class: "mock-bar" + (remaining < 5*60*1000 ? " warn" : "") },
    el("div", { class: "qno" }, "Q" + (STATE.mock.qIndex + 1) + " / 5"),
    el("div", { class: "time" }, formatTime(remaining)),
    el("button", { class: "pause", onclick: () => {
      if (STATE.mock.paused) { STATE.mock.pausedAcc += Date.now() - STATE.mock.pausedAt; STATE.mock.paused = false; STATE.mock.pausedAt = null; }
      else { STATE.mock.pausedAt = Date.now(); STATE.mock.paused = true; }
      render();
    } }, STATE.mock.paused ? "▶" : "❚❚")
  );
  root.appendChild(bar);

  const dots = el("div", { class: "mock-progress" });
  for (let k = 0; k < 5; k++) {
    const done = STATE.mock.answers[`q${k+1}`] != null && (k+1 !== 1 || STATE.mock.answers.q1.every(x => x != null));
    dots.appendChild(el("div", { class: "dot" + (done ? " done" : "") + (k === STATE.mock.qIndex ? " current" : "") }));
  }
  root.appendChild(dots);

  if (STATE.mock.paused) {
    root.appendChild(el("section", { class: "card", style: { textAlign: "center" } },
      el("h2", {}, "⏸ Paused"),
      el("p", {}, "Timer is paused. Tap ▶ to resume.")
    ));
    return;
  }

  /* render current question */
  const renderers = [renderMockQ1, renderMockQ2, renderMockQ3, renderMockQ4, renderMockQ5];
  renderers[STATE.mock.qIndex](root);

  /* nav */
  const nav = el("div", { class: "btn-row", style: { marginTop: "14px" } });
  if (STATE.mock.qIndex > 0) nav.appendChild(el("button", { class: "btn btn-secondary", onclick: () => { STATE.mock.qIndex--; render(); } }, "← Previous"));
  if (STATE.mock.qIndex < 4) nav.appendChild(el("button", { class: "btn", onclick: () => { STATE.mock.qIndex++; render(); } }, "Next →"));
  else nav.appendChild(el("button", { class: "btn btn-danger", style: { flex: 1 }, onclick: () => {
    if (confirm("Submit the mock exam now?")) finishMock();
  } }, "✓ Submit exam"));
  root.appendChild(nav);
};

function renderMockQ1(root) {
  const cards = STATE.mock.questions.q1Cards;
  root.appendChild(el("h2", { style: { fontSize: "17px" } }, "Q1 · Concepts (4 × 5 marks = 20)"));
  root.appendChild(el("p", { class: "muted", style: { marginBottom: "10px" } }, "Recall each answer, then self-mark."));
  cards.forEach((c, i) => {
    const card = el("section", { class: "card" });
    card.appendChild(el("div", { class: "tag-pill blue" }, "Q1." + (i+1) + " · " + c.tag));
    card.appendChild(el("p", { style: { fontWeight: 700, fontSize: "15px", margin: "8px 0 10px", color: "var(--text)" } }, c.q));
    const revealed = STATE.mock.answers.q1[i] !== null;
    if (!revealed && !STATE.mock["q1_reveal_" + i]) {
      card.appendChild(el("button", { class: "btn btn-secondary", onclick: () => { STATE.mock["q1_reveal_" + i] = true; render(); } }, "Reveal answer"));
    } else {
      card.appendChild(el("div", { class: "code-block", style: { whiteSpace: "pre-wrap" } }, c.a));
      card.appendChild(el("div", { class: "confidence", style: { marginTop: "10px" } },
        el("button", { class: "conf-btn" + (STATE.mock.answers.q1[i] === 1 ? " knew" : ""), onclick: () => { STATE.mock.answers.q1[i] = 1; render(); } }, "✓ I knew it"),
        el("button", { class: "conf-btn" + (STATE.mock.answers.q1[i] === 0 ? " didnt" : ""), onclick: () => { STATE.mock.answers.q1[i] = 0; render(); } }, "✗ I didn't")
      ));
    }
    root.appendChild(card);
  });
}

function renderMockQ2(root) {
  const q = STATE.mock.questions.q2;
  root.appendChild(el("h2", { style: { fontSize: "17px" } }, "Q2 · Time complexity (20 marks)"));
  root.appendChild(el("p", { class: "muted", style: { marginBottom: "10px" } }, "Pick the correct Big-O of this snippet."));
  root.appendChild(el("pre", { class: "quiz-stem" }, q.code));
  const opts = el("div", { class: "quiz-options" });
  const chosen = STATE.mock.answers.q2;
  q.options.forEach((opt, idx) => {
    let cls = "quiz-opt";
    if (chosen !== null) { cls += " disabled"; if (idx === chosen) cls += idx === q.answer ? " correct" : " wrong"; else if (idx === q.answer) cls += " correct"; }
    opts.appendChild(el("button", { class: cls, onclick: () => { if (STATE.mock.answers.q2 === null) { STATE.mock.answers.q2 = idx; render(); } } }, opt));
  });
  root.appendChild(opts);
  if (chosen !== null) {
    root.appendChild(el("div", { class: "card", style: { marginTop: "10px" } },
      el("h3", {}, chosen === q.answer ? "✓ Correct — 20/20" : "✗ Incorrect — 0/20"),
      el("p", {}, q.why)));
  }
}

function renderMockQ3(root) {
  const algo = STATE.mock.questions.q3Algo, arr = STATE.mock.questions.q3Arr;
  const names = { insertion: "Insertion sort", bubble: "Bubble sort", selection: "Selection sort", merge: "Merge sort" };
  root.appendChild(el("h2", { style: { fontSize: "17px" } }, "Q3 · Sorting (12 + 8 = 20 marks)"));
  root.appendChild(el("p", { class: "muted", style: { marginBottom: "10px" } }, `Apply ${names[algo]} to the array on paper, then check + self-mark.`));
  root.appendChild(el("div", { class: "card" },
    el("h3", {}, "Array"),
    el("div", { class: "array-row" }, ...arr.map(v => el("div", { class: "arr-cell" }, String(v))))
  ));
  root.appendChild(el("div", { class: "card" }, el("h3", {}, "Algorithm"), el("p", {}, names[algo])));
  if (!STATE.mock["q3_revealed"]) {
    root.appendChild(el("button", { class: "btn", style: { width: "100%" }, onclick: () => { STATE.mock["q3_revealed"] = true; render(); } }, "Reveal correct steps"));
    return;
  }
  const steps = SORTERS[algo](arr.slice()).filter(s => !s.compareIdx);
  const log = el("div", { class: "step-log" });
  steps.forEach((st, i) => log.appendChild(el("div", { class: "row" }, `[${st.array.join(", ")}] · ${st.desc}`)));
  root.appendChild(el("div", { class: "card" }, el("h3", {}, "Step-by-step"), log));
  root.appendChild(el("div", { class: "card" }, el("h3", {}, "Complexity (8 marks)"), el("p", { html: COMPLEXITY[algo].html })));
  root.appendChild(el("div", { class: "confidence" },
    [0, 5, 10, 15, 20].map(v => el("button", {
      class: "conf-btn" + (STATE.mock.answers.q3 === v ? " knew" : ""),
      onclick: () => { STATE.mock.answers.q3 = v; render(); }
    }, v + "/20"))
  ));
  root.appendChild(el("p", { class: "muted", style: { textAlign: "center", marginTop: "8px" } }, "Self-mark honestly · how close was your answer to the worked solution?"));
}

function renderMockQ4(root) {
  const vals = STATE.mock.questions.q4Vals;
  root.appendChild(el("h2", { style: { fontSize: "17px" } }, "Q4 · BST (15 + 5 = 20 marks)"));
  root.appendChild(el("p", { class: "muted", style: { marginBottom: "10px" } }, "Insert these into an empty BST in order, then judge balance."));
  root.appendChild(el("div", { class: "card" },
    el("h3", {}, "Insert in order"),
    el("p", { style: { fontFamily: "ui-monospace, monospace", fontSize: "18px", fontWeight: 700, color: "var(--text)" } }, vals.join(",  "))
  ));
  if (!STATE.mock["q4_revealed"]) {
    root.appendChild(el("div", { class: "card" },
      el("h3", {}, "Your judgement"),
      el("p", { class: "muted" }, "Draw the tree on paper, then choose:"),
      el("div", { class: "btn-row", style: { marginTop: "10px", justifyContent: "center" } },
        el("button", { class: "conf-btn", style: { flex: "0 1 130px" }, onclick: () => { STATE.mock.answers.q4_predict = "balanced"; STATE.mock["q4_revealed"] = true; render(); } }, "Balanced"),
        el("button", { class: "conf-btn", style: { flex: "0 1 130px" }, onclick: () => { STATE.mock.answers.q4_predict = "unbalanced"; STATE.mock["q4_revealed"] = true; render(); } }, "Unbalanced")
      )
    ));
    return;
  }
  let r = null; vals.forEach(v => r = bstInsert(r, v, []));
  const info = bstAnalyse(r);
  const actual = info.maxDiff <= 1 ? "balanced" : "unbalanced";
  const right = STATE.mock.answers.q4_predict === actual;
  STATE.mock.answers.q4 = right ? 20 : 5;
  root.appendChild(el("div", { class: "viz" }, renderBSTSVG(r, vals[vals.length-1])));
  root.appendChild(el("div", { class: "card" }, el("h3", {}, "Verdict"), el("p", { html:
    `Your prediction: <strong>${STATE.mock.answers.q4_predict}</strong><br>` +
    `Actual: <strong>${actual.toUpperCase()}</strong> (max |L−R| diff = ${info.maxDiff}${info.worstNode ? ` at node ${info.worstNode}` : ""})<br><br>` +
    (right ? `<span class="tag-pill green">CORRECT — 20/20</span>` : `<span class="tag-pill red">PARTIAL — 5/20 for drawing</span>`)
  })));
}

function renderMockQ5(root) {
  const gd = STATE.mock.questions.q5Graph;
  const algo = STATE.mock.algoChoice;
  root.appendChild(el("h2", { style: { fontSize: "17px" } }, `Q5 · ${algo.toUpperCase()} (10 + 10 = 20 marks)`));
  root.appendChild(el("p", { class: "muted", style: { marginBottom: "10px" } }, `Perform ${algo === "bfs" ? "BFS" : "DFS"} from vertex ${gd.start}. Alphabetical tie-break.`));

  const tempState = STATE.graph;
  STATE.graph = { preset: gd.name, nodes: gd.nodes.slice(), edges: gd.edges.map(e => e.slice()), start: gd.start, directed: gd.directed, algo, steps: null, stepIdx: 0, layout: gd.layout || null };
  buildGraphSteps();
  const correctOrder = STATE.graph.steps.filter(s => s.justVisited).map(s => s.justVisited);
  root.appendChild(el("div", { class: "viz" }, renderGraphSVG()));
  STATE.graph = tempState;

  if (STATE.mock.answers.q5 === null) {
    const inp = el("input", { type: "text", placeholder: "e.g. A,B,C,D,E,F,G,H,I", autocapitalize: "characters", oninput: e => { STATE.mock.q5_text = e.target.value; } });
    inp.value = STATE.mock.q5_text || "";
    root.appendChild(el("section", { class: "card" },
      el("label", { class: "field" }, "Your visit order (comma or space separated):"),
      inp,
      el("button", { class: "btn", style: { width: "100%", marginTop: "10px" }, onclick: () => {
        const input = (STATE.mock.q5_text || "").toUpperCase().split(/[,\s]+/).filter(Boolean);
        let correct = 0; for (let i = 0; i < Math.min(input.length, correctOrder.length); i++) if (input[i] === correctOrder[i]) correct++;
        const traversalMark = Math.round((correct / correctOrder.length) * 10);
        STATE.mock.answers.q5 = traversalMark;
        STATE.mock.q5_input = input;
        STATE.mock.q5_correct = correctOrder;
        render();
      } }, "Check answer")
    ));
  } else {
    const ok = STATE.mock.q5_input.join(",") === STATE.mock.q5_correct.join(",");
    root.appendChild(el("div", { class: "card" },
      el("h3", {}, ok ? "✓ Perfect" : "Partial"),
      el("p", { html:
        `Your answer:<br><strong>${STATE.mock.q5_input.join(" → ") || "(empty)"}</strong><br><br>` +
        `Correct:<br><strong>${STATE.mock.q5_correct.join(" → ")}</strong><br><br>` +
        `<span class="tag-pill ${ok ? "green" : "amber"}">Traversal: ${STATE.mock.answers.q5} / 10</span> · <span class="muted">Concept marks (10) — self-mark below</span>`
      }),
      el("div", { class: "confidence", style: { marginTop: "10px" } },
        [0, 4, 7, 10].map(v => el("button", { class: "conf-btn" + (STATE.mock.q5_concept === v ? " knew" : ""), onclick: () => { STATE.mock.q5_concept = v; render(); } }, "Concept: " + v + "/10"))
      )
    ));
  }
}

function finishMock() {
  stopMockTimer();
  if (!STATE.mock) return;
  STATE.mock.finished = true;
  STATE.mock.endTime = Date.now();
  /* score */
  const q1 = STATE.mock.answers.q1.reduce((a, b) => a + (b === 1 ? 5 : 0), 0);
  const q2 = (STATE.mock.answers.q2 !== null && STATE.mock.answers.q2 === STATE.mock.questions.q2.answer) ? 20 : 0;
  const q3 = STATE.mock.answers.q3 || 0;
  const q4 = STATE.mock.answers.q4 || 0;
  const q5 = (STATE.mock.answers.q5 || 0) + (STATE.mock.q5_concept || 0);
  const total = q1 + q2 + q3 + q4 + q5;
  STATE.mock.scores = { q1, q2, q3, q4, q5, total };
  const elapsed = STATE.mock.endTime - STATE.mock.startTime - STATE.mock.pausedAcc;
  const timeStr = formatTime(elapsed);
  const prev = STORE.get("mockBest", null);
  if (!prev || total > prev.score) STORE.set("mockBest", { score: total, date: new Date().toLocaleDateString(), timeStr });
  if (total >= 70) confetti();
  render();
}

function renderMockResult(root) {
  const s = STATE.mock.scores; const total = s.total;
  const grade = total >= 70 ? "Distinction" : total >= 60 ? "Merit" : total >= 50 ? "Pass" : "Below pass";
  const colour = total >= 70 ? "var(--good)" : total >= 50 ? "var(--accent)" : "var(--bad)";

  const c = 50, circ = 2 * Math.PI * c, off = circ - (total / 100) * circ;
  root.appendChild(el("section", { class: "hero hero-mock" },
    el("h2", {}, total >= 70 ? "🎉 Excellent!" : total >= 50 ? "✓ Passed" : "Keep practising"),
    el("p", {}, `Final score: ${total} / 100 · ${grade}`)
  ));
  const sc = el("div", { class: "score-circle" });
  sc.innerHTML = `<svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="${c}" stroke="var(--bg-3)" stroke-width="10" fill="none"/>
    <circle cx="60" cy="60" r="${c}" stroke="${colour}" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${off}" style="transition: stroke-dashoffset 1s ease-out"/>
  </svg><div class="pct" style="color:${colour}">${total}</div>`;
  root.appendChild(sc);

  root.appendChild(el("section", { class: "card" },
    el("h3", {}, "Breakdown"),
    ...[
      ["Q1 · Concepts",   s.q1, 20],
      ["Q2 · Big-O",       s.q2, 20],
      ["Q3 · Sorting",     s.q3, 20],
      ["Q4 · BST",         s.q4, 20],
      ["Q5 · Graph",       s.q5, 20]
    ].map(([n, sc, max]) => el("div", { class: "row-between", style: { padding: "8px 0", borderTop: "1px dashed var(--bg-3)" } },
      el("span", {}, n),
      el("strong", { style: { color: sc >= max * 0.7 ? "var(--good)" : sc >= max * 0.4 ? "var(--warn)" : "var(--bad)" } }, `${sc} / ${max}`)
    ))
  ));

  root.appendChild(el("div", { class: "btn-row" },
    el("button", { class: "btn", style: { flex: 1 }, onclick: () => { STATE.mock = null; render(); } }, "🔄 Try again"),
    el("button", { class: "btn btn-secondary", onclick: () => go("home") }, "🏠 Home")
  ));
}

render();
