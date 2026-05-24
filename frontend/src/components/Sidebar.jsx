import { BarChart3, Boxes, ClipboardList, LayoutDashboard, Package, Settings2, ShoppingCart, Warehouse } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItemClass = ({ isActive }) =>
  `nav-item flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'nav-active' : 'nav-inactive'}`;

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/categories', label: 'Categories', icon: Boxes },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/sales', label: 'Sales History', icon: ClipboardList }
];

const cashierLinks = [
  { to: '/pos', label: 'POS', icon: ShoppingCart },
  { to: '/pos/sales', label: 'Sales History', icon: ClipboardList }
];

export default function Sidebar({ role, open, onClose }) {
  const links = role === 'admin' ? adminLinks : cashierLinks;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-sky-100 bg-white/95 p-5 shadow-soft transition dark:border-sky-900/40 dark:bg-slate-950/95 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] theme-accent">{role === 'admin' ? 'Admin' : 'Cashier'} Portal</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight theme-heading">POS System</h2>
        </div>
        {onClose ? (
          <button className="btn-secondary lg:hidden" onClick={onClose} type="button">
            Close
          </button>
        ) : null}
      </div>

      <nav className="space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} className={navItemClass} to={item.to} onClick={onClose} end={item.to === '/pos'}>
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-8 rounded-3xl bg-sky-900 p-5 text-white dark:bg-sky-600/20 dark:text-sky-50">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Inventory Alert</p>
        <p className="mt-3 text-lg font-semibold">Track low stock before sales are interrupted.</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-white/80">
          <Settings2 size={16} /> Auto stock reduction enabled
        </div>
      </div>
    </aside>
  );
}
