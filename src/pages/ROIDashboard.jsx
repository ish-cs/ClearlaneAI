import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend,
} from 'recharts'
import { roiSummary, workflows, workflowSteps, departmentBreakdown, industryBenchmarks } from '../data/mockData'
import MetricHero from '../components/MetricHero'

const trendData = roiSummary.weeklyTrend.map((v, i) => ({ week: `W${i + 1}`, score: v }))

const healthCounts = {
  Optimized: workflows.filter(w => w.status === 'optimized').length,
  Partial: workflows.filter(w => w.status === 'partial').length,
  'Needs Attention': workflows.filter(w => w.status === 'needs-attention').length,
}
const donutData = Object.entries(healthCounts).map(([name, value]) => ({ name, value }))
const DONUT_COLORS = ['#00C9A7', '#F59E0B', '#EF4444']

// Derive stacked bar data from step-level data
const efficiencyData = workflows.map(wf => {
  const steps = workflowSteps[wf.id] ?? []
  const total = steps.length
  const ai = steps.filter(s => s.status === 'ai').length
  const partial = steps.filter(s => s.status === 'partial').length
  const manual = steps.filter(s => s.status === 'manual').length
  return {
    name: wf.name.split(' ')[0],
    Automated: Math.round((ai / total) * 100),
    Partial: Math.round((partial / total) * 100),
    Manual: Math.round((manual / total) * 100),
  }
})

const topRecs = [
  { label: 'Automate follow-up sequences', dept: 'Sales', saving: 18200 },
  { label: 'AI-assisted resume screening', dept: 'HR', saving: 18200 },
  { label: 'Automate invoice data extraction', dept: 'Finance', saving: 15600 },
]

const weeklyInsights = [
  'Invoice Processing remains the lowest-scored workflow at 30% — 4 of 6 steps are fully manual.',
  'HR Recruiting Pipeline has the most manual steps (6) and highest time cost at 30 hrs/week.',
  'Customer Onboarding reached 80% AI adoption — the best-performing workflow this period.',
  'Company-wide AI adoption rose 3 points to 55% over the last 4 weeks.',
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white/30 mb-1">{label}</p>
      <p className="font-mono text-teal font-semibold">{payload[0].value}%</p>
    </div>
  )
}

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-white/10 rounded-lg px-3 py-2.5 text-xs shadow-xl space-y-1">
      <p className="text-white/40 mb-1.5 font-medium">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.fill }} />
            <span className="text-white/50">{p.name}</span>
          </div>
          <span className="font-mono font-semibold text-white/80">{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

function BenchmarkPanel() {
  const entries = Object.values(industryBenchmarks)
  return (
    <div className="bg-card border border-white/[0.06] rounded-xl p-6">
      <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-5">
        Industry benchmarks
      </p>
      <div className="space-y-4">
        {entries.map(b => {
          const ahead = b.lowerIsBetter ? b.yours < b.industry : b.yours > b.industry
          const delta = b.lowerIsBetter
            ? ((b.industry - b.yours) / b.industry * 100).toFixed(0)
            : ((b.yours - b.industry) / b.industry * 100).toFixed(0)
          const absDelta = Math.abs(Number(delta))

          return (
            <div key={b.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/50">{b.label}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  ahead
                    ? 'bg-teal/10 text-teal border-teal/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {ahead ? `+${absDelta}% ahead` : `${absDelta}% behind`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal transition-all"
                    style={{ width: `${Math.min((b.yours / (b.industry * 1.4)) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono flex-shrink-0">
                  <span className="text-white/60 font-semibold">{b.yours}{b.unit}</span>
                  <span className="text-white/20">vs</span>
                  <span className="text-white/30">{b.industry}{b.unit}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ROIDashboard() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-lg font-semibold text-white/90 tracking-tight">ROI Dashboard</h1>
        <p className="text-sm text-white/30 mt-0.5">Company-wide AI optimisation impact</p>
      </div>

      {/* Hero metrics */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="col-span-1 bg-teal/[0.08] border border-teal/15 rounded-xl px-6 py-5 flex flex-col justify-center">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Annual savings potential</p>
          <p className="font-mono text-4xl font-semibold text-teal leading-none">
            ${(roiSummary.annualSavingsPotential / 1000).toFixed(0)}k
          </p>
          <p className="text-[11px] text-white/25 mt-2">if all recommendations applied</p>
        </div>
        <MetricHero label="Hours saved this week" value={`${roiSummary.weeklyHoursSaved}h`} sub="Across all workflows" />
        <MetricHero label="FTE equivalents freed" value={roiSummary.fteEquivalents} sub="Based on 40h work week" accent />
        <MetricHero label="AI adoption score" value={`${roiSummary.currentAiScore}%`} sub="Company-wide average" accent />
      </div>

      {/* Charts row — trend | stacked bar | donut */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {/* Trend */}
        <div className="bg-card border border-white/[0.06] rounded-xl p-5">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-4">AI adoption trend</p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[30, 65]} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" stroke="#00C9A7" strokeWidth={2} dot={{ fill: '#00C9A7', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#00C9A7', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stacked bar */}
        <div className="bg-card border border-white/[0.06] rounded-xl p-5">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-4">Process efficiency</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={efficiencyData} margin={{ top: 0, right: 0, bottom: 0, left: -28 }} barSize={14}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="Automated" stackId="a" fill="#00C9A7" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Partial" stackId="a" fill="#F59E0B" />
              <Bar dataKey="Manual" stackId="a" fill="#EF4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-3 mt-3 justify-center">
            {[['#00C9A7', 'Automated'], ['#F59E0B', 'Partial'], ['#EF4444', 'Manual']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                <span className="text-[10px] text-white/30">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut */}
        <div className="bg-card border border-white/[0.06] rounded-xl p-5 flex flex-col">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">Workflow health</p>
          <div className="flex-1 flex items-center justify-center">
            <PieChart width={120} height={120}>
              <Pie data={donutData} cx={55} cy={55} innerRadius={34} outerRadius={52} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2">
            {donutData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: DONUT_COLORS[i] }} />
                  <span className="text-[11px] text-white/40">{item.name}</span>
                </div>
                <span className="font-mono text-xs font-semibold text-white/60">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top recs + dept table */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-card border border-white/[0.06] rounded-xl p-6">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-4">Top ROI recommendations</p>
          <div className="space-y-2">
            {topRecs.map((rec, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] transition-colors">
                <span className="font-mono text-xs font-semibold text-white/15 w-4 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 leading-tight">{rec.label}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">{rec.dept}</p>
                </div>
                <span className="font-mono text-sm font-semibold text-teal flex-shrink-0">${rec.saving.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-white/[0.06] rounded-xl p-6">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-4">By department</p>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {['Department', 'AI Score', 'Hrs saved', '$ / mo'].map(h => (
                  <th key={h} className="text-left text-[10px] text-white/25 font-semibold uppercase tracking-wider pb-2.5 pr-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departmentBreakdown.map(row => (
                <tr key={row.department} className="border-b border-white/[0.03] last:border-0">
                  <td className="py-2.5 pr-3 text-xs font-medium text-white/70">{row.department}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`font-mono text-xs font-semibold ${row.aiScore >= 70 ? 'text-teal' : row.aiScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                      {row.aiScore}%
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-white/40">{row.hoursSaved}h</td>
                  <td className="py-2.5 font-mono text-xs text-white/40">${row.moneySaved.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benchmarks + weekly digest */}
      <div className="grid grid-cols-2 gap-3">
        <BenchmarkPanel />

        <div className="bg-card border border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">Weekly digest</p>
            <span className="text-[10px] bg-teal/10 text-teal font-semibold px-2 py-0.5 rounded-full border border-teal/20 uppercase tracking-wide">
              This week
            </span>
          </div>
          <ul className="space-y-3">
            {weeklyInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-teal mt-1.5 flex-shrink-0" />
                <span className="text-sm text-white/50 leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
