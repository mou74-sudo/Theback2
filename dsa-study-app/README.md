# DSA Study — COMP5066

A mobile-first, installable web app for revising **Data Structures & Algorithms**
(Dr Cetinkaya, Bournemouth University, 2026). Built specifically around the
five mock-exam question types.

## Open on your phone

Two easy ways:

1. **GitHub Pages** — go to the repo's *Settings → Pages*, set the source to the
   branch `claude/mobile-learning-app-mzqaU` and the folder `/dsa-study-app`.
   Open the published URL on your phone, then *Add to Home Screen* — it
   installs as an offline-friendly PWA.
2. **Local file** — pull this branch, double-tap `dsa-study-app/index.html` on
   your phone (works straight off a USB / iCloud / Drive — no install needed).

## What's inside

| Screen | Maps to | What it does |
|---|---|---|
| 🏠 Home | exam overview | Countdown to 26 May, the 5 questions, lecture index, daily streak. |
| 📝 Cards | **Q1** | Tap-to-flip flashcards across every lecture's key concepts. Filter by topic, shuffle. |
| 🔬 Big-O Quiz | **Q2** | Code snippets with multiple-choice complexity — explanation after each answer. |
| 🔢 Sort visualiser | **Q3** | Step-by-step Insertion / Bubble / Selection / Merge sort on any array, with the complexity discussion. |
| 🌳 BST builder | **Q4** | Insert numbers one by one into an empty BST. Animated tree, balance check, inorder/preorder/postorder. Includes the exact mock set `[21,15,30,20,40,33]`. |
| 🕸️ Graph traversal | **Q5** | BFS / DFS on a directed (or undirected) graph with **alphabetical tie-break** — exactly the mock-exam rule. Includes the mock-exam graph. |

## Built for the exam — not generic DSA

- The five tabs at the bottom mirror Q1 → Q5.
- Mock exam graph and BST set are first-class presets.
- "Insert next" / "Step →" controls so you can predict, then verify.
- Tap any lecture tile for a focused notes view + key points + sample code.

## Tech

Pure HTML / CSS / JS — no build step, no dependencies. Offline-capable via
`manifest.webmanifest`. ~30 KB total.
