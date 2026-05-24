import { LogOut, Menu, Receipt } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Topbar({ title, user, onMenuClick, onLogout, subtitle }) {
  return (
    <header className="glass-panel flex items-center justify-between gap-4 px-4 py-4 md:px-6">
      <div className="flex items-center gap-3">
        {onMenuClick ? (
          <button className="btn-secondary lg:hidden" onClick={onMenuClick} type="button">
            <Menu size={18} />
          </button>
        ) : null}
          <div>
           <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] theme-accent">
             <Receipt size={14} /> {user?.shopName || 'Grocery POS'}
           </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm theme-subtitle">{subtitle}</p> : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold">{user?.fullName}</p>
           <p className="text-xs uppercase tracking-[0.18em] theme-subtitle">{user?.role}</p>
        </div>
        {onLogout ? (
          <button className="btn-danger" onClick={onLogout} type="button">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
