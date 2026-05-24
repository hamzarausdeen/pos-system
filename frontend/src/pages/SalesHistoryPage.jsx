import { useEffect, useState } from 'react';
import { saleApi } from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import formatCurrency from '../utils/formatCurrency';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState({ page: 1, totalPages: 1, total: 0 });

  const loadSales = async (page = 1) => {
    try {
      const response = await saleApi.list({ page, limit: 10 });
      setSales(response.sales || []);
      setPageData(response.pagination || pageData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load sales history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  if (loading) return <Loader label="Loading sales history..." />;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5">
        <h2 className="section-title">Sales History</h2>
        <p className="mt-1 text-sm theme-subtitle">View saved bills and transaction totals.</p>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-sky-50 theme-subtitle dark:bg-sky-500/10 dark:text-sky-200">
            <tr>
              <th className="px-5 py-4">Bill</th>
              <th className="px-5 py-4">Cashier</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Balance</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-t border-sky-100 dark:border-sky-900/40">
                <td className="px-5 py-4 font-semibold">{sale.billNumber}</td>
                <td className="px-5 py-4">{sale.cashierName}</td>
                <td className="px-5 py-4">{new Date(sale.createdAt).toLocaleString()}</td>
                <td className="px-5 py-4">{formatCurrency(Number(sale.totalAmount))}</td>
                <td className="px-5 py-4">{formatCurrency(Number(sale.balance))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-panel flex items-center justify-between gap-3 p-5 text-sm theme-subtitle">
        <span>Total sales: {pageData.total}</span>
        <div className="flex gap-2">
          <button className="btn-secondary py-2" disabled={pageData.page <= 1} onClick={() => loadSales(pageData.page - 1)} type="button">Prev</button>
          <button className="btn-secondary py-2" disabled={pageData.page >= pageData.totalPages} onClick={() => loadSales(pageData.page + 1)} type="button">Next</button>
        </div>
      </div>
    </div>
  );
}
