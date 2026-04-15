# Clearflow — Next Features

Based on competitive analysis of existing sales workflow tooling. All features below are additive to the current three-view MVP.

---

## 1. Bottleneck Analysis Panel

**Where:** New section on the Workflow Drill-Down view, below the pipeline and above the recommendations summary.

**What it shows:**
- A list of identified bottlenecks within the workflow, each with:
  - Bottleneck name (e.g. "Follow-Up Wait Time", "Manual Data Entry", "Inefficient Process")
  - Severity badge: High / Medium / Low
  - Quantified impact (e.g. "2.5 day avg delay", "4h/week wasted")
  - Which step it maps to in the pipeline
- A small callout card linking the worst bottleneck to a tool recommendation (e.g. "OpenAI can resolve this — automates CRM Updates")

**Data to add to mockData.js:**
Each workflow gets a `bottlenecks` array:
```js
bottlenecks: [
  { name: "Follow-Up Wait Time", severity: "high", impact: "2.5 day avg delay", step: "Follow-up Sequences" },
  { name: "Manual Data Entry", severity: "medium", impact: "3h/week", step: "Reply Tracking" },
]
```

---

## 2. Industry Benchmark Comparison

**Where:** New panel on the ROI Dashboard, replacing or sitting alongside the weekly digest.

**What it shows:**
- Side-by-side comparison table or card pair:
  - Your follow-up response time vs industry average
  - Your automation rate vs industry benchmark
  - Your AI adoption score vs industry benchmark
  - Your hours saved/week vs industry average for company size
- Each row has a delta indicator (ahead / behind) with color coding
- A summary line: "You're 15% below industry benchmark on automation rate"

**Data to add:**
```js
export const industryBenchmarks = {
  followUpResponseDays: { yours: 2.5, industry: 1.4 },
  automationRate: { yours: 45, industry: 60 },
  aiAdoptionScore: { yours: 55, industry: 62 },
  weeklyHoursSaved: { yours: 31, industry: 38 },
}
```

---

## 3. Process Efficiency Breakdown — Stacked Bar Chart

**Where:** ROI Dashboard, replacing or sitting below the donut chart. Could also appear on the Workflow List view.

**What it shows:**
- X-axis: workflow stages / workflow names
- Y-axis: 0–100%
- Each bar split into three segments: Automated (teal) / Partially Automated (amber) / Manual (red)
- Hover tooltip shows exact % and hours for each segment
- Uses Recharts `BarChart` with `stacked` prop

**Data needed:**
Each workflow already has `aiScore`, `manualSteps`, `steps` — derive partial % from the step-level data in `workflowSteps`.

---

## 4. Conversion Rate + Avg Cycle Time Metrics

**Where:** Workflow card (small secondary metric) + Workflow Drill-Down header stats block.

**What it shows:**
- Conversion rate: % of inputs that reach the final step successfully (e.g. 31% of leads → closed deal)
- Avg cycle time: how many days a typical item takes to move through the full workflow

**Data to add to each workflow:**
```js
conversionRate: 31,   // %
avgCycleTimeDays: 18,
```

**Display:** Add two more stat tiles in the drill-down header card (alongside current AI%, AI/Partial/Manual counts). On workflow cards, show cycle time as a tertiary label.

---

## 5. Per-Step Cost Tracking

**Where:** Each StepCard in the pipeline. Also aggregated in the recommendations summary.

**What it shows:**
- Current monthly cost to run this step (labour + tooling)
- Cost per unit processed (e.g. "$0.42 per lead")
- For AI steps: actual tool cost per month

**Data to add to each step:**
```js
monthlyCost: 129,       // $ current cost
costPerUnit: 0.42,      // $ per lead/invoice/etc.
unitLabel: "per lead",
```

**Display:** Small cost pill on each StepCard below the tool tag. In the recommendations summary, show "Current cost: $X → Projected cost: $Y after automation".

---

## 6. Efficiency Gain Callout

**Where:** Top of the Workflow Drill-Down view, just below the header. Also on the ROI Dashboard hero section.

**What it shows:**
- A single highlighted banner/card: "35% efficiency gain per lead if all recommendations applied"
- Derived from: (totalHourlySaving / workflow.weeklyHours) * 100
- Uses a teal accent banner style, not a standard metric card

**Implementation:** Computed value, no new data needed — calculate from existing `workflowSteps` recommendation data.

---

## 7. Richer Recommendation Cards

**Where:** Expandable section in StepCard (replaces current minimal expand).

**What to add:**
- "vs" comparison: current tool vs recommended tool side by side
- Uplift % label: "15% faster processing"
- Effort + timeline: "Low effort — live in ~1 week"
- A one-line rationale: "Apollo already in your stack — Clay extends it"

**Data to add to each recommendation:**
```js
recommendation: {
  tool: "Lemlist",
  vs: "Manual Gmail",           // what it replaces
  upliftLabel: "7x faster sends",
  timeToLive: "~3 days",
  rationale: "Plug-and-play with your existing Instantly.ai setup",
  hourlySaving: 7,
  annualSaving: 18200,
  effort: "Low",
}
```

---

## 8. Pipeline Throughput Numbers

**Where:** Each StepCard in the pipeline, below the tool pill.

**What it shows:**
- Volume of items processed through this step per week (e.g. "840 leads", "1,562 emails")
- Drop-off % between steps where relevant (e.g. "↓ 23% from previous step")

**Data to add to each step:**
```js
weeklyVolume: 840,
volumeUnit: "leads",
dropoffPct: null,   // or 23 for steps where drop-off is notable
```

---

## Implementation Order

| # | Feature | Effort | Impact |
|---|---|---|---|
| 1 | Bottleneck Analysis panel | Medium | High |
| 2 | Benchmark Comparison | Low | High |
| 3 | Stacked bar chart | Low | Medium |
| 4 | Conversion rate + cycle time | Low | Medium |
| 5 | Per-step cost tracking | Medium | Medium |
| 6 | Efficiency gain callout | Low | Medium |
| 7 | Richer recommendation cards | Low | Low |
| 8 | Pipeline throughput numbers | Low | Low |

Recommended build order: 6 → 4 → 2 → 3 → 1 → 7 → 5 → 8

Start with the purely computed/display features (6, 4, 2, 3) since they require minimal new mock data. Then move to the data-heavy ones (1, 5, 8) which need schema additions to `mockData.js` first.
