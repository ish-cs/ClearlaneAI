import { workflows, roiSummary } from '../data/mockData'
import WorkflowCard from '../components/WorkflowCard'

function SummaryBar() {
  return (
    <div className="grid grid-cols-4 gap-3 mb-8">
      {[
        { label: 'Workflows tracked', value: roiSummary.workflowsTracked, accent: false },
        { label: 'AI adoption', value: `${roiSummary.currentAiScore}%`, accent: true },
        { label: 'Hours saved / week', value: `${roiSummary.weeklyHoursSaved}h`, accent: false },
        {
          label: '$ saved this month',
          value: `$${(roiSummary.annualSavingsPotential / 12 / 1000).toFixed(1)}k`,
          accent: true,
        },
      ].map(({ label, value, accent }) => (
        <div key={label} className="bg-card border border-white/[0.06] rounded-xl px-5 py-4">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2.5">{label}</p>
          <p className={`font-mono text-2xl font-semibold leading-none ${accent ? 'text-teal' : 'text-white/90'}`}>
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
      <div className="mb-7">
        <h1 className="text-lg font-semibold text-white/90 tracking-tight">Workflows</h1>
        <p className="text-sm text-white/30 mt-0.5">All active workflows across your organisation</p>
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
