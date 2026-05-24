import { useEffect, useState } from 'react';
import { AlertTriangle, Clock3, Package2 } from 'lucide-react';
import { inventoryApi } from '../../services/api';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';

export default function InventoryPage() {
  const [lowStock, setLowStock] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState({ page: 1, totalPages: 1, total: 0 });

  const loadData = async (page = 1) => {
    try {
      const [lowStockResponse, historyResponse] = await Promise.all([
        inventoryApi.lowStock(),
        inventoryApi.history({ page, limit: 20 })
      ]);
      setLowStock(lowStockResponse.products || []);
      setHistory(historyResponse.history || []);
      setPageData(historyResponse.pagination || pageData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loader label="Loading inventory..." />;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="section-title">Low Stock Alerts</h2>
              <p className="text-sm theme-subtitle">Items with quantity below 10</p>
            </div>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="space-y-3">
            {lowStock.length ? lowStock.map((item) => (
              <div key={item.id} className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-500/20 dark:bg-sky-500/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-xs theme-subtitle">Code {item.productCode} • {item.categoryName}</p>
                  </div>
                  <span className="chip bg-amber-500 text-white">{item.quantity} left</span>
                </div>
              </div>
            )) : <p className="text-sm theme-subtitle">No products are below the low-stock threshold.</p>}
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="section-title">Inventory History</h2>
              <p className="text-sm theme-subtitle">Track stock reductions and manual adjustments</p>
            </div>
            <Clock3 size={18} className="theme-accent" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-sky-100 dark:border-sky-900/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-sky-50 theme-subtitle dark:bg-sky-500/10 dark:text-sky-200">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Change</th>
                  <th className="px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id} className="border-t border-sky-100 dark:border-sky-900/40">
                    <td className="px-4 py-3">
                      <p className="font-medium">{entry.productName}</p>
                      <p className="text-xs theme-subtitle">{entry.productCode}</p>
                    </td>
                    <td className="px-4 py-3 uppercase">{entry.type}</td>
                    <td className="px-4 py-3 font-semibold">{entry.quantityChange}</td>
                    <td className="px-4 py-3">{entry.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm theme-subtitle">
            <span>Total history records: {pageData.total}</span>
            <div className="flex gap-2">
              <button className="btn-secondary py-2" disabled={pageData.page <= 1} onClick={() => loadData(pageData.page - 1)} type="button">Prev</button>
              <button className="btn-secondary py-2" disabled={pageData.page >= pageData.totalPages} onClick={() => loadData(pageData.page + 1)} type="button">Next</button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-5">
            <div className="mb-4 flex items-center gap-3">
          <Package2 size={18} className="theme-accent" />
          <div>
            <h2 className="section-title">Inventory Rule</h2>
            <p className="text-sm theme-subtitle">Stock is automatically reduced on every completed sale.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
