import { NavLink } from 'react-router-dom'

const nav = [
  {
    to: '/',
    end: true,
    label: 'Dashboard',
    icon: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/workflows',
    end: true,
    label: 'Workflows',
    icon: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l3-9 4 18 3-9h4" />
      </svg>
    ),
  },
  {
    to: '/roi',
    end: false,
    label: 'ROI / Impact',
    icon: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    to: '/data-sources',
    end: false,
    label: 'Data Sources',
    icon: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-sidebar flex flex-col z-10 border-r"
      style={{ borderColor: 'rgba(28,16,8,0.10)', backgroundImage: 'linear-gradient(rgba(28,16,8,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(28,16,8,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(28,16,8,0.10)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#3C2410' }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M8 3v10" stroke="#EDE9E2" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-serif font-semibold text-ink text-base leading-none tracking-tight">Clearlane</span>
        </div>
      </div>

      <div className="px-3 pt-3 pb-1">
        <p className="text-[9px] font-semibold uppercase tracking-widest px-2 py-1" style={{ color: 'rgba(28,16,8,0.30)' }}>Navigation</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {nav.map(({ to, end, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brown/10 text-brown-DEFAULT'
                  : 'hover:bg-black/[0.04]'
              }`
            }
            style={({ isActive }) => ({ color: isActive ? '#7C5234' : 'rgba(28,16,8,0.45)' })}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t mx-2 mb-2" style={{ borderColor: 'rgba(28,16,8,0.10)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-semibold tracking-tight"
            style={{ background: 'rgba(28,16,8,0.06)', borderColor: 'rgba(28,16,8,0.12)', color: 'rgba(28,16,8,0.50)' }}>
            AC
          </div>
          <div>
            <p className="text-xs font-medium leading-none mb-0.5" style={{ color: 'rgba(28,16,8,0.75)' }}>Acme Corp</p>
            <p className="text-[10px]" style={{ color: 'rgba(28,16,8,0.35)' }}>Demo workspace</p>
          </div>
          <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#7C5234' }} />
        </div>
      </div>
    </aside>
  )
}
