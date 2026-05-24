import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Store, UserCircle2, Users2 } from 'lucide-react';
import { setupApi } from '../services/api';
import { toast } from 'react-toastify';

const defaultForm = {
  shopName: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  cashierName: '',
  cashierEmail: '',
  cashierPassword: ''
};

export default function SetupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSetup = async () => {
      try {
        const status = await setupApi.status();
        setForm({
          shopName: status.shopName || '',
          adminName: status.adminName || '',
          adminEmail: status.adminEmail || '',
          adminPassword: '',
          cashierName: status.cashierName || '',
          cashierEmail: status.cashierEmail || '',
          cashierPassword: ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load setup details');
      } finally {
        setLoading(false);
      }
    };

    loadSetup();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await setupApi.initialize(form);
      toast.success(response.message || 'Setup completed');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Setup failed');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 md:px-6">
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="glass-panel border-sky-100 bg-white/95 p-6 text-slate-900 shadow-2xl dark:bg-slate-950/80 dark:text-sky-100 md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
            <Store size={14} /> First-time setup
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight">Create or edit your grocery shop</h1>
          <p className="mt-4 text-sm leading-7 text-sky-700/70 dark:text-sky-200/70">
            Add the shop name and starter admin/cashier details, or edit the current ones with default values prefilled. Use exactly admin@grocery.com and cashier@grocery.com.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-3xl bg-sky-50 p-4 dark:bg-sky-500/10">
              <div className="flex items-center gap-3">
                <UserCircle2 className="text-sky-600 dark:text-sky-300" size={20} />
                <div>
                  <p className="font-semibold">Admin account</p>
                  <p className="text-sm text-sky-700/70 dark:text-sky-200/70">Full access to dashboard, inventory, and reports.</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-sky-50 p-4 dark:bg-sky-500/10">
              <div className="flex items-center gap-3">
                <Users2 className="text-sky-600 dark:text-sky-300" size={20} />
                <div>
                  <p className="font-semibold">Cashier account</p>
                  <p className="text-sm text-sky-700/70 dark:text-sky-200/70">Fast POS access for billing and receipts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel border-sky-100 bg-white/95 p-6 shadow-2xl dark:bg-slate-950/80 md:p-10">
          <h2 className="text-2xl font-bold tracking-tight">Shop setup</h2>
          <p className="mt-2 text-sm text-sky-700/70 dark:text-sky-200/70">Review and edit the shop and account details below.</p>

          <form className="mt-8 space-y-5" onSubmit={submit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Shop name</span>
              <input className="input-base" value={form.shopName} onChange={update('shopName')} placeholder="My Grocery Shop" required />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Admin name</span>
                <input className="input-base" value={form.adminName} onChange={update('adminName')} placeholder="Store Admin" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Admin email</span>
                <input className="input-base" type="email" value={form.adminEmail} onChange={update('adminEmail')} placeholder="admin@grocery.com" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Admin password</span>
                <input className="input-base" type="password" value={form.adminPassword} onChange={update('adminPassword')} placeholder="Leave blank to keep current password" />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Cashier name</span>
                <input className="input-base" value={form.cashierName} onChange={update('cashierName')} placeholder="Front Cashier" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Cashier email</span>
                <input className="input-base" type="email" value={form.cashierEmail} onChange={update('cashierEmail')} placeholder="cashier@grocery.com" required />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium">Cashier password</span>
                <input className="input-base" type="password" value={form.cashierPassword} onChange={update('cashierPassword')} placeholder="Leave blank to keep current password" />
              </label>
            </div>

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <button className="btn-primary w-full py-3.5 text-base" disabled={submitting || loading} type="submit">
              {submitting ? 'Saving setup...' : loading ? 'Loading setup...' : 'Save shop details'}
              {!submitting ? <ArrowRight size={18} /> : null}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}