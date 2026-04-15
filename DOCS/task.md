# Clearflow — AI Workflow Audit Dashboard MVP

## What We're Building

A frontend-only demo dashboard that shows SMB customers how Clearflow works. No backend, no auth, no API calls. Pure demo-ware with realistic fake data. The goal is to look real enough that a prospect immediately understands the product.

## Product Context

Clearflow audits a company's workflows, maps where AI is and isn't being used at each step, and calculates the ROI of automating the gaps. Think of it as a health check for how AI-optimized your company actually is.

Target buyer: SMB ops manager or COO at a 20-200 person company.

---

## Three Core Views

### 1. Workflow List View (`/` or `/workflows`)
The home screen. Shows all workflows across the company at a glance.

Each workflow card should show:
- Workflow name (e.g. "Sales Outreach", "Invoice Processing", "Customer Onboarding")
- Department tag (Sales, Finance, Operations, etc.)
- AI Adoption Score — a % showing how many steps are AI-powered (e.g. 67%)
- Weekly hours spent on this workflow
- Estimated $ saved if fully optimized
- A small step-count indicator (e.g. "6 steps, 2 manual")
- Status badge: Optimized / Partially Optimized / Needs Attention

Include a top summary bar with:
- Total workflows tracked
- Company-wide AI adoption %
- Total hours saved this week
- Total $ saved this month

Clicking a workflow card navigates to the Workflow Drill-Down view.

---

### 2. Workflow Drill-Down View (`/workflows/:id`)
Shows a single workflow step by step.

Layout: horizontal pipeline of steps, left to right. Each step is a card showing:
- Step name (e.g. "Find leads", "Write email", "Send", "Track replies", "Follow up")
- Tool currently used (e.g. "Apollo.io", "ChatGPT", "Gmail", "Manual", "Salesforce")
- Status:
  - ✅ AI-powered (green)
  - ⚠️ Partially automated (amber)
  - ❌ Manual (red)
- Time spent per week on this step
- For manual steps: a recommendation card showing which AI tool could replace it and estimated hours saved

At the bottom, show:
- Total time saved if all recommendations applied
- A "Apply All Recommendations" CTA button (non-functional, just UI)
- A breakdown of recommended tools with logos/names

Back button to return to workflow list.

---

### 3. ROI Dashboard (`/roi`)
Company-wide numbers. The CFO/COO view.

Show:
- Hero metric: Total annual savings potential (e.g. "$142,000/year")
- Hours saved this week across all workflows
- FTE equivalents freed up (hours saved / 40)
- AI adoption score trend (simple line chart, last 8 weeks)
- Top 3 highest-ROI recommendations with estimated $ impact each
- Workflow health breakdown: donut/pie showing Optimized vs Partial vs Needs Attention
- Per-department breakdown table: Department | Workflows | AI Score | Hours Saved | $ Saved
- A weekly digest section: "Here's what changed this week" with 3-4 bullet insights

---

## Fake Data to Use

### Workflows
```js
const workflows = [
  {
    id: 1,
    name: "Sales Outreach",
    department: "Sales",
    aiScore: 60,
    weeklyHours: 18,
    savingsPotential: 28000,
    steps: 5,
    manualSteps: 2,
    status: "partial"
  },
  {
    id: 2,
    name: "Invoice Processing",
    department: "Finance",
    aiScore: 30,
    weeklyHours: 24,
    savingsPotential: 41000,
    steps: 6,
    manualSteps: 4,
    status: "needs-attention"
  },
  {
    id: 3,
    name: "Customer Onboarding",
    department: "Operations",
    aiScore: 80,
    weeklyHours: 10,
    savingsPotential: 8000,
    steps: 7,
    manualSteps: 1,
    status: "optimized"
  },
  {
    id: 4,
    name: "Content Publishing",
    department: "Marketing",
    aiScore: 50,
    weeklyHours: 14,
    savingsPotential: 19000,
    steps: 5,
    manualSteps: 2,
    status: "partial"
  },
  {
    id: 5,
    name: "Support Ticket Triage",
    department: "Support",
    aiScore: 70,
    weeklyHours: 20,
    savingsPotential: 22000,
    steps: 4,
    manualSteps: 1,
    status: "partial"
  },
  {
    id: 6,
    name: "Recruiting Pipeline",
    department: "HR",
    aiScore: 20,
    weeklyHours: 30,
    savingsPotential: 35000,
    steps: 8,
    manualSteps: 6,
    status: "needs-attention"
  }
]
```

### Sales Outreach Workflow Steps (for drill-down demo)
```js
const salesOutreachSteps = [
  {
    id: 1,
    name: "Lead Generation",
    tool: "Apollo.io",
    status: "ai",
    weeklyHours: 1,
    description: "AI scrapes and scores leads automatically"
  },
  {
    id: 2,
    name: "Email Copywriting",
    tool: "ChatGPT",
    status: "ai",
    weeklyHours: 2,
    description: "AI drafts personalised outreach emails"
  },
  {
    id: 3,
    name: "Email Sending",
    tool: "Instantly.ai",
    status: "ai",
    weeklyHours: 0.5,
    description: "Automated send sequences"
  },
  {
    id: 4,
    name: "Reply Tracking",
    tool: "Manual (Gmail)",
    status: "manual",
    weeklyHours: 6,
    description: "Team manually checks inbox and logs replies",
    recommendation: {
      tool: "Superhuman + Clay",
      hourlySaving: 5,
      annualSaving: 13000,
      effort: "Low"
    }
  },
  {
    id: 5,
    name: "Follow-up Sequences",
    tool: "Manual",
    status: "manual",
    weeklyHours: 8,
    description: "Sales reps manually write and send follow-ups",
    recommendation: {
      tool: "Lemlist",
      hourlySaving: 7,
      annualSaving: 18200,
      effort: "Low"
    }
  }
]
```

### ROI Summary Numbers
```js
const roiSummary = {
  annualSavingsPotential: 142000,
  weeklyHoursSaved: 31,
  fteEquivalents: 1.8,
  currentAiScore: 55,
  workflowsTracked: 6,
  weeklyTrend: [38, 41, 39, 44, 47, 49, 52, 55] // AI adoption % over 8 weeks
}
```

---

## Design Direction

**Aesthetic**: Clean, confident, data-forward. Think Linear meets Notion meets a Bloomberg terminal. Dark sidebar, light main content area. Not a generic SaaS purple gradient. Use a neutral near-black sidebar (#0F1117) with a crisp white/off-white main area. Accent color: a sharp teal (#00C9A7) for positive metrics and AI-powered steps. Red/amber for manual/needs-attention. Monospaced font for numbers, clean sans-serif for labels.

**Typography**: Use `DM Sans` or `Sora` for UI text. Use `JetBrains Mono` or `Space Mono` for numbers and metrics.

**Key UI details to nail**:
- AI adoption score shown as a filled progress arc or horizontal bar, not a generic progress bar
- Status badges with subtle background fills, not harsh colored boxes
- Step pipeline in drill-down should feel like a flowchart, with connecting arrows between steps
- Manual steps should have a subtle red tint on their card and a "Recommended fix" expandable section
- The ROI numbers should feel impressive — large, bold, monospaced

---

## Tech Stack

- **React** (single file or multi-file, your call)
- **Tailwind CSS** for styling
- **Recharts** for the AI adoption trend line chart and donut chart
- **React Router** for navigation between the three views (or simple state-based routing if single file)
- No backend, no API calls, all data is hardcoded from the fake data above

---

## File Structure (suggested)

```
clearflow/
├── CLAUDE.md          ← this file
├── package.json
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── pages/
│   │   ├── WorkflowList.jsx
│   │   ├── WorkflowDrillDown.jsx
│   │   └── ROIDashboard.jsx
│   └── components/
│       ├── Sidebar.jsx
│       ├── WorkflowCard.jsx
│       ├── StepCard.jsx
│       ├── MetricHero.jsx
│       └── StatusBadge.jsx
```

---

## What "Done" Looks Like

- [ ] All three pages render with realistic fake data
- [ ] Clicking a workflow card in the list navigates to its drill-down
- [ ] Drill-down shows the step pipeline with correct status colors
- [ ] Manual steps show recommendation cards
- [ ] ROI dashboard shows trend chart and department table
- [ ] Sidebar nav works between all three views
- [ ] Looks polished enough to show a prospect or investor without apologising for it

---

## Notes for Claude Code

- Keep all data in `src/data/mockData.js` so it's easy to swap out
- Don't over-engineer — this is a demo, not a production app
- Prioritise visual polish over feature completeness
- If a component gets long, split it — aim for files under 150 lines
- Use Tailwind utility classes throughout, no custom CSS files needed
- Import Recharts components directly, they're available via CDN/npm