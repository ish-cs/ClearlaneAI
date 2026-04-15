export default function MetricHero({ label, value, sub, accent }) {
  return (
    <div className="bg-card border border-white/[0.06] rounded-xl px-6 py-5">
      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">{label}</p>
      <p className={`font-mono text-3xl font-semibold leading-none mb-1.5 ${accent ? 'text-teal' : 'text-white'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  )
}
