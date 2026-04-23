import { workflows, workflowSteps } from '../data/mockData'
import WorkflowCard from '../components/WorkflowCard'

const BROWN = '#7C5234'
const INK = '#1C1008'

function SummaryBar() {
  const allSteps = Object.values(workflowSteps).flat()
  const totalManualHrs = allSteps.filter(s => s.status === 'manual').reduce((s, st) => s + st.weeklyHours, 0)
  const totalSavings = workflows.reduce((s, w) => s + w.savingsPotential, 0)
  const avgAi = Math.round(workflows.reduce((s, w) => s + w.aiScore, 0) / (workflows.length || 1))

  return (
    <div className="grid grid-cols-4 gap-3 mb-8">
      {[
        { label: 'Workflows tracked',   value: workflows.length,              accent: false },
        { label: 'Avg AI adoption',     value: `${avgAi}%`,                   accent: true  },
        { label: 'Manual hrs / week',   value: `${totalManualHrs}h`,          accent: false },
        { label: 'Est. annual savings', value: `$${(totalSavings / 1000).toFixed(0)}k`, accent: true },
      ].map(({ label, value, accent }) => (
        <div key={label} className="bg-card border rounded-xl px-5 py-4">
          <p className="text-[9px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(28,16,8,0.35)' }}>{label}</p>
          <p className="font-mono text-2xl font-semibold leading-none" style={{ color: accent ? BROWN : INK }}>
            {value}
          </p>
        </div>
      ))}
    </div>
  )
}

export default function WorkflowList() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: BROWN, letterSpacing: '0.14em' }}>Automation</p>
        <h1 className="font-serif text-3xl font-semibold" style={{ color: INK }}>Workflows</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(28,16,8,0.45)' }}>All active workflows across your organisation</p>
      </div>

      <SummaryBar />

      <div className="grid grid-cols-3 gap-4">
        {workflows.map(wf => (
          <WorkflowCard key={wf.id} workflow={wf} />
        ))}
      </div>
    </div>
  )
}
