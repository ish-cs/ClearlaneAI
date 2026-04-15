const config = {
  optimized: {
    label: 'Optimized',
    classes: 'bg-teal/10 text-teal border border-teal/20',
  },
  partial: {
    label: 'Partial',
    classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
  'needs-attention': {
    label: 'Needs Attention',
    classes: 'bg-red-500/10 text-red-400 border border-red-500/20',
  },
}

export default function StatusBadge({ status }) {
  const { label, classes } = config[status] ?? config['partial']
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${classes}`}>
      {label}
    </span>
  )
}
