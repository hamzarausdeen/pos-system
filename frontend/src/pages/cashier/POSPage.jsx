import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, ReceiptText, Search, ShoppingCart, Trash2, Edit2 } from 'lucide-react';
import { productApi, saleApi } from '../../services/api';
import Loader from '../../components/Loader';
import ReceiptModal from '../../components/ReceiptModal';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import formatCurrency from '../../utils/formatCurrency';

export default function POSPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [receiptSale, setReceiptSale] = useState(null);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.quantity * Number(item.sellingPrice), 0), [cart]);
  const balance = Number(cashReceived || 0) - subtotal;

  const searchProducts = async (value) => {
    setSearch(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await productApi.search(value.trim());
      setResults(response.products || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const formatStockDisplay = (product) => {
    if (product.priceType === 'per100g') {
      const kg = Number(product.quantity) / 10;
      return Number.isInteger(kg) ? `${kg} kg` : `${kg.toFixed(2).replace(/\.00$/, '')} kg`;
    }
    return `${product.quantity}`;
  };

  const addToCart = (product) => {
    // if product is per-100g priced, ask for grams; otherwise add a unit
    let quantityToAdd = 1;
    if (product.priceType === 'per100g') {
      const grams = window.prompt('Enter weight in grams (e.g. 250):', '100');
      if (!grams) return;
      const gramsNum = Number(grams);
      if (Number.isNaN(gramsNum) || gramsNum <= 0) return toast.error('Invalid weight');
      quantityToAdd = gramsNum / 100;
    }

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id && item.priceType === product.priceType);
      if (existing) {
        return current.map((item) => (item.id === product.id && item.priceType === product.priceType ? { ...item, quantity: item.quantity + quantityToAdd } : item));
      }
      return [...current, { ...product, quantity: quantityToAdd }];
    });
    toast.success(`${product.productName} added to cart`);
  };

  const updateQuantity = (productId, delta) => {
    setCart((current) =>
      current
        .map((item) => (item.id === productId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setCart((current) => current.filter((item) => item.id !== productId));
  };

  const editCartItem = (productId) => {
    setCart((current) =>
      current.map((item) => {
        if (item.id !== productId) return item;

        if (item.priceType === 'per100g') {
          const grams = window.prompt('Enter weight in grams (e.g. 250):', String(Number(item.quantity) * 100));
          if (!grams) return item;
          const gramsNum = Number(grams);
          if (Number.isNaN(gramsNum) || gramsNum <= 0) {
            toast.error('Invalid weight');
            return item;
          }
          return { ...item, quantity: gramsNum / 100 };
        }

        const units = window.prompt('Enter quantity in units:', String(item.quantity));
        if (!units) return item;
        const unitsNum = Number(units);
        if (Number.isNaN(unitsNum) || unitsNum <= 0) {
          toast.error('Invalid quantity');
          return item;
        }
        return { ...item, quantity: unitsNum };
      })
    );
  };

  const checkout = async () => {
    if (!cart.length) return toast.error('Cart is empty');
    if (Number(cashReceived) < subtotal) return toast.error('Cash received is less than the total');

    setCheckoutLoading(true);
    try {
      const response = await saleApi.create({
        items: cart.map((item) => ({ productId: item.id, quantity: item.quantity, sellingPrice: Number(item.sellingPrice), priceType: item.priceType || 'unit' })),
        cashReceived: Number(cashReceived)
      });
      setReceiptSale({ ...response.sale, cashierName: user?.fullName });
      setCart([]);
      setCashReceived('');
      setSearch('');
      setResults([]);
      toast.success('Sale completed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sale failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <div className="glass-panel p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-600/10 p-3 theme-accent"><ShoppingCart size={22} /></div>
            <div>
              <h2 className="section-title">Cashier POS</h2>
              <p className="text-sm theme-subtitle">Search by product name or code, then build the bill instantly.</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5">
            <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 theme-accent" size={16} />
            <input
              className="input-base pl-11 text-base"
              value={search}
              onChange={(event) => searchProducts(event.target.value)}
              placeholder="Search products by name or code"
            />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {loading ? <Loader label="Searching products..." /> : results.map((product) => (
              <button key={product.id} className="rounded-3xl border border-sky-100 bg-white p-4 text-left transition hover:-translate-y-1 hover:shadow-lg dark:border-sky-900/40 dark:bg-slate-950" onClick={() => addToCart(product)} type="button">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{product.productName}</p>
                    <p className="mt-1 text-xs theme-subtitle">Code {product.productCode}</p>
                  </div>
                  <span className="chip bg-sky-100 theme-subtitle dark:bg-sky-500/15 dark:text-sky-200">{formatStockDisplay(product)} stock</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm theme-subtitle">Sell price</span>
                  <span className="text-lg font-bold theme-accent">{product.priceType === 'per100g' ? `${formatCurrency(Number(product.sellingPrice))} /100g` : formatCurrency(Number(product.sellingPrice))}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-panel p-5">
            <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="section-title">Cart</h2>
              <p className="text-sm theme-subtitle">{cart.length} item(s) in the current bill</p>
            </div>
            <ReceiptText size={18} className="theme-accent" />
          </div>

          <div className="space-y-3">
            {cart.length ? cart.map((item) => (
              <div key={item.id} className="rounded-3xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-900/40 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-xs theme-subtitle">{item.priceType === 'per100g' ? `100g ${formatCurrency(Number(item.sellingPrice))}` : `Unit ${formatCurrency(Number(item.sellingPrice))}`}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-full p-2 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-700/10" onClick={() => editCartItem(item.id)} type="button">
                      <Edit2 size={16} />
                    </button>
                    <button className="rounded-full p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10" onClick={() => removeItem(item.id)} type="button">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <button className="btn-secondary h-10 w-10 p-0" onClick={() => updateQuantity(item.id, -1)} type="button"><Minus size={16} /></button>
                    <span className="min-w-10 text-center font-bold">
                      {item.priceType === 'per100g' ? `${(Number(item.quantity) / 10).toFixed(2).replace(/\.00$/, '')} kg` : item.quantity}
                    </span>
                    <button className="btn-secondary h-10 w-10 p-0" onClick={() => updateQuantity(item.id, 1)} type="button"><Plus size={16} /></button>
                  </div>
                  <span className="text-lg font-bold">{formatCurrency(item.quantity * Number(item.sellingPrice))}</span>
                </div>
              </div>
            )) : <p className="rounded-3xl border border-dashed border-sky-300 px-4 py-10 text-center text-sm theme-subtitle dark:border-sky-800">No items added yet.</p>}
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Cash received</span>
              <input className="input-base text-lg font-semibold" type="number" min="0" step="0.01" value={cashReceived} onChange={(event) => setCashReceived(event.target.value)} placeholder="0.00" />
            </label>
            <div className="flex items-center justify-between rounded-2xl bg-sky-900 px-4 py-4 text-white dark:bg-sky-600">
              <span className="text-sm font-medium">Balance</span>
              <span className="text-2xl font-bold">{formatCurrency(balance)}</span>
            </div>
          </div>
          <button className="btn-primary mt-4 w-full py-4 text-lg" disabled={checkoutLoading} onClick={checkout} type="button">
            {checkoutLoading ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </div>

      <ReceiptModal open={Boolean(receiptSale)} sale={receiptSale} onClose={() => setReceiptSale(null)} />
    </div>
  );
}
