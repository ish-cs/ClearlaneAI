import { memo, useState, useCallback, useEffect } from 'react'
import { Handle, Position } from '@xyflow/react'

const SAGE  = '#4A7062'
const AMBER = '#C4922A'
const RUST  = '#B44040'

const statusMap = {
  ai:      { border: SAGE,  bg: 'rgba(74,112,98,0.07)',   dot: SAGE,  label: 'AI',     text: SAGE  },
  partial: { border: AMBER, bg: 'rgba(196,146,42,0.07)',  dot: AMBER, label: 'Hybrid',  text: AMBER },
  manual:  { border: RUST,  bg: 'rgba(180,64,64,0.07)',   dot: RUST,  label: 'Manual',  text: RUST  },
}

const trendMap = {
  improving: { icon: '↑', color: SAGE  },
  stable:    { icon: '→', color: 'rgba(28,16,8,0.25)' },
  worsening: { icon: '↓', color: RUST  },
}

function OptScore({ score, color }) {
  const r = 11
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className="flex-shrink-0">
      <circle cx="14" cy="14" r={r} fill="none" stroke="rgba(28,16,8,0.07)" strokeWidth="2.5" />
      <circle cx="14" cy="14" r={r} fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 14 14)" />
      <text x="14" y="14" textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="6.5" fontFamily="JetBrains Mono, monospace" fontWeight="600">
        {score}
      </text>
    </svg>
  )
}

function getScore(status, weeklyHours = 4) {
  if (status === 'ai')      return Math.min(96, 80 + Math.round((10 - Math.min(weeklyHours, 10)) * 1.6))
  if (status === 'partial') return Math.min(68, 38 + Math.round((8  - Math.min(weeklyHours, 8))  * 3))
  return Math.max(5, 32 - Math.round(weeklyHours * 1.8))
}

export default memo(function WorkflowNode({ data, selected, id }) {
  const [editing, setEditing]   = useState(false)
  const [localName, setLocalName] = useState(data.name)
  const cfg   = statusMap[data.status] ?? statusMap.manual
  const score = getScore(data.status, data.weeklyHours)
  const trend = trendMap[data.trend]

  useEffect(() => {
    if (!editing) setLocalName(data.name)
  }, [data.name, editing])

  const commitName = useCallback(() => {
    setEditing(false)
    data.onRename?.(id, localName)
  }, [id, localName, data])

  const fmtVol = v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)

  return (
    <div
      className="group relative"
      style={{
        width: 216,
        background: cfg.bg,
        border: `1px solid ${selected ? cfg.border : 'rgba(28,16,8,0.10)'}`,
        borderLeft: `3px solid ${cfg.border}`,
        borderRadius: 12,
        boxShadow: selected
          ? `0 0 0 2px ${cfg.border}30, 0 4px 16px rgba(28,16,8,0.12)`
          : '0 2px 8px rgba(28,16,8,0.08)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
        backgroundColor: '#FAFAF8',
      }}
    >
      <div style={{ padding: '12px 13px 11px' }}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
            <span style={{ color: cfg.text, fontSize: 9, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
              {cfg.label}
            </span>
            {trend && (
              <span style={{ fontSize: 10, fontWeight: 700, color: trend.color, marginLeft: 2 }} title={data.trend}>
                {trend.icon}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <OptScore score={score} color={cfg.border} />
            {data.onDelete && (
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); data.onDelete(id) }}
                className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded flex items-center justify-center transition-opacity"
                style={{ background: 'rgba(180,64,64,0.08)' }}
                title="Delete step"
              >
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                  <path d="M2 2l6 6M8 2l-6 6" stroke={RUST} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <input
            autoFocus
            value={localName}
            onChange={e => setLocalName(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => { if (e.key === 'Enter') commitName(); e.stopPropagation() }}
            className="w-full rounded px-1.5 py-0.5 text-sm font-semibold outline-none mb-2"
            style={{ background: 'rgba(28,16,8,0.04)', border: '1px solid rgba(28,16,8,0.12)', color: '#1C1008', fontFamily: 'DM Sans, sans-serif' }}
          />
        ) : (
          <p
            className="text-sm font-semibold leading-snug mb-1.5"
            style={{ color: 'rgba(28,16,8,0.85)', cursor: 'text', fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            onDoubleClick={e => { e.stopPropagation(); setEditing(true) }}
            title="Double-click to rename"
          >
            {localName}
          </p>
        )}

        {data.description && (
          <p style={{ fontSize: 10, color: 'rgba(28,16,8,0.40)', lineHeight: 1.5, marginBottom: 10,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {data.description}
          </p>
        )}

        <div className="flex items-center justify-between" style={{ marginTop: data.description ? 0 : 8 }}>
          <span style={{
            fontSize: 9, fontWeight: 600, color: 'rgba(28,16,8,0.45)',
            background: 'rgba(28,16,8,0.04)', border: '1px solid rgba(28,16,8,0.07)',
            borderRadius: 5, padding: '2px 6px',
          }}>
            {data.tool}
          </span>
          <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(28,16,8,0.35)',
            display: 'flex', gap: 6 }}>
            <span>{data.weeklyHours}h/wk</span>
            {data.weeklyVolume != null && <span>{fmtVol(data.weeklyVolume)}</span>}
          </div>
        </div>

        {data.isBottleneck && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 9,
            fontWeight: 700, color: RUST, background: 'rgba(180,64,64,0.08)',
            border: '1px solid rgba(180,64,64,0.15)', borderRadius: 6, padding: '3px 7px' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: RUST, flexShrink: 0 }} />
            Bottleneck
          </div>
        )}

        {data.monthlyCost != null && data.costPerUnit != null && (
          <div style={{ marginTop: 6, fontSize: 9, color: 'rgba(28,16,8,0.28)',
            fontFamily: 'JetBrains Mono, monospace' }}>
            ${data.monthlyCost}/mo · ${data.costPerUnit.toFixed(2)} {data.unitLabel}
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Left}
        style={{ background: cfg.border, border: 'none', width: 8, height: 8, left: -4 }} />
      <Handle type="source" position={Position.Right}
        style={{ background: cfg.border, border: 'none', width: 8, height: 8, right: -4 }} />
    </div>
  )
})
