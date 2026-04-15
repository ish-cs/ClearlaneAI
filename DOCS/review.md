# Clearflow App Review
_Code audit — 2026-04-15_

---

## Overview

Three views: Workflow List (`/`), Workflow Canvas (`/workflows/:id`), ROI Dashboard (`/roi`). Overall the shell is solid — dark theme, consistent type scale, teal accent. Issues below are grouped by severity.

---

## Critical (breaks UX or data integrity)

### 1. Canvas node edits are lost on navigation
`handleUpdate` merges form data into React Flow node state (`setNodes`), but `selectedStep` is still resolved against `rawSteps` (the original hardcoded array):

```js
const selectedStep = selectedNodeId
  ? rawSteps.find(s => String(s.id) === selectedNodeId) ??
    nodes.find(n => n.id === selectedNodeId)?.data
  : null
```

The fallback to `nodes` only fires for *new* nodes (those with IDs > 100 that won't exist in `rawSteps`). Editing an existing step and re-opening its panel shows stale data from `rawSteps`, not the saved edits. Fix: resolve `selectedStep` from `nodes` first, fall back to `rawSteps` only for initial population.

### 2. New node name stays "New Step" after editing
`handleUpdate` updates `n.data` but `WorkflowNode` initialises its local `name` state from `data.name` once on mount (`useState(data.name)`). After save the node still shows "New Step" until the page is refreshed. Fix: treat `data.name` as the source of truth in `WorkflowNode` (use it directly instead of mirroring into local state, or reset state when the prop changes via `useEffect`).

### 3. Delete handler captures stale `nodes` closure
`handleDelete` is defined with `useCallback(... [])` — no deps. It calls `setEdges(es => es.filter(...))` which is fine, but if any future logic references `nodes` directly it will be stale. Low risk now but worth fixing by removing the empty dep array.

### 4. `costPerUnit` null-check missing in WorkflowNode
```js
${data.monthlyCost}/mo · ${data.costPerUnit?.toFixed(2)} ${data.unitLabel}
```
When a user adds a node and sets `monthlyCost` but leaves `costPerUnit` undefined, this renders `undefined undefined` on the card. Add a guard: only show the cost-per-unit fragment when it's non-null.

---

## High (visible quality issues)

### 5. Workflow List — summary bar shows "$ saved this month" but it's annual ÷ 12
The label says "saved this month" but the value is `annualSavingsPotential / 12`, which is *potential* savings — not actual realised savings. Misleading framing for a prospect demo. Consider "Potential / mo" or align the label to match.

### 6. ROI Dashboard — donut chart is off-center
`PieChart` is fixed at `width={120} height={120}` with `cx={55}` (not 60). The chart visually leans left in its container. Fix `cx` to `60` or use `ResponsiveContainer`.

### 7. Stacked bar chart bars don't add to 100%
`Math.round` on each segment independently means AI + Partial + Manual can sum to 99 or 101. For a workflow with 1 of each type across 3 steps: `33 + 33 + 33 = 99`. Use a ceiling-correction on the last segment.

### 8. Benchmark bar progress is wrong for "lowers is better" metrics
```js
style={{ width: `${Math.min((b.yours / (b.industry * 1.4)) * 100, 100)}%` }}
```
This shows a *longer* bar for worse metrics (higher manual hrs). For `lowerIsBetter` metrics the bar should be inverted — shorter = better.

### 9. NodePanel — tool expand shows nothing when no matching data source
When the tool accordion is open and `stepSources` is empty (which is the case for most new/custom nodes), the expanded area shows blank space. Add an empty state: "No connected data source for this tool."

### 10. NodePanel Recommendation section: `annualSaving` crashes when null
```js
value={`$${step.recommendation.annualSaving.toLocaleString()}`}
```
New nodes added via "Add step" have no `recommendation`. NodePanel only renders this section when `step.recommendation` exists, but if a user edits an existing step and clears data this could throw. Minor — worth adding optional chaining.

---

## Medium (polish / UX gaps)

### 11. Canvas — no empty state when all nodes are deleted
Deleting all nodes leaves a blank React Flow canvas with no affordance to add a step. The "Add step" button in the top bar still works, but isn't visible enough. A centred empty state ("No steps yet — add one above") would help.

### 12. Canvas — node dragging deselects on accidental clicks
React Flow fires `onNodeClick` after a drag, which toggles the selected node. Users dragging a node to reposition it often end up toggling the panel open/closed. Fix: suppress the click handler if the node was dragged (track `onNodeDragStart` / `onNodeDragStop`).

### 13. Workflow List — cards are not keyboard accessible
`onClick` on a `<div>` with no `role="button"` or `tabIndex`. Not a blocker for a demo, but worth noting for any sales calls with accessibility-conscious buyers.

### 14. ROI Dashboard — top ROI recommendations are hardcoded
`topRecs` is a static array that doesn't derive from `workflowSteps`. If mock data changes, these three items become inconsistent with the actual data on-screen. Derive them from `workflowSteps` by finding steps with the highest `recommendation.annualSaving`.

### 15. ROI Dashboard — weekly digest is hardcoded
Same issue as above. `weeklyInsights` is a static array. It mentions specific numbers (e.g. "4 of 6 steps are fully manual" for Invoice Processing) that could drift from the real mock data. Derive from `workflowSteps` or clearly label as "AI-generated summary".

### 16. Sidebar — only two nav items, no active state feedback on canvas route
When on `/workflows/2` the Workflows nav item correctly shows active (via NavLink). But there's no way to navigate to Settings, Integrations, or other common SaaS sections — this makes the sidebar feel sparse. Even placeholder items with a "Coming soon" lock icon would make the app feel more complete.

### 17. Canvas — legend hint text is wrong
Legend says "Dbl-click node to rename · Drag to reposition". The drag hint is redundant (React Flow users expect this), but more importantly: the panel is opened by single-click, which isn't mentioned. Update to "Click to inspect · Double-click to rename".

### 18. WorkflowDrillDown metrics bar — "Hrs saved/mo" is weekly savings × 4
```js
value: `${(savedHrs * 4).toFixed(0)}h`
```
`savedHrs` sums `recommendation.hourlySaving` across manual steps. `hourlySaving` is described in NodePanel as "Save/week". Multiplying by 4 gives a monthly figure, but the label says "Hrs saved/mo" not "Hrs saved if automated". Make sure the calculation matches what's promised: if it's a monthly projection, label it clearly as potential.

---

## Low (minor polish)

### 19. WorkflowNode — description area blank for new steps
New nodes have `description: ''`. The description `<p>` renders empty with `marginBottom: 10` still applied, leaving dead whitespace between the name and the tool row. Add `{data.description && ...}` guard.

### 20. NodePanel edit form — no validation
"Add to workflow" can be clicked with Name left blank. The node saves as "New Step" on the canvas. At minimum disable the save button when `form.name.trim() === ''`.

### 21. Workflow List summary bar — "$saved this month" and "hours saved / week" both pull from `roiSummary` constants, not derived from workflowSteps
If steps are edited on the canvas, these summary numbers don't update. Since all data is client-side, consider deriving these in real-time.

### 22. Donut chart — no tooltip
The donut in ROI Dashboard has no `Tooltip` component, so hovering segments gives no feedback. Add a `<Tooltip />` to the `<PieChart>`.

### 23. MiniMap is partially obscured by node panel
When NodePanel is open (width 340px) and the canvas is narrow, the minimap in the bottom-right overlaps with the panel. Consider repositioning the MiniMap to bottom-left, or hiding it when the panel is open.

### 24. App name inconsistency
The `<title>` in `index.html` says "Clearflow — AI Workflow Audit" but the marketing name used in conversation is "Clearlane." The sidebar also says "Clearflow." Align on one name.

---

---

## Product Evolution — RevOps Command Center

The following changes define the next phase of the product. The goal is to evolve Clearflow from a strong single-screen workflow tool into a coherent RevOps product that makes sense across the whole app — not just inside the workflow canvas. The end result should feel like a complete SaaS product for Heads of RevOps to understand, prioritize, improve, and track revenue workflows over time.

---

### Vision

A Head of RevOps should be able to:
1. Start from a high-level overview
2. See which workflows need attention
3. Drill into a specific workflow
4. Understand what is broken
5. Know what to fix first
6. Track whether changes worked

---

### 1. Rework the product structure top-down

Restructure the left navigation around a real RevOps workflow. The sidebar should have four sections:

| Nav item | Purpose |
|----------|---------|
| **Dashboard** | Home screen — top bottlenecks, top opportunities, workflow health, recent alerts, biggest areas of manual work |
| **Workflows** | Library / overview of all workflows with health, optimization score, bottleneck count, and impact summaries |
| **ROI / Impact** | Savings, performance impact, before/after improvement tracking |
| **Data Sources** | Connected systems, sync health, trust/confidence, and source coverage (full page, not just a canvas tab) |

The normal user journey: Dashboard → Workflows → Workflow Detail.

The current `/` Workflow List becomes the Workflows nav item. A new Dashboard becomes the default landing page (`/`). ROI Dashboard stays but gets renamed to ROI / Impact. Data Sources becomes a top-level route.

---

### 2. Keep the workflow canvas — make it more actionable

The workflow detail page stays centered on the canvas. Keep everything that exists today:
- Zoom / pan canvas
- Editable nodes and connections
- Green / amber / red optimization coloring
- Tool pills in nodes
- Node click for side panel details

Add the following to make it actionable:
- **Cleaner header**: workflow name, health badge, optimization score, AI adoption %, bottleneck count, time range selector
- **Persistent "Top Opportunities" section** for this specific workflow — visible without clicking into a node
- **Lightweight trend awareness**: a small indicator per step (e.g., "worsening", "improving", "stable") so users can tell if manual hours are rising or falling
- The canvas should feel like a deep analysis and editing workspace, not just a diagram viewer

---

### 3. Add prioritization and decision support

The product should not just show problems — it should help users decide what to do first. Add a consistent prioritization layer across Dashboard, Workflows list, and Workflow Detail:

- **Impact tiers**: High / Medium / Low on bottlenecks and opportunities
- **Top opportunities** ranked by estimated annual upside (already in mockData via `recommendation.annualSaving`)
- **Rising issues**: flag steps or workflows where manual time is trending up
- Each workflow card and each node should make clear:
  - What the issue is
  - Why it matters
  - Estimated upside if fixed

This means upgrading WorkflowCard to surface bottleneck count and top opportunity, and upgrading the node panel to lead with the recommendation rather than bury it at the bottom.

---

### 4. Make Data Sources a real product area

Data Sources must be promoted from a canvas sub-tab to a full top-level section in the main navigation (`/data-sources`).

The full Data Sources page should show:
- All connected tools / systems
- Connection health (Connected / Syncing / Error)
- Last sync time
- Source coverage — which workflows each source powers
- Confidence / trust score — how complete the data is

The workflow-level "Data Sources" tab on the canvas can stay, but should be a filtered/lightweight view ("sources powering this workflow") that links back to the main Data Sources page for detail.

---

### 5. Support the full improvement loop

The product must be useful before, during, and after workflow changes:

| Phase | What the product shows |
|-------|----------------------|
| **Before** | Bottlenecks, manual hours, estimated upside if automated |
| **During** | Canvas editing — add/remove/modify steps, change status |
| **After** | Before vs after comparison, hours saved, score improvement, cost delta |

The ROI / Impact page should include a before/after section that shows improvement per workflow (mockable with hardcoded "baseline" vs "current" values). This makes the product feel like an operating system for workflow improvement, not just a visualization tool.

---

### Implementation priorities

The following items should be built in roughly this order:

1. **Sidebar restructure** — add Dashboard and Data Sources routes, rename/reorder nav items
2. **Dashboard page** — new `/` landing page with overview widgets, top bottlenecks, top opportunities, workflow health summary
3. **Data Sources page** — promote to top-level `/data-sources` with full source cards, health, and coverage
4. **Workflow canvas improvements** — persistent top opportunities section, trend indicators on steps, cleaner header
5. **ROI / Impact upgrades** — before/after comparison, per-workflow impact tracking
6. **Prioritization layer** — High/Medium/Low impact labels consistently across all three main views

---

## Summary table

| # | Area | Severity | Fix effort |
|---|------|----------|------------|
| 1 | Canvas — edits lost on re-open | Critical | Small |
| 2 | Canvas — node name stale after save | Critical | Small |
| 3 | Canvas — delete closure | Critical | Trivial |
| 4 | WorkflowNode — null cost render | Critical | Trivial |
| 5 | Workflow List — misleading metric label | High | Trivial |
| 6 | ROI — donut off-center | High | Trivial |
| 7 | ROI — stacked bar doesn't sum to 100 | High | Small |
| 8 | ROI — benchmark bar inverted | High | Small |
| 9 | NodePanel — empty tool expand | High | Small |
| 10 | NodePanel — annualSaving null crash | High | Trivial |
| 11 | Canvas — no empty state | Medium | Small |
| 12 | Canvas — drag fires click | Medium | Small |
| 13 | WorkflowList — no keyboard access | Medium | Small |
| 14 | ROI — hardcoded top recs | Medium | Medium |
| 15 | ROI — hardcoded digest | Medium | Medium |
| 16 | Sidebar — sparse nav | Medium | Small |
| 17 | Canvas — wrong legend text | Medium | Trivial |
| 18 | Drill-down — hrs saved label ambiguous | Medium | Trivial |
| 19 | WorkflowNode — empty desc whitespace | Low | Trivial |
| 20 | NodePanel — no name validation | Low | Trivial |
| 21 | WorkflowList — metrics not reactive | Low | Medium |
| 22 | ROI — donut no tooltip | Low | Trivial |
| 23 | Canvas — minimap overlap with panel | Low | Small |
| 24 | App name inconsistency | Low | Trivial |
