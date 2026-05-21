import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Settings, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/produtos', label: 'Produtos', icon: Package, end: false },
  { to: '/vendas', label: 'Vendas', icon: ShoppingCart, end: false },
]

type Props = {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 shrink-0 flex flex-col bg-zinc-900 text-zinc-100 transition-transform duration-200',
          'md:static md:translate-x-0 md:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 px-5 py-[18px] border-b border-zinc-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs tracking-tight">GC</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-zinc-100">Gerenciador</p>
            <p className="text-[11px] text-zinc-400">Controle</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
            Menu
          </p>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    className={isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-indigo-300" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4 space-y-0.5">
          <button className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all duration-150">
            <Settings size={17} className="text-zinc-500 group-hover:text-zinc-300" />
            <span>Configurações</span>
          </button>
        </div>

        <div className="px-4 py-4 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-white">A</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">Admin</p>
              <p className="text-[11px] text-zinc-500 truncate">gerenciador</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
