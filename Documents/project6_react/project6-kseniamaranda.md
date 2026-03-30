## Explanation (Option A)

I chose Option A because it demonstrates fine-grained, dependency-based reactivity (like signals-based frameworks) without needing a virtual DOM. The core data structure is a small dependency graph: each signal/computed owns a `subs` set of observer functions, and there is a global `current` observer that gets registered whenever `.value` is read. On signal writes, dependents are re-run; on computed creation, the computation is executed once to record dependencies, and when those dependencies change it re-computes and notifies its own subscribers. Real frameworks use the same idea: track reads, then propagate updates only to affected computations/effects.

