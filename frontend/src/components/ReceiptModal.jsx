import formatCurrency from '../utils/formatCurrency';

export default function ReceiptModal({ open, sale, onClose }) {
  if (!open || !sale) return null;

  const items = sale.items || sale.saleItems || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-panel w-full max-w-2xl overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-sky-100" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-dashed border-sky-200 px-6 py-5 dark:border-sky-900/50 print:border-sky-200">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-600 dark:text-sky-300">Grocery Shop POS</p>
            <h3 className="mt-2 text-2xl font-bold">Receipt</h3>
            <p className="mt-1 text-sm theme-subtitle">Bill #{sale.billNumber}</p>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="theme-subtitle">Date</p>
              <p className="font-semibold">{new Date(sale.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="theme-subtitle">Cashier</p>
              <p className="font-semibold">{sale.cashierName || sale.cashier?.fullName || 'Cashier'}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-sky-100 dark:border-sky-900/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-sky-50 theme-subtitle dark:bg-sky-500/10 dark:text-sky-200">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const code = item.productCode || item.product?.productCode || item.productId || '-';
                  const qty = Number(item.quantity || 0);
                  const unitPrice = Number(item.sellingPrice ?? item.unitPrice ?? item.price ?? 0);
                  const lineTotal = Number(item.subtotal ?? (qty * unitPrice));
                  return (
                    <tr key={`${item.productId || item.id}-${item.productName}`} className="border-t border-sky-100 dark:border-sky-900/40">
                      <td className="px-4 py-3 font-mono text-sm">{code}</td>
                      <td className="px-4 py-3 font-medium">{item.productName}</td>
                      <td className="px-4 py-3">{qty % 1 !== 0 ? `${Math.round(qty * 100)} g` : qty}</td>
                          <td className="px-4 py-3">{formatCurrency(unitPrice)}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 rounded-2xl bg-sky-50 p-4 dark:bg-sky-500/10">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(Number(sale.totalAmount))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cash received</span>
              <span>{formatCurrency(Number(sale.cashReceived))}</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold">
              <span>Balance</span>
              <span>{formatCurrency(Number(sale.balance))}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="btn-primary print:hidden" onClick={() => window.print()} type="button">
              Print Receipt
            </button>
            <button className="btn-secondary print:hidden" onClick={onClose} type="button">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
