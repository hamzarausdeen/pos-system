import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Topbar from '../components/Topbar';

export default function CashierLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`page-shell min-h-screen p-4 md:p-6 ${user?.role === 'cashier' ? 'role-cashier' : user?.role === 'admin' ? 'role-admin' : ''}`}>
      <div className="mx-auto max-w-[1600px] space-y-6">
        <Topbar
          title="Cashier POS"
          subtitle="Fast checkout flow with live cart totals and printable receipts"
          user={user}
          onLogout={handleLogout}
        />
        <Outlet />
      </div>
    </div>
  );
}
