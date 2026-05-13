/* data.js — content tailored to COMP5066 (Dr Cetinkaya, 2026)
 * Mapped to lectures 1-12 and the 5 mock-exam question types.
 */

const EXAM_INFO = {
  unit: "COMP5066 · Data Structures & Algorithms",
  date: "Tue 26 May 2026",
  time: "14:00–16:00",
  location: "KG01 + K103, Kimmeridge House, Talbot Campus",
  format: "5 questions · 20 marks each · 100 total · answer ALL",
  questions: [
    { n: 1, desc: "4 × 5-mark sub-Qs — explain/define concepts (e.g. directed vs undirected graph)", topic: "concepts" },
    { n: 2, desc: "Code snippet — discuss time + space complexity, compare alternatives", topic: "complexity" },
    { n: 3, desc: "Array + sorting algorithm — step-by-step + complexity discussion (12 + 8)", topic: "sorting" },
    { n: 4, desc: "Empty BST + insert N numbers — draw the tree, balanced or not (15 + 5)", topic: "bst", note: "SAME format as mock, different numbers" },
    { n: 5, desc: "Directed graph + BFS / DFS from a vertex with alphabetical tie-break (10 + 10)", topic: "graph", note: "SAME format as mock, different graph" }
  ]
};

const LECTURES = [
  {
    n: 1, title: "Algorithms · Linked Lists", tag: "Foundations",
    outline: ["Algorithms intro", "Arrays vs linked lists", "Singly, doubly & circular linked lists", "Linear search", "Binary search"],
    keypoints: [
      "Algorithm = finite sequence of well-defined steps that produces an output for a valid input.",
      "Array: contiguous memory, O(1) indexing, O(n) insert/delete in middle.",
      "Linked list: nodes (data + next pointer); O(n) search, O(1) insert at head.",
      "Doubly linked list: extra 'prev' pointer — bidirectional traversal.",
      "Circular linked list: tail.next points back to head (useful for round-robin).",
      "Linear search O(n) works on unsorted data.",
      "Binary search O(log n) requires the array to be sorted; halve the range each step."
    ],
    code: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def insert_at_head(self, data):     # O(1)
        node = Node(data)
        node.next = self.head
        self.head = node

    def search(self, target):           # O(n)
        cur = self.head
        while cur:
            if cur.data == target: return cur
            cur = cur.next
        return None`,
    exam: "Q1 — definitions; Q2 — complexity of LL operations."
  },
  {
    n: 2, title: "Complexity · Sorting (I)", tag: "Sorting",
    outline: ["Algorithmic complexity", "Big-O and little-o", "Insertion sort", "Bubble sort", "Divide & conquer"],
    keypoints: [
      "Big-O describes asymptotic upper bound (worst case).",
      "Insertion sort: build sorted prefix; shift larger elements right. Best O(n), avg/worst O(n²), in-place, stable.",
      "Bubble sort: repeatedly swap adjacent out-of-order pairs; O(n²) worst.",
      "Divide-and-conquer: divide problem, solve recursively, combine."
    ],
    code: `def insertion_sort(A):
    for i in range(1, len(A)):
        key = A[i]
        j = i - 1
        while j >= 0 and A[j] > key:
            A[j+1] = A[j]
            j -= 1
        A[j+1] = key
    return A`,
    exam: "Q3 — step-by-step insertion/bubble; Q2 — Big-O analysis."
  },
  {
    n: 3, title: "Complexity · Sorting (II)", tag: "Sorting",
    outline: ["Time & space complexity analysis", "Merge sort", "Quick sort", "Common data structures"],
    keypoints: [
      "Merge sort: divide array in halves recursively, merge sorted halves. O(n log n) all cases, O(n) extra space, stable.",
      "Quick sort: choose pivot, partition. Avg O(n log n), worst O(n²) (bad pivot), in-place, not stable.",
      "Space complexity counts auxiliary memory used by the algorithm (not the input itself)."
    ],
    code: `def merge_sort(A):
    if len(A) <= 1: return A
    mid = len(A) // 2
    L = merge_sort(A[:mid])
    R = merge_sort(A[mid:])
    return merge(L, R)`,
    exam: "Q3 — merge / quick sort steps; Q2 — recurrence T(n)=2T(n/2)+O(n)."
  },
  {
    n: 4, title: "Stacks · Queues · Recursion", tag: "ADTs",
    outline: ["Stack: push, pop, peek (LIFO)", "Queue: enqueue, dequeue (FIFO)", "Recursion & base cases"],
    keypoints: [
      "Stack = LIFO. Uses: function call stack, undo, balanced brackets, DFS.",
      "Queue = FIFO. Uses: scheduling, BFS, buffers.",
      "Recursion = function that calls itself; needs a base case to terminate.",
      "Every recursive call adds a stack frame ⇒ deep recursion can overflow."
    ],
    code: `def factorial(n):
    if n <= 1: return 1     # base case
    return n * factorial(n-1)  # recursive case`,
    exam: "Q1/Q2 — stack vs queue; recursive code trace."
  },
  {
    n: 5, title: "Graphs · BFS · DFS", tag: "Graphs", examQ: 5,
    outline: ["Directed / undirected", "Weighted / unweighted", "Adjacency list / matrix", "BFS (queue)", "DFS (stack / recursion)"],
    keypoints: [
      "Directed graph: edges have direction (A→B ≠ B→A). Undirected: edges are pairs {A,B}.",
      "Weighted: edges carry a cost/distance. Unweighted: all edges equal.",
      "BFS uses a QUEUE — explores layer by layer; shortest path in unweighted graphs.",
      "DFS uses a STACK / recursion — goes deep first, backtracks.",
      "With alphabetical tie-breaking, always pick the unvisited neighbour earliest in the alphabet."
    ],
    code: `from collections import deque
def bfs(graph, start):
    visited, order = set([start]), []
    q = deque([start])
    while q:
        v = q.popleft()
        order.append(v)
        for u in sorted(graph[v]):       # alphabetical tie-break
            if u not in visited:
                visited.add(u)
                q.append(u)
    return order`,
    exam: "Q5 — BFS / DFS from a vertex on a directed graph. SAME format, different graph."
  },
  {
    n: 6, title: "Trees · Binary Search Trees", tag: "Trees", examQ: 4,
    outline: ["Tree terminology (root, leaf, height)", "Binary trees", "Traversals (in/pre/post)", "BST: insert, search, balance"],
    keypoints: [
      "Tree = connected acyclic graph with a root. Each node has children; nodes with no children are leaves.",
      "Binary tree: each node has at most 2 children (left, right).",
      "BST property: left subtree < node < right subtree (for every node).",
      "BST insert: compare with root, go left if smaller, right if greater; insert at the empty position.",
      "Balanced tree: height ≈ log n. Unbalanced (skewed): height ≈ n ⇒ O(n) search.",
      "Inorder traversal of a BST yields sorted order."
    ],
    code: `class Node:
    def __init__(self, key):
        self.key = key
        self.left = self.right = None

def insert(root, key):
    if root is None: return Node(key)
    if key < root.key:  root.left  = insert(root.left, key)
    elif key > root.key: root.right = insert(root.right, key)
    return root`,
    exam: "Q4 — insert numbers into empty BST + balanced/unbalanced? SAME format, different numbers."
  },
  {
    n: 7, title: "Optimisation · Greedy", tag: "Algorithms",
    outline: ["Optimisation problems (objective, variables, constraints)", "Approximation algorithms", "Greedy algorithms", "Knapsack", "Scheduling"],
    keypoints: [
      "Optimisation = find best solution (max/min objective) subject to constraints.",
      "Greedy: make the locally optimal choice at each step. Fast but not always globally optimal.",
      "Knapsack: 0/1 (item taken or not) vs fractional (greedy works); 0/1 is NP-hard ⇒ DP solution.",
      "Approximation algorithms trade exactness for speed when exact solution is intractable."
    ],
    exam: "Q1 — general knowledge: 'what is a greedy algorithm', 'discuss knapsack'."
  },
  {
    n: 8, title: "Dynamic Programming · MST", tag: "Algorithms",
    outline: ["Dynamic programming", "Memoisation vs tabulation", "Minimum Spanning Tree (MST)", "Prim's", "Kruskal's"],
    keypoints: [
      "DP = solve subproblems once, store results (avoid recomputation). Optimal substructure + overlapping subproblems.",
      "MST = subset of edges connecting all vertices with minimum total weight, no cycles.",
      "Prim's: grow tree from a start vertex, always add cheapest edge to a new vertex.",
      "Kruskal's: sort edges by weight, add edge if it doesn't form a cycle (Union-Find)."
    ],
    exam: "Q1 — define MST, give Prim's vs Kruskal's outline."
  },
  {
    n: 9, title: "Priority Queues · Heaps", tag: "Trees",
    outline: ["Priority queue ADT", "Binary heap (complete tree)", "Min-heap, Max-heap", "Heapify, sift up/down", "Heap Sort"],
    keypoints: [
      "Priority queue = elements with priorities; dequeue removes highest (or lowest) priority.",
      "Binary heap is a complete binary tree stored in an array. Parent of i = (i-1)//2; children = 2i+1, 2i+2.",
      "Max-heap: parent ≥ children. Min-heap: parent ≤ children.",
      "Insert / remove-top are O(log n). Build-heap O(n). Heap sort O(n log n)."
    ],
    exam: "Q1 — min-heap vs max-heap definition; Q2 — complexity of heap ops."
  },
  {
    n: 10, title: "Hashing · Hash Tables", tag: "Hashing",
    outline: ["Hashing", "Hash table", "Hash functions (good properties)", "Collisions: chaining, open addressing"],
    keypoints: [
      "Hash function maps a key to an index in a fixed-size table.",
      "Good hash: deterministic, fast O(1), uniform distribution, minimises collisions, uses full key.",
      "Collision = two keys map to same index. Handled by chaining (linked list per bucket) or open addressing (probing).",
      "Average ops O(1); worst-case O(n) if everything collides."
    ],
    exam: "Q1 — properties of a good hash function + collision handling."
  },
  {
    n: 11, title: "Advanced · AVL · Huffman · B-trees", tag: "Advanced",
    outline: ["Randomised algorithms", "Huffman coding", "AVL trees (self-balancing BST)", "B-trees"],
    keypoints: [
      "AVL tree: BST where |height(left) − height(right)| ≤ 1 for every node; rotations restore balance.",
      "Huffman coding: greedy algorithm building optimal prefix code from symbol frequencies.",
      "B-tree: generalised balanced search tree, many children per node — used in databases & file systems.",
      "Randomised algorithms use randomness for speed or to avoid worst cases (e.g. randomised quicksort)."
    ],
    exam: "Q1 — general definitions, possibly AVL balance factor."
  },
  {
    n: 12, title: "Quantum · Crypto · Ethics", tag: "Advanced",
    outline: ["Quantum algorithms (overview)", "Cryptographic algorithms (overview)", "Legal & ethical implications"],
    keypoints: [
      "Quantum algorithms exploit superposition / entanglement to solve some problems faster (Shor, Grover).",
      "Cryptographic algorithms ensure confidentiality, integrity, authentication (symmetric vs asymmetric).",
      "Algorithms have ethical/legal impact — bias, privacy, accountability."
    ],
    exam: "Q1 — short factual definitions."
  }
];

/* Flashcards — Q1-style concept questions across all lectures */
const FLASHCARDS = [
  // Graphs (Lecture 5) — explicitly called out in mock as a Q1 example
  { q: "What is the difference between a DIRECTED and an UNDIRECTED graph?",
    a: "Directed graph: edges have direction (an arrow from u to v means u→v only). Undirected: edges are unordered pairs {u,v} — you can travel both ways. Example: Twitter follows = directed; Facebook friends = undirected.",
    tag: "L5 · Graphs", topic: "graph" },
  { q: "What is the difference between a WEIGHTED and UNWEIGHTED graph?",
    a: "Weighted: each edge carries a numeric cost / distance (e.g. road networks). Unweighted: every edge is treated equally (cost = 1).",
    tag: "L5 · Graphs", topic: "graph" },
  { q: "Which data structure does BFS use, and why?",
    a: "BFS uses a QUEUE (FIFO). The queue preserves the order in which nodes were discovered so we explore layer-by-layer outward from the source — guaranteeing shortest hop-count paths on unweighted graphs.",
    tag: "L5 · Graphs", topic: "graph" },
  { q: "Which data structure does DFS use, and why?",
    a: "DFS uses a STACK (or the call stack via recursion — LIFO). It dives down one path as deep as possible before backtracking, which the stack naturally supports.",
    tag: "L5 · Graphs", topic: "graph" },

  // Linked Lists (L1)
  { q: "Explain a singly linked list and how it differs from a doubly linked list.",
    a: "A singly linked list is a chain of nodes where each node stores data and a single 'next' pointer to the following node. A doubly linked list adds a 'prev' pointer so you can traverse backward as well — costs extra memory but enables O(1) deletion when you already have the node.",
    tag: "L1 · Linked lists", topic: "lists" },
  { q: "What is a circular linked list and where is it used?",
    a: "A linked list where the last node's 'next' points back to the head (instead of None). Useful for round-robin scheduling, music playlists on repeat, and buffering.",
    tag: "L1 · Linked lists", topic: "lists" },
  { q: "Compare array vs linked list for insert-at-head and random access.",
    a: "Insert at head: array O(n) (shift everything), linked list O(1). Random access by index: array O(1), linked list O(n).",
    tag: "L1 · Linked lists", topic: "lists" },

  // Searching (L1)
  { q: "When can you use binary search, and what is its complexity?",
    a: "Binary search requires the data to be SORTED. It halves the search range each comparison ⇒ O(log n). Linear search is O(n) but works on unsorted data.",
    tag: "L1 · Searching", topic: "search" },

  // Sorting (L2/L3)
  { q: "Compare insertion sort and merge sort by time complexity.",
    a: "Insertion sort: O(n²) average and worst, O(n) best (nearly sorted), in-place, stable. Merge sort: O(n log n) in all cases, but needs O(n) auxiliary memory and is also stable.",
    tag: "L2/3 · Sorting", topic: "sort" },
  { q: "What makes quick sort O(n²) in the worst case?",
    a: "If the pivot is consistently the smallest or largest element (e.g. already-sorted input with first-element pivot), partitions are size 0 and n−1 — leading to n levels of recursion of O(n) work each ⇒ O(n²).",
    tag: "L3 · Quick sort", topic: "sort" },
  { q: "Define stability in sorting.",
    a: "A sort is stable if elements with equal keys keep their original relative order. Merge sort and insertion sort are stable; quick sort and heap sort are typically NOT stable.",
    tag: "L2/3 · Sorting", topic: "sort" },

  // Stacks/Queues (L4)
  { q: "What is the difference between a stack and a queue?",
    a: "Stack = LIFO (Last In, First Out) — push and pop happen at the same end ('top'). Queue = FIFO (First In, First Out) — enqueue at the back, dequeue from the front.",
    tag: "L4 · ADTs", topic: "adt" },
  { q: "What is the role of a base case in recursion?",
    a: "The base case terminates the recursion — it returns a direct answer without recursing further. Without it the function would recurse infinitely and overflow the call stack.",
    tag: "L4 · Recursion", topic: "recursion" },

  // Trees / BST (L6)
  { q: "State the BST property.",
    a: "For every node n: every key in n's LEFT subtree is < n.key, and every key in n's RIGHT subtree is > n.key. This holds recursively for all subtrees.",
    tag: "L6 · BST", topic: "bst" },
  { q: "What does it mean for a binary tree to be BALANCED vs UNBALANCED?",
    a: "Balanced: heights of left and right subtrees differ by at most 1 at every node (or close — depends on definition). Search is O(log n). Unbalanced/skewed: one side much deeper — search degrades to O(n).",
    tag: "L6 · Trees", topic: "bst" },
  { q: "Which traversal of a BST visits nodes in sorted order?",
    a: "Inorder traversal (left, node, right) prints the keys in ascending order.",
    tag: "L6 · Trees", topic: "bst" },

  // Optimisation / Greedy (L7)
  { q: "What is a greedy algorithm? Give one example.",
    a: "A greedy algorithm makes the locally optimal choice at each step, hoping to reach a global optimum. Example: making coin change with the largest coin first (works for some coin systems, not all).",
    tag: "L7 · Optimisation", topic: "opt" },
  { q: "Why is the 0/1 Knapsack problem hard?",
    a: "Each item is either fully included or excluded — you cannot take a fraction. It's NP-hard. The fractional version, in contrast, is solvable greedily by value/weight ratio.",
    tag: "L7 · Knapsack", topic: "opt" },

  // DP / MST (L8)
  { q: "What two properties make dynamic programming applicable?",
    a: "(1) Optimal substructure — the optimal solution to the problem contains optimal solutions to subproblems. (2) Overlapping subproblems — the same subproblems recur, so we can memoise.",
    tag: "L8 · DP", topic: "dp" },
  { q: "What is a Minimum Spanning Tree (MST)?",
    a: "A subset of the edges of a connected weighted undirected graph that connects all vertices, contains no cycles, and has minimum total edge weight.",
    tag: "L8 · MST", topic: "mst" },
  { q: "Compare Prim's and Kruskal's MST algorithms.",
    a: "Prim's: grows a single tree from a starting vertex, repeatedly adding the cheapest edge that connects to a new vertex (uses a priority queue). Kruskal's: sorts all edges by weight, adds them one-by-one if they don't create a cycle (uses Union-Find).",
    tag: "L8 · MST", topic: "mst" },

  // Heaps (L9)
  { q: "What is a min-heap?",
    a: "A complete binary tree where every parent's key is ≤ its children's keys. The minimum element is always at the root. Insert and remove-min are O(log n).",
    tag: "L9 · Heap", topic: "heap" },
  { q: "How is a binary heap typically stored?",
    a: "In a simple array. For an element at index i: parent = (i−1)//2, left child = 2i+1, right child = 2i+2. No pointers needed because the tree is complete.",
    tag: "L9 · Heap", topic: "heap" },

  // Hashing (L10) — flagged as Q1 topic
  { q: "List the properties of a GOOD hash function.",
    a: "1) Deterministic — same input always gives same output. 2) Fast to compute (O(1)). 3) Uniform distribution — spreads keys evenly across buckets. 4) Uses the entire key. 5) Minimises collisions.",
    tag: "L10 · Hashing", topic: "hash" },
  { q: "What is a hash collision and how is it handled?",
    a: "A collision happens when two different keys hash to the same index. Two main strategies: (1) Chaining — store a linked list of entries in each bucket. (2) Open addressing — probe to the next free slot (linear, quadratic, or double hashing).",
    tag: "L10 · Hashing", topic: "hash" },
  { q: "What is the average vs worst-case complexity of hash table lookup?",
    a: "Average: O(1) for insert, delete, search (with a good hash + reasonable load factor). Worst case: O(n) if all keys collide and end up in the same chain / probe sequence.",
    tag: "L10 · Hashing", topic: "hash" },

  // Advanced (L11)
  { q: "What is an AVL tree?",
    a: "A self-balancing binary search tree where, for every node, the heights of the left and right subtrees differ by at most 1. Rotations are performed after insert/delete to maintain this invariant — keeping operations O(log n).",
    tag: "L11 · AVL", topic: "advanced" },
  { q: "What is Huffman coding?",
    a: "A greedy algorithm that builds an optimal prefix-free binary code from symbol frequencies. Frequent symbols get shorter codes — used in file compression (ZIP, JPEG).",
    tag: "L11 · Huffman", topic: "advanced" }
];

/* Big-O quiz — Q2 style code snippets */
const BIGO_QUIZ = [
  {
    code: `def f(n):
    total = 0
    for i in range(n):
        total += i
    return total`,
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 2,
    why: "Single loop runs n times, constant work per iteration ⇒ O(n) time, O(1) space."
  },
  {
    code: `def f(n):
    for i in range(n):
        for j in range(n):
            print(i, j)`,
    options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
    answer: 2,
    why: "Nested loops, each n iterations ⇒ n × n = n² operations."
  },
  {
    code: `def f(arr):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target: return mid
        if arr[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1`,
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: 1,
    why: "Binary search halves the search range each iteration ⇒ O(log n)."
  },
  {
    code: `def merge_sort(A):
    if len(A) <= 1: return A
    mid = len(A) // 2
    L = merge_sort(A[:mid])
    R = merge_sort(A[mid:])
    return merge(L, R)   # merge is O(n)`,
    options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
    answer: 1,
    why: "T(n) = 2 T(n/2) + O(n) ⇒ O(n log n). Each of log n levels does linear merging."
  },
  {
    code: `def f(n):
    if n <= 1: return 1
    return f(n-1) + f(n-1)`,
    options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
    answer: 3,
    why: "Two recursive calls each level ⇒ recursion tree has 2ⁿ leaves ⇒ exponential."
  },
  {
    code: `def f(arr):
    n = len(arr)
    for i in range(n):
        for j in range(i+1, n):
            if arr[i] > arr[j]:
                arr[i], arr[j] = arr[j], arr[i]
    return arr`,
    options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
    answer: 2,
    why: "Outer i runs n times, inner j runs roughly n-i times — total ~n(n-1)/2 = O(n²). This is a selection-style sort."
  },
  {
    code: `def f(n):
    i = 1
    while i < n:
        i *= 2
    return i`,
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: 1,
    why: "i doubles each step (1, 2, 4, 8, …), reaching n after log₂(n) iterations."
  },
  {
    code: `def f(n):
    for i in range(n):
        j = 1
        while j < n:
            j *= 2`,
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    answer: 1,
    why: "Outer loop O(n), inner while doubles ⇒ O(log n). Combined ⇒ O(n log n)."
  },
  {
    code: `def insertion_sort(A):
    for i in range(1, len(A)):
        key = A[i]
        j = i - 1
        while j >= 0 and A[j] > key:
            A[j+1] = A[j]
            j -= 1
        A[j+1] = key`,
    options: ["O(n)", "O(n log n)", "O(n²) worst, O(n) best", "O(log n)"],
    answer: 2,
    why: "Worst case (reverse-sorted) every element shifts all the way ⇒ O(n²). Best case (already sorted) inner while never runs ⇒ O(n)."
  },
  {
    code: `def f(arr, target):
    for x in arr:
        if x == target: return True
    return False`,
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 2,
    why: "Linear search — at most n comparisons ⇒ O(n)."
  }
];

/* Preset BST practice sets — mock exam used [21,15,30,20,40,33] */
const BST_PRESETS = [
  { name: "Mock exam set", values: [21,15,30,20,40,33], note: "The exact set from the mock — practice and predict." },
  { name: "Practice A",    values: [25,17,40,10,22,35,50], note: "Fairly balanced — expect roughly balanced tree." },
  { name: "Practice B",    values: [50,30,70,20,40,60,80,10], note: "Symmetric input — likely balanced." },
  { name: "Skewed right",  values: [10,20,30,40,50],     note: "Strictly ascending — produces a right-skewed (unbalanced) tree." },
  { name: "Skewed left",   values: [50,40,30,20,10],     note: "Strictly descending — produces a left-skewed (unbalanced) tree." },
  { name: "Practice C",    values: [42,18,55,12,30,48,60,8,15,25,35], note: "Bigger set — multiple levels." }
];

/* Preset graphs for BFS / DFS — mock exam used a directed 9-node graph */
const GRAPH_PRESETS = [
  {
    name: "Mock exam graph",
    note: "Mirrors the directed graph from the mock exam (Q5). Start vertex: A.",
    nodes: ["A","B","C","D","E","F","G","H","I"],
    edges: [
      ["A","E"], ["A","B"],
      ["E","F"],
      ["B","C"], ["B","D"], ["B","I"],
      ["D","C"], ["D","I"],
      ["F","I"], ["F","G"],
      ["C","H"],
      ["G","H"],
      ["H","I"]
    ],
    start: "A",
    directed: true,
    layout: {
      A: [170, 40],
      B: [80,  110], E: [260, 110],
      C: [40,  185], D: [150, 185], F: [255, 185],
      H: [105, 250], G: [220, 250],
      I: [170, 295]
    }
  },
  {
    name: "Simple undirected",
    note: "Friendly 6-node practice graph.",
    nodes: ["A","B","C","D","E","F"],
    edges: [["A","B"],["A","C"],["B","D"],["C","D"],["C","E"],["D","F"],["E","F"]],
    start: "A",
    directed: false
  },
  {
    name: "Practice graph",
    note: "Directed alternative for revision.",
    nodes: ["A","B","C","D","E","F","G"],
    edges: [["A","B"],["A","C"],["B","D"],["B","E"],["C","F"],["E","F"],["F","G"],["D","G"]],
    start: "A",
    directed: true
  }
];

/* Preset arrays for the sorting visualiser (Q3) */
const SORT_PRESETS = [
  { name: "Mock-style", values: [24,37,16,28,12,9] },
  { name: "Six random", values: [42,9,17,31,5,28] },
  { name: "Already sorted", values: [3,7,12,18,25,33] },
  { name: "Reversed", values: [40,32,25,18,10,4] },
  { name: "With duplicates", values: [15,8,15,3,22,8] }
];
