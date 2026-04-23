import { dataSources } from '../../data/mockData'

const SAGE  = '#4A7062'
const AMBER = '#C4922A'
const RUST  = '#B44040'
const BROWN = '#7C5234'

const statusConfig = {
  connected: {
    label: 'Connected', dot: SAGE,
    badge: { background: 'rgba(74,112,98,0.10)', color: SAGE, border: '1px solid rgba(74,112,98,0.20)' },
  },
  syncing: {
    label: 'Syncing', dot: AMBER,
    badge: { background: 'rgba(196,146,42,0.10)', color: AMBER, border: '1px solid rgba(196,146,42,0.20)' },
  },
  error: {
    label: 'Error', dot: RUST,
    badge: { background: 'rgba(180,64,64,0.10)', color: RUST, border: '1px solid rgba(180,64,64,0.20)' },
  },
}

export default function DataSourcesTab({ workflowId }) {
  const wfSources = dataSources.filter(ds =>
    ds.usedInWorkflows.some(u => u.workflowId === workflowId)
  )
  const otherSources = dataSources.filter(ds =>
    !ds.usedInWorkflows.some(u => u.workflowId === workflowId)
  )

  const counts = {
    connected: dataSources.filter(d => d.status === 'connected').length,
    syncing:   dataSources.filter(d => d.status === 'syncing').length,
    error:     dataSources.filter(d => d.status === 'error').length,
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)]">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Connected', value: counts.connected, color: SAGE  },
          { label: 'Syncing',   value: counts.syncing,   color: AMBER },
          { label: 'Error',     value: counts.error,     color: RUST  },
        ].map(({ label, value, color }) => (
          <div key={label} className="border rounded-xl px-4 py-3.5" style={{ background: '#FAFAF8', borderColor: 'rgba(28,16,8,0.09)' }}>
            <p className="text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(28,16,8,0.35)' }}>{label}</p>
            <p className="font-mono text-2xl font-semibold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {wfSources.length > 0 && (
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(28,16,8,0.35)' }}>
            Used in this workflow
          </p>
          <div className="space-y-2">
            {wfSources.map(src => <SourceCard key={src.id} src={src} workflowId={workflowId} highlighted />)}
          </div>
        </div>
      )}

      {otherSources.length > 0 && (
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(28,16,8,0.35)' }}>
            Other connected sources
          </p>
          <div className="space-y-2">
            {otherSources.map(src => <SourceCard key={src.id} src={src} workflowId={workflowId} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function SourceCard({ src, workflowId, highlighted }) {
  const sc = statusConfig[src.status] ?? statusConfig.connected
  const steps = src.usedInWorkflows.filter(u => u.workflowId === workflowId)

  return (
    <div className="border rounded-xl p-4 transition-colors"
      style={{
        background: highlighted ? 'rgba(28,16,8,0.02)' : '#FAFAF8',
        borderColor: highlighted ? 'rgba(28,16,8,0.09)' : 'rgba(28,16,8,0.06)',
        opacity: highlighted ? 1 : 0.65,
      }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(28,16,8,0.05)', border: '1px solid rgba(28,16,8,0.08)' }}>
            <span className="text-[9px] font-bold" style={{ color: 'rgba(28,16,8,0.45)' }}>
              {src.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight" style={{ color: 'rgba(28,16,8,0.80)' }}>{src.name}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(28,16,8,0.40)' }}>{src.category}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold px-2 py-0.5 rounded-full" style={sc.badge}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
            {sc.label}
          </span>
          <span className="text-[9px] font-mono" style={{ color: 'rgba(28,16,8,0.28)' }}>{src.lastSync}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {src.dataProvided.map(d => (
          <span key={d} className="text-[9px] rounded px-1.5 py-0.5 font-medium"
            style={{ color: 'rgba(28,16,8,0.50)', background: 'rgba(28,16,8,0.04)', border: '1px solid rgba(28,16,8,0.07)' }}>
            {d}
          </span>
        ))}
      </div>

      {steps.length > 0 && (
        <div className="pt-2.5" style={{ borderTop: '1px solid rgba(28,16,8,0.07)' }}>
          <p className="text-[9px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: 'rgba(28,16,8,0.28)' }}>Used in</p>
          <div className="flex flex-wrap gap-1.5">
            {steps.map(s => (
              <span key={s.stepName} className="text-[10px] font-medium rounded-md px-2 py-0.5"
                style={{ color: BROWN, background: 'rgba(124,82,52,0.08)', border: '1px solid rgba(124,82,52,0.15)' }}>
                {s.stepName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
