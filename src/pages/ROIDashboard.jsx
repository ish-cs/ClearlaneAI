import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts'
import { roiSummary, workflows, workflowSteps, departmentBreakdown, industryBenchmarks, topOpportunities, weeklyInsights } from '../data/mockData'
import MetricHero from '../components/MetricHero'

const INK = '#1C1008'
const BROWN = '#7C5234'
const SAGE = '#4A7062'
const RUST = '#B44040'
const AMBER = '#C4922A'
const STEEL = '#3D6080'

const trendData = roiSummary.weeklyTrend.map((v, i) => ({ week: `W${i + 1}`, score: v }))

const healthCounts = {
  Optimized: workflows.filter(w => w.status === 'optimized').length,
  Partial: workflows.filter(w => w.status === 'partial').length,
  'Needs Attention': workflows.filter(w => w.status === 'needs-attention').length,
}
const donutData = Object.entries(healthCounts).map(([name, value]) => ({ name, value }))
const DONUT_COLORS = [SAGE, AMBER, RUST]

const efficiencyData = workflows.map(wf => {
  const steps = workflowSteps[wf.id] ?? []
  const total = steps.length || 1
  const aiCount      = steps.filter(s => s.status === 'ai').length
  const partialCount = steps.filter(s => s.status === 'partial').length
  const automated = Math.round((aiCount / total) * 100)
  const partial   = Math.round((partialCount / total) * 100)
  const manual    = 100 - automated - partial
  return { name: wf.name.split(' ')[0], Automated: automated, Partial: partial, Manual: manual }
})

const derivedTopRecs = topOpportunities.slice(0, 3).map(opp => ({
  label: `Automate ${opp.stepName}`,
  dept: opp.dept,
  saving: opp.annualSaving,
}))

const tickStyle = { fill: 'rgba(28,16,8,0.35)', fontSize: 10 }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="border rounded-lg px-3 py-2 text-xs shadow-lg bg-card">
      <p className="mb-1" style={{ color: 'rgba(28,16,8,0.40)' }}>{label}</p>
      <p className="font-mono font-semibold" style={{ color: BROWN }}>{payload[0].value}%</p>
    </div>
  )
}

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="border rounded-lg px-3 py-2.5 text-xs shadow-lg space-y-1 bg-card">
      <p className="mb-1.5 font-medium" style={{ color: 'rgba(28,16,8,0.45)' }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.fill }} />
            <span style={{ color: 'rgba(28,16,8,0.50)' }}>{p.name}</span>
          </div>
          <span className="font-mono font-semibold" style={{ color: 'rgba(28,16,8,0.75)' }}>{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="border rounded-lg px-3 py-2 text-xs shadow-lg bg-card">
      <p className="mb-0.5" style={{ color: 'rgba(28,16,8,0.50)' }}>{payload[0].name}</p>
      <p className="font-mono font-semibold" style={{ color: 'rgba(28,16,8,0.75)' }}>{payload[0].value} workflow{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  )
}

function SectionLabel({ children }) {
  return <p className="text-[9px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(28,16,8,0.35)', letterSpacing: '0.12em' }}>{children}</p>
}

function BenchmarkPanel() {
  const entries = Object.values(industryBenchmarks)
  return (
    <div className="bg-card border rounded-xl p-6">
      <SectionLabel>Industry benchmarks</SectionLabel>
      <div className="space-y-4">
        {entries.map(b => {
          const ahead = b.lowerIsBetter ? b.yours < b.industry : b.yours > b.industry
          const delta = b.lowerIsBetter
            ? ((b.industry - b.yours) / b.industry * 100).toFixed(0)
            : ((b.yours - b.industry) / b.industry * 100).toFixed(0)
          const absDelta = Math.abs(Number(delta))
          const barWidth = b.lowerIsBetter
            ? Math.min((b.industry / (b.yours || 0.1)) * 100, 100)
            : Math.min((b.yours / (b.industry * 1.4)) * 100, 100)

          return (
            <div key={b.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'rgba(28,16,8,0.50)' }}>{b.label}</span>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                  style={ahead
                    ? { background: 'rgba(74,112,98,0.10)', color: SAGE, border: '1px solid rgba(74,112,98,0.20)' }
                    : { background: 'rgba(180,64,64,0.10)', color: RUST, border: '1px solid rgba(180,64,64,0.20)' }
                  }>
                  {ahead ? `+${absDelta}% ahead` : `${absDelta}% behind`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(28,16,8,0.06)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, background: BROWN }} />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono flex-shrink-0">
                  <span className="font-semibold" style={{ color: 'rgba(28,16,8,0.65)' }}>{b.yours}{b.unit}</span>
                  <span style={{ color: 'rgba(28,16,8,0.20)' }}>vs</span>
                  <span style={{ color: 'rgba(28,16,8,0.35)' }}>{b.industry}{b.unit}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BeforeAfterSection() {
  const totalAiGain = workflows.reduce((sum, w) => sum + (w.baseline ? w.aiScore - w.baseline.aiScore : 0), 0)
  const totalHrsSaved = workflows.reduce((sum, w) => sum + (w.baseline ? w.baseline.weeklyHours - w.weeklyHours : 0), 0)

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <SectionLabel>Before / After — 8 weeks</SectionLabel>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="font-semibold" style={{ color: BROWN }}>+{totalAiGain}pp AI adoption</span>
          <span style={{ color: 'rgba(28,16,8,0.18)' }}>·</span>
          <span className="font-semibold" style={{ color: BROWN }}>{totalHrsSaved}h/wk reclaimed</span>
        </div>
      </div>

      <div className="space-y-2">
        {workflows.filter(w => w.baseline).map(w => {
          const aiDelta = w.aiScore - w.baseline.aiScore
          const hrsDelta = w.baseline.weeklyHours - w.weeklyHours
          const improved = aiDelta > 0
          const pct = w.aiScore
          const barColor = pct >= 70 ? SAGE : pct >= 40 ? AMBER : RUST

          return (
            <div key={w.id} className="flex items-center gap-4">
              <div className="w-36 flex-shrink-0">
                <p className="text-xs font-medium truncate" style={{ color: 'rgba(28,16,8,0.70)' }}>{w.name}</p>
              </div>
              <div className="flex-1 relative h-4 rounded-full overflow-hidden" style={{ background: 'rgba(28,16,8,0.05)' }}>
                <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${w.baseline.aiScore}%`, background: 'rgba(28,16,8,0.08)' }} />
                <div className="absolute left-0 top-0 h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor, opacity: 0.75 }} />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono flex-shrink-0 w-28 justify-end">
                <span style={{ color: 'rgba(28,16,8,0.35)' }}>{w.baseline.aiScore}%</span>
                <span style={{ color: 'rgba(28,16,8,0.18)' }}>→</span>
                <span style={{ color: improved ? BROWN : 'rgba(28,16,8,0.50)', fontWeight: improved ? 600 : 400 }}>{w.aiScore}%</span>
                {aiDelta !== 0 && (
                  <span className="text-[9px] font-semibold" style={{ color: aiDelta > 0 ? BROWN : RUST }}>
                    {aiDelta > 0 ? '+' : ''}{aiDelta}pp
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono w-20 text-right flex-shrink-0">
                {hrsDelta > 0 ? (
                  <span style={{ color: BROWN }}>{hrsDelta}h saved</span>
                ) : hrsDelta < 0 ? (
                  <span style={{ color: RUST }}>{Math.abs(hrsDelta)}h added</span>
                ) : (
                  <span style={{ color: 'rgba(28,16,8,0.28)' }}>no change</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] mt-4" style={{ color: 'rgba(28,16,8,0.22)' }}>Baseline captured 8 weeks ago · Current = live data</p>
    </div>
  )
}

export default function ROIDashboard() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: BROWN, letterSpacing: '0.14em' }}>Analytics</p>
        <h1 className="font-serif text-3xl font-semibold" style={{ color: INK }}>ROI / Impact</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(28,16,8,0.45)' }}>Company-wide AI optimisation impact</p>
      </div>

      {/* Hero metrics */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="col-span-1 border rounded-xl px-6 py-5 flex flex-col justify-center"
          style={{ background: 'rgba(124,82,52,0.07)', borderColor: 'rgba(124,82,52,0.18)' }}>
          <p className="text-[9px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(28,16,8,0.40)' }}>Annual savings potential</p>
          <p className="font-mono text-4xl font-semibold leading-none" style={{ color: BROWN }}>
            ${(roiSummary.annualSavingsPotential / 1000).toFixed(0)}k
          </p>
          <p className="text-[11px] mt-2" style={{ color: 'rgba(28,16,8,0.35)' }}>if all recommendations applied</p>
        </div>
        <MetricHero label="Hours saved this week" value={`${roiSummary.weeklyHoursSaved}h`} sub="Across all workflows" />
        <MetricHero label="FTE equivalents freed" value={roiSummary.fteEquivalents} sub="Based on 40h work week" accent />
        <MetricHero label="AI adoption score" value={`${roiSummary.currentAiScore}%`} sub="Company-wide average" accent />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-card border rounded-xl p-5">
          <SectionLabel>AI adoption trend</SectionLabel>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <XAxis dataKey="week" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis domain={[30, 65]} tick={{ ...tickStyle, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" stroke={BROWN} strokeWidth={2}
                dot={{ fill: BROWN, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: BROWN, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border rounded-xl p-5">
          <SectionLabel>Process efficiency</SectionLabel>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={efficiencyData} margin={{ top: 0, right: 0, bottom: 0, left: -28 }} barSize={14}>
              <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={{ ...tickStyle, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="Automated" stackId="a" fill={SAGE} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Partial" stackId="a" fill={AMBER} />
              <Bar dataKey="Manual" stackId="a" fill={RUST} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-3 mt-3 justify-center">
            {[[SAGE, 'Automated'], [AMBER, 'Partial'], [RUST, 'Manual']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                <span className="text-[10px]" style={{ color: 'rgba(28,16,8,0.40)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 flex flex-col">
          <SectionLabel>Workflow health</SectionLabel>
          <div className="flex-1 flex items-center justify-center">
            <PieChart width={120} height={120}>
              <Pie data={donutData} cx={60} cy={55} innerRadius={34} outerRadius={52} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </div>
          <div className="space-y-2">
            {donutData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: DONUT_COLORS[i] }} />
                  <span className="text-[11px]" style={{ color: 'rgba(28,16,8,0.45)' }}>{item.name}</span>
                </div>
                <span className="font-mono text-xs font-semibold" style={{ color: 'rgba(28,16,8,0.65)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Before / After */}
      <div className="mb-5">
        <BeforeAfterSection />
      </div>

      {/* Top recs + dept table */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-card border rounded-xl p-6">
          <SectionLabel>Top ROI recommendations</SectionLabel>
          <div className="space-y-2">
            {derivedTopRecs.map((rec, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-colors border"
                style={{ background: 'rgba(28,16,8,0.02)', borderColor: 'rgba(28,16,8,0.06)' }}>
                <span className="font-mono text-xs font-semibold w-4 flex-shrink-0" style={{ color: 'rgba(28,16,8,0.18)' }}>{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight" style={{ color: 'rgba(28,16,8,0.80)' }}>{rec.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(28,16,8,0.40)' }}>{rec.dept}</p>
                </div>
                <span className="font-mono text-sm font-semibold flex-shrink-0" style={{ color: BROWN }}>${rec.saving.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <SectionLabel>By department</SectionLabel>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(28,16,8,0.07)' }}>
                {['Department', 'AI Score', 'Hrs saved', '$ / mo'].map(h => (
                  <th key={h} className="text-left text-[9px] font-semibold uppercase tracking-wider pb-2.5 pr-3" style={{ color: 'rgba(28,16,8,0.35)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departmentBreakdown.map(row => (
                <tr key={row.department} className="border-b last:border-0" style={{ borderColor: 'rgba(28,16,8,0.05)' }}>
                  <td className="py-2.5 pr-3 text-xs font-medium" style={{ color: 'rgba(28,16,8,0.70)' }}>{row.department}</td>
                  <td className="py-2.5 pr-3">
                    <span className="font-mono text-xs font-semibold" style={{ color: row.aiScore >= 70 ? SAGE : row.aiScore >= 40 ? AMBER : RUST }}>
                      {row.aiScore}%
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs" style={{ color: 'rgba(28,16,8,0.45)' }}>{row.hoursSaved}h</td>
                  <td className="py-2.5 font-mono text-xs" style={{ color: 'rgba(28,16,8,0.45)' }}>${row.moneySaved.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benchmarks + weekly digest */}
      <div className="grid grid-cols-2 gap-3">
        <BenchmarkPanel />

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <SectionLabel>Weekly digest</SectionLabel>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ml-1 -mt-3"
              style={{ background: 'rgba(124,82,52,0.10)', color: BROWN, border: '1px solid rgba(124,82,52,0.20)' }}>
              This week
            </span>
          </div>
          <ul className="space-y-3">
            {weeklyInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: BROWN }} />
                <span className="text-sm leading-relaxed" style={{ color: 'rgba(28,16,8,0.55)' }}>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
