import { Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#f5fbf7] text-slate-900 transition-colors duration-300 dark:bg-[#07111f] dark:text-sky-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(148,214,179,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(94,193,145,0.12),_transparent_28%),linear-gradient(135deg,_rgba(255,248,236,0.9),_rgba(245,251,247,0.92))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.28),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_rgba(14,37,64,0.95),_rgba(7,17,31,0.98))]" />
      <div className="absolute right-4 top-4 z-20 md:right-6 md:top-6">
        <ThemeToggle />
      </div>
      <div className="relative min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
