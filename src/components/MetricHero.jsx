export default function MetricHero({ label, value, sub, accent }) {
  return (
    <div className="bg-card border rounded-xl px-6 py-5">
      <p className="text-[9px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(28,16,8,0.35)' }}>{label}</p>
      <p className="font-mono text-3xl font-semibold leading-none mb-1.5" style={{ color: accent ? '#7C5234' : '#1C1008' }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: 'rgba(28,16,8,0.35)' }}>{sub}</p>}
    </div>
  )
}
