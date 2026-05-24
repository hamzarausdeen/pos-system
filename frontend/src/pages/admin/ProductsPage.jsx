import { useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { categoryApi, productApi } from '../../services/api';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import { toast } from 'react-toastify';
import formatCurrency from '../../utils/formatCurrency';

const emptyForm = {
  productCode: '',
  productName: '',
  categoryId: '',
  buyingPrice: '',
  sellingPrice: '',
  priceType: 'unit',
  quantity: ''
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [pageData, setPageData] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [stockQuantity, setStockQuantity] = useState('');

  const loadCategories = async () => {
    const response = await categoryApi.list();
    setCategories(response.categories || []);
  };

  const loadProducts = async (page = 1, currentSearch = search) => {
    setLoading(true);
    try {
      const params = { page, limit: 20, search: currentSearch };
      const response = await productApi.list(params);
      setProducts(response.products || []);
      setPageData(response.pagination || pageData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([loadCategories(), loadProducts()]);
      } catch (error) {
        toast.error('Unable to initialize products page');
      }
    })();
  }, []);

  const categoryOptions = useMemo(() => categories, [categories]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      productCode: product.productCode,
      productName: product.productName,
      categoryId: String(product.categoryId),
      buyingPrice: product.buyingPrice,
      sellingPrice: product.sellingPrice,
      priceType: product.priceType || 'unit',
      quantity: String(product.quantity)
    });
    setModalOpen(true);
  };

  const openStockModal = (product) => {
    setStockProduct(product);
    setStockQuantity(String(product.quantity ?? ''));
  };

  const formatStockDisplay = (product) => {
    if (product.priceType === 'per100g') {
      const kg = Number(product.quantity) / 10;
      const text = Number.isInteger(kg) ? `${kg}` : kg.toFixed(2).replace(/\.00$/, '');
      return `${text} kg`;
    }
    return `${product.quantity}`;
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      buyingPrice: Number(form.buyingPrice),
      sellingPrice: Number(form.sellingPrice),
      priceType: form.priceType || 'unit',
      quantity: Number(form.quantity)
    };

    try {
      if (editing) {
        await productApi.update(editing.id, payload);
        toast.success('Product updated');
      } else {
        await productApi.create(payload);
        toast.success('Product created');
      }
      setModalOpen(false);
      await loadProducts(pageData.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (product) => {
    if (!window.confirm(`Delete ${product.productName}? This will permanently remove the product.`)) return;
    try {
      await productApi.remove(product.id);
      toast.success('Product deleted');
      loadProducts(pageData.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const saveStock = async (event) => {
    event.preventDefault();
    try {
      await productApi.updateStock(stockProduct.id, { quantity: Number(stockQuantity) });
      toast.success('Stock updated');
      setStockProduct(null);
      loadProducts(pageData.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadProducts(1, search);
  };

  if (loading) return <Loader label="Loading products..." />;

  return (
    <div className="space-y-6">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="section-title">Product Management</h2>
          <p className="mt-1 text-sm theme-subtitle">Use numeric product codes, manage inventory, and keep pricing rules enforced.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-primary" onClick={openCreate} type="button">
            <Plus size={16} /> Add Product
          </button>
          
        </div>
      </div>

      <div className="glass-panel p-5">
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
            <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 theme-accent" size={16} />
            <input className="input-base pl-11" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or code" />
          </div>
          <button className="btn-secondary" type="submit">Search</button>
          <button className="btn-secondary" onClick={() => { setSearch(''); loadProducts(1, ''); }} type="button">
            <RefreshCw size={16} /> Reset
          </button>
        </form>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-sky-50 theme-subtitle dark:bg-sky-500/10 dark:text-sky-200">
              <tr>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Buying</th>
                <th className="px-5 py-4">Selling</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-sky-100 dark:border-sky-900/40">
                  <td className="px-5 py-4 font-semibold">{product.productCode}</td>
                  <td className="px-5 py-4">{product.productName}</td>
                  <td className="px-5 py-4">{product.categoryName}</td>
                  <td className="px-5 py-4">{formatCurrency(Number(product.buyingPrice))}</td>
                  <td className="px-5 py-4">{product.priceType === 'per100g' ? `${formatCurrency(Number(product.sellingPrice))} /100g` : formatCurrency(Number(product.sellingPrice))}</td>
                  <td className="px-5 py-4">
                    <span className={`chip ${product.quantity < 10 ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200' : 'bg-sky-100 theme-subtitle dark:bg-sky-500/15 dark:text-sky-200'}`}>
                      {formatStockDisplay(product)}
                    </span>
                  </td>
                  <td className="px-5 py-4">{new Date(product.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="btn-secondary py-2" onClick={() => openStockModal(product)} type="button">
                        Stock
                      </button>
                      <button className="btn-secondary py-2" onClick={() => openEdit(product)} type="button">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button className="btn-secondary py-2" onClick={() => removeProduct(product)} type="button">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 p-5 text-sm theme-subtitle">
        <span>Total records: {pageData.total}</span>
        <div className="flex gap-2">
          <button className="btn-secondary py-2" disabled={pageData.page <= 1} onClick={() => loadProducts(pageData.page - 1)} type="button">Prev</button>
          <button className="btn-secondary py-2" disabled={pageData.page >= pageData.totalPages} onClick={() => loadProducts(pageData.page + 1)} type="button">Next</button>
        </div>
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit Product' : 'Add Product'} onClose={() => setModalOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={saveProduct}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Product code</span>
            <input className="input-base" value={form.productCode} onChange={(event) => setForm({ ...form, productCode: event.target.value.replace(/\D/g, '') })} placeholder="1001" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Product name</span>
            <input className="input-base" value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} placeholder="Coca Cola" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Category</span>
            <select className="input-base" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required>
              <option value="">Select category</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>{category.categoryName}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Buying price</span>
            <input className="input-base" type="number" step="0.01" min="0" value={form.buyingPrice} onChange={(event) => setForm({ ...form, buyingPrice: event.target.value })} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Selling price</span>
            <input className="input-base" type="number" step="0.01" min="0" value={form.sellingPrice} onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Price type</span>
            <select className="input-base" value={form.priceType} onChange={(event) => setForm({ ...form, priceType: event.target.value })}>
              <option value="unit">Per unit</option>
              <option value="per100g">Per 100g</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Quantity {form.priceType === 'per100g' ? '(100g units)' : '(units)'}</span>
            <input
              className="input-base"
              type="number"
              step="0.01"
              min="0"
              value={form.quantity}
              onChange={(event) => setForm({ ...form, quantity: event.target.value })}
              placeholder={form.priceType === 'per100g' ? 'Enter number of 100g units (e.g. 10 = 1kg)' : 'Enter number of units'}
              required
            />
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setModalOpen(false)} type="button">Cancel</button>
            <button className="btn-primary" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save Product'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(stockProduct)} title={`Update Stock - ${stockProduct?.productName || ''}`} onClose={() => { setStockProduct(null); setStockQuantity(''); }}>
        <form className="space-y-4" onSubmit={saveStock}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Quantity</span>
            <input
              className="input-base"
              type="number"
              step="0.01"
              min="0"
              value={stockQuantity}
              onChange={(event) => setStockQuantity(event.target.value)}
              placeholder={stockProduct?.priceType === 'per100g' ? 'Enter number of 100g units (e.g. 10 = 1kg)' : 'Enter number of units'}
              required
            />
          </label>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => { setStockProduct(null); setStockQuantity(''); }} type="button">Cancel</button>
            <button className="btn-primary" type="submit">Update Stock</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
