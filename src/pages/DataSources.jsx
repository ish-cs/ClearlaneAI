import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dataSources, workflows } from '../data/mockData'

const INK = '#1C1008'
const BROWN = '#7C5234'
const SAGE = '#4A7062'
const RUST = '#B44040'
const AMBER = '#C4922A'

const statusConfig = {
  connected: {
    label: 'Connected',
    dot: SAGE,
    badge: { background: 'rgba(74,112,98,0.10)', color: SAGE, border: '1px solid rgba(74,112,98,0.20)' },
  },
  syncing: {
    label: 'Syncing',
    dot: AMBER,
    badge: { background: 'rgba(196,146,42,0.10)', color: AMBER, border: '1px solid rgba(196,146,42,0.20)' },
  },
  error: {
    label: 'Error',
    dot: RUST,
    badge: { background: 'rgba(180,64,64,0.10)', color: RUST, border: '1px solid rgba(180,64,64,0.20)' },
  },
}

const FILTERS = ['all', 'connected', 'syncing', 'error']

export default function DataSources() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const counts = {
    connected: dataSources.filter(d => d.status === 'connected').length,
    syncing:   dataSources.filter(d => d.status === 'syncing').length,
    error:     dataSources.filter(d => d.status === 'error').length,
  }

  const visible = filter === 'all' ? dataSources : dataSources.filter(d => d.status === filter)

  return (
    <div>
      <div className="mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: BROWN, letterSpacing: '0.14em' }}>Integrations</p>
        <h1 className="font-serif text-3xl font-semibold" style={{ color: INK }}>Data Sources</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(28,16,8,0.45)' }}>Connected systems, sync health, and workflow coverage</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Connected', value: counts.connected, color: SAGE,  bg: 'rgba(74,112,98,0.07)',   border: 'rgba(74,112,98,0.15)'  },
          { label: 'Syncing',   value: counts.syncing,   color: AMBER, bg: 'rgba(196,146,42,0.07)',  border: 'rgba(196,146,42,0.15)' },
          { label: 'Error',     value: counts.error,     color: RUST,  bg: counts.error > 0 ? 'rgba(180,64,64,0.07)' : '#FAFAF8', border: counts.error > 0 ? 'rgba(180,64,64,0.15)' : 'rgba(28,16,8,0.09)' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className="rounded-xl px-5 py-4 border" style={{ background: bg, borderColor: border }}>
            <p className="text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(28,16,8,0.35)' }}>{label}</p>
            <p className="font-mono text-2xl font-semibold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 mb-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize"
            style={filter === f
              ? { background: 'rgba(124,82,52,0.10)', color: BROWN }
              : { color: 'rgba(28,16,8,0.40)' }
            }
            onMouseEnter={e => { if (filter !== f) e.currentTarget.style.background = 'rgba(28,16,8,0.04)' }}
            onMouseLeave={e => { if (filter !== f) e.currentTarget.style.background = 'transparent' }}
          >
            {f === 'all' ? `All (${dataSources.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f] ?? 0})`}
          </button>
        ))}
      </div>

      {/* Source grid */}
      <div className="grid grid-cols-2 gap-3">
        {visible.map(src => (
          <SourceCard key={src.id} src={src} navigate={navigate} />
        ))}
      </div>
    </div>
  )
}

function SourceCard({ src, navigate }) {
  const sc = statusConfig[src.status] ?? statusConfig.connected
  const coverageWorkflows = workflows.filter(w =>
    src.usedInWorkflows.some(u => u.workflowId === w.id)
  )

  const confidenceColor = src.confidenceScore >= 80 ? SAGE : src.confidenceScore >= 50 ? AMBER : RUST
  const confidenceBg    = src.confidenceScore >= 80
    ? 'rgba(74,112,98,0.07)'
    : src.confidenceScore >= 50
    ? 'rgba(196,146,42,0.07)'
    : 'rgba(180,64,64,0.07)'

  return (
    <div className="border rounded-xl p-5 transition-colors"
      style={{
        background: src.status === 'error' ? 'rgba(180,64,64,0.04)' : '#FAFAF8',
        borderColor: src.status === 'error' ? 'rgba(180,64,64,0.15)' : 'rgba(28,16,8,0.09)',
      }}>
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(28,16,8,0.05)', border: '1px solid rgba(28,16,8,0.08)' }}>
            <span className="text-[10px] font-bold" style={{ color: 'rgba(28,16,8,0.45)' }}>
              {src.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight" style={{ color: 'rgba(28,16,8,0.85)' }}>{src.name}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(28,16,8,0.35)' }}>{src.category}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold px-2 py-0.5 rounded-full" style={sc.badge}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
            {sc.label}
          </span>
          <span className="text-[9px] font-mono" style={{ color: 'rgba(28,16,8,0.25)' }}>{src.lastSync}</span>
        </div>
      </div>

      {/* Confidence + data fields */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 px-3 py-2 rounded-lg text-center" style={{ minWidth: 64, background: confidenceBg, border: '1px solid rgba(28,16,8,0.07)' }}>
          <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(28,16,8,0.30)' }}>Trust</p>
          <p className="font-mono text-sm font-semibold" style={{ color: confidenceColor }}>
            {src.status === 'error' ? 'N/A' : `${src.confidenceScore}%`}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 flex-1">
          {src.dataProvided.map(d => (
            <span key={d} className="text-[9px] rounded px-1.5 py-0.5 font-medium"
              style={{ color: 'rgba(28,16,8,0.45)', background: 'rgba(28,16,8,0.04)', border: '1px solid rgba(28,16,8,0.07)' }}>
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Workflow coverage */}
      {coverageWorkflows.length > 0 ? (
        <div className="pt-3.5 border-t" style={{ borderColor: 'rgba(28,16,8,0.07)' }}>
          <p className="text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(28,16,8,0.25)' }}>Powering workflows</p>
          <div className="flex flex-wrap gap-1.5">
            {coverageWorkflows.map(w => (
              <button
                key={w.id}
                onClick={() => navigate(`/workflows/${w.id}`)}
                className="text-[10px] font-medium rounded-md px-2 py-0.5 transition-colors"
                style={{ background: 'rgba(124,82,52,0.08)', color: BROWN, border: '1px solid rgba(124,82,52,0.15)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,82,52,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,82,52,0.08)'}
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="pt-3.5 border-t" style={{ borderColor: 'rgba(28,16,8,0.07)' }}>
          <p className="text-[10px]" style={{ color: 'rgba(28,16,8,0.25)' }}>Not used in any active workflow</p>
        </div>
      )}

      {src.status === 'error' && (
        <div className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'rgba(180,64,64,0.07)', border: '1px solid rgba(180,64,64,0.15)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
            <circle cx="6" cy="6" r="5" stroke={RUST} strokeWidth="1.2"/>
            <path d="M6 3.5V6.5" stroke={RUST} strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="6" cy="8.2" r="0.6" fill={RUST}/>
          </svg>
          <p className="text-[10px]" style={{ color: RUST }}>Connection error — last successful sync {src.lastSync}</p>
        </div>
      )}
    </div>
  )
}
