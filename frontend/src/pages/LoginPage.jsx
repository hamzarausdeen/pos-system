import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [portalChoice, setPortalChoice] = useState('admin');
  const [form, setForm] = useState({ email: 'admin@grocery.com', password: 'Admin123!' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (portalChoice === 'admin') {
      setForm({ email: 'admin@grocery.com', password: 'Admin123!' });
    } else {
      setForm({ email: 'cashier@grocery.com', password: 'Cashier123!' });
    }
  }, [portalChoice]);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const user = await login(form.email.trim(), form.password);
      if (user.role === 'cashier') {
        navigate('/pos', { replace: true });
        return;
      }
      navigate(portalChoice === 'cashier' ? '/pos' : '/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to log in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-slate-800">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-sky-50">Sign in</h2>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium mb-2">Open portal as</span>
            <select
              className="input-base w-full"
              value={portalChoice}
              onChange={(e) => setPortalChoice(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="cashier">Cashier</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-2">Email</span>
            <input className="input-base w-full" type="email" value={form.email} readOnly required />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-2">Password</span>
            <div className="relative">
              <input
                className="input-base w-full pr-10"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                aria-label="Toggle password"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
