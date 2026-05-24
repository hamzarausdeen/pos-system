import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowUpRight, Boxes, DollarSign, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { dashboardApi } from '../../services/api';
import Loader from '../../components/Loader';
import StatCard from '../../components/StatCard';
import formatCurrency from '../../utils/formatCurrency';
import { toast } from 'react-toastify';

const palette = ['#2563eb', '#0ea5e9', '#38bdf8', '#60a5fa', '#818cf8', '#22d3ee'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await dashboardApi.summary();
        setData(response);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;

  const summary = data?.summary || {};
  const monthlyTrend = data?.monthlyTrend || [];
  const lowStockProducts = data?.lowStockProducts || [];
  const recentSales = data?.recentSales || [];

  const pieData = [
    { name: 'Revenue', value: Number(summary.monthlySales || 0) },
    { name: 'Profit', value: Number(summary.profitSummary || 0) }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total sales today" value={formatCurrency(Number(summary.totalSalesToday || 0))} icon={<DollarSign size={20} />} accent="from-sky-600 to-cyan-400" />
        <StatCard title="Monthly sales" value={formatCurrency(Number(summary.monthlySales || 0))} icon={<TrendingUp size={20} />} accent="from-sky-500 to-blue-400" />
        <StatCard title="Annual sales" value={formatCurrency(Number(summary.annualSales || 0))} icon={<ArrowUpRight size={20} />} accent="from-amber-500 to-orange-400" />
        <StatCard title="Total products" value={summary.totalProducts || 0} hint={`${summary.lowStockAlerts || 0} low stock alerts`} icon={<Boxes size={20} />} accent="from-blue-500 to-violet-400" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="glass-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="section-title">Sales trend</h2>
              <p className="text-sm theme-subtitle">Monthly revenue and profit overview</p>
            </div>
            <div className="chip bg-sky-100 theme-subtitle dark:bg-sky-500/15 dark:text-sky-300">
              <ShoppingBag size={14} className="mr-1" /> Live analytics
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="profit" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="section-title">Profit mix</h2>
              <p className="text-sm theme-subtitle">Revenue versus profit</p>
            </div>
            <DollarSign size={18} className="theme-accent" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="glass-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="section-title">Recent sales</h2>
              <p className="text-sm theme-subtitle">Latest completed bills and cashier activity</p>
            </div>
            <Package size={18} className="theme-accent" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-sky-100 dark:border-sky-900/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-sky-50 theme-subtitle dark:bg-sky-500/10 dark:text-sky-200">
                <tr>
                  <th className="px-4 py-3">Bill</th>
                  <th className="px-4 py-3">Cashier</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="border-t border-sky-100 dark:border-sky-900/40">
                    <td className="px-4 py-3 font-medium">{sale.billNumber}</td>
                    <td className="px-4 py-3">{sale.cashierName}</td>
                    <td className="px-4 py-3">{sale.itemsCount}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(Number(sale.totalAmount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-5">
              <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="section-title">Low stock alerts</h2>
                <p className="text-sm theme-subtitle">Stock below 10 units</p>
              </div>
              <AlertTriangle size={18} className="text-amber-500" />
            </div>
            <div className="space-y-3">
              {lowStockProducts.length ? lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 text-sm dark:bg-amber-500/10">
                  <div>
                    <p className="font-semibold">{product.productName}</p>
                    <p className="text-xs theme-subtitle">Code {product.productCode}</p>
                  </div>
                  <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">{product.quantity} left</span>
                </div>
              )) : <p className="text-sm theme-subtitle">No low stock products right now.</p>}
            </div>
          </div>

          <div className="glass-panel p-5">
            <h2 className="section-title">Sales performance</h2>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#2563eb" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
