const config = {
  optimized: {
    label: 'Optimized',
    style: { background: 'rgba(74,112,98,0.10)', color: '#4A7062', border: '1px solid rgba(74,112,98,0.22)' },
  },
  partial: {
    label: 'Partial',
    style: { background: 'rgba(196,146,42,0.10)', color: '#C4922A', border: '1px solid rgba(196,146,42,0.22)' },
  },
  'needs-attention': {
    label: 'Needs Attention',
    style: { background: 'rgba(180,64,64,0.10)', color: '#B44040', border: '1px solid rgba(180,64,64,0.22)' },
  },
}

export default function StatusBadge({ status }) {
  const { label, style } = config[status] ?? config['partial']
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" style={style}>
      {label}
    </span>
  )
}
