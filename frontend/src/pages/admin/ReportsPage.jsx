import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { reportApi } from '../../services/api';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import formatCurrency from '../../utils/formatCurrency';
import { BarChart3, CalendarRange, Coins, Package, Sparkles } from 'lucide-react';

const tabs = [
  { key: 'daily', label: 'Daily', icon: CalendarRange },
  { key: 'monthly', label: 'Monthly', icon: BarChart3 },
  { key: 'annual', label: 'Annual', icon: Sparkles },
  { key: 'profit', label: 'Profit', icon: Coins },
  { key: 'stock', label: 'Stock', icon: Package },
  { key: 'best-selling', label: 'Best-selling', icon: BarChart3 }
];

const colors = ['#2563eb', '#0ea5e9', '#38bdf8', '#60a5fa', '#22d3ee'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  const [filters, setFilters] = useState({ date: new Date().toISOString().slice(0, 10), month: new Date().toISOString().slice(0, 7), year: new Date().getFullYear() });

  const loadReport = async (tab = activeTab) => {
    setLoading(true);
    try {
      let response;
      if (tab === 'daily') response = await reportApi.daily({ date: filters.date });
      if (tab === 'monthly') response = await reportApi.monthly({ month: filters.month });
      if (tab === 'annual') response = await reportApi.annual({ year: filters.year });
      if (tab === 'profit') response = await reportApi.profit();
      if (tab === 'stock') response = await reportApi.stock();
      if (tab === 'best-selling') response = await reportApi.bestSelling();
      setPayload(response);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const content = () => {
    if (activeTab === 'stock') {
      return (
        <div className="overflow-hidden rounded-2xl border border-sky-100 dark:border-sky-900/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-50 theme-subtitle dark:bg-sky-500/10 dark:text-sky-200">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Value</th>
              </tr>
            </thead>
            <tbody>
              {payload?.products?.map((item) => (
                <tr key={item.id} className="border-t border-sky-100 dark:border-sky-900/40">
                  <td className="px-4 py-3 font-medium">{item.productName}</td>
                  <td className="px-4 py-3">{item.categoryName}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">{formatCurrency(Number(item.stockValue))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'best-selling') {
      return (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-2xl border border-sky-100 dark:border-sky-900/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-sky-50 theme-subtitle dark:bg-sky-500/10 dark:text-sky-200">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Sold</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-4 py-3">Profit</th>
                </tr>
              </thead>
              <tbody>
                {payload?.products?.map((item) => (
                  <tr key={item.id} className="border-t border-sky-100 dark:border-sky-900/40">
                    <td className="px-4 py-3 font-medium">{item.productName}</td>
                    <td className="px-4 py-3">{item.totalSold}</td>
                    <td className="px-4 py-3">{formatCurrency(Number(item.revenue))}</td>
                    <td className="px-4 py-3">{formatCurrency(Number(item.profit))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="glass-panel p-4">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={payload?.products || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="productName" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalSold" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    const report = payload?.report || {};
    const chartData = [
      { name: 'Revenue', value: Number(report.totalRevenue || report.revenue || 0) },
      { name: 'Profit', value: Number(report.totalProfit || report.profit || 0) },
      { name: 'Items sold', value: Number(report.itemsSold || 0) },
      { name: 'Stock', value: Number(report.remainingStock || 0) }
    ];

    return (
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass-panel p-5"><p className="text-sm theme-subtitle">Total revenue</p><p className="metric-value mt-2">{formatCurrency(Number(report.totalRevenue || report.revenue || 0))}</p></div>
          <div className="glass-panel p-5"><p className="text-sm theme-subtitle">Total profit</p><p className="metric-value mt-2">{formatCurrency(Number(report.totalProfit || report.profit || 0))}</p></div>
          <div className="glass-panel p-5"><p className="text-sm theme-subtitle">Items sold</p><p className="metric-value mt-2">{Number(report.itemsSold || 0)}</p></div>
          <div className="glass-panel p-5"><p className="text-sm theme-subtitle">Remaining stock</p><p className="metric-value mt-2">{Number(report.remainingStock || 0)}</p></div>
        </div>
        <div className="glass-panel p-4">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={chartData} dataKey="value" innerRadius={70} outerRadius={110} paddingAngle={5}>
                {chartData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (loading) return <Loader label="Loading reports..." />;

  return (
    <div className="space-y-6">
      <div className="glass-panel flex flex-wrap gap-2 p-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${activeTab === tab.key ? 'bg-sky-600 text-white' : 'theme-subtitle hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-sky-500/10'}`}
              onClick={async () => {
                setActiveTab(tab.key);
                await loadReport(tab.key);
              }}
              type="button"
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {(activeTab === 'daily' || activeTab === 'monthly' || activeTab === 'annual') && (
        <div className="glass-panel flex flex-wrap items-end gap-4 p-5">
          {activeTab === 'daily' ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Date</span>
              <input className="input-base" type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
            </label>
          ) : null}
          {activeTab === 'monthly' ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Month</span>
              <input className="input-base" type="month" value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value })} />
            </label>
          ) : null}
          {activeTab === 'annual' ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Year</span>
              <input className="input-base" type="number" value={filters.year} onChange={(event) => setFilters({ ...filters, year: Number(event.target.value) })} />
            </label>
          ) : null}
          <button className="btn-primary" onClick={() => loadReport(activeTab)} type="button">Run Report</button>
        </div>
      )}

      <div className="glass-panel p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="section-title">{tabs.find((tab) => tab.key === activeTab)?.label} report</h2>
            <p className="text-sm theme-subtitle">Revenue, profit, items sold, and stock visibility</p>
          </div>
        </div>
        {content()}
      </div>
    </div>
  );
}
