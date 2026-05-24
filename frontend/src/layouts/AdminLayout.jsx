import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`page-shell lg:flex ${user?.role === 'admin' ? 'role-admin' : ''}`}>
      <Sidebar role={user?.role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <Topbar
            title="Admin Dashboard"
            subtitle="Control categories, inventory, sales, and analytics from one place"
            user={user}
            onMenuClick={() => setSidebarOpen(true)}
            onLogout={handleLogout}
          />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
