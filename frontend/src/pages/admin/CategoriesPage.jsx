import { useEffect, useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { categoryApi } from '../../services/api';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import { toast } from 'react-toastify';

const emptyForm = { categoryName: '' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadCategories = async () => {
    try {
      const response = await categoryApi.list();
      setCategories(response.categories || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({ categoryName: category.categoryName });
    setModalOpen(true);
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (editing) {
        await categoryApi.update(editing.id, form);
        toast.success('Category updated');
      } else {
        await categoryApi.create(form);
        toast.success('Category created');
      }
      setModalOpen(false);
      await loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (category) => {
    if (!window.confirm(`Delete category ${category.categoryName}?`)) return;
    try {
      await categoryApi.remove(category.id);
      toast.success('Category deleted');
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) return <Loader label="Loading categories..." />;

  return (
    <div className="space-y-6">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="section-title">Category Management</h2>
          <p className="mt-1 text-sm theme-subtitle">Add, edit, and remove grocery categories.</p>
        </div>
        <button className="btn-primary" onClick={openCreate} type="button">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-sky-50 theme-subtitle dark:bg-sky-500/10 dark:text-sky-200">
            <tr>
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Created</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-sky-100 dark:border-sky-900/40">
                <td className="px-5 py-4">{category.id}</td>
                <td className="px-5 py-4 font-medium">{category.categoryName}</td>
                <td className="px-5 py-4">{new Date(category.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="btn-secondary py-2" onClick={() => openEdit(category)} type="button">
                      <Edit2 size={14} /> Edit
                    </button>
                    <button className="btn-danger py-2" onClick={() => removeCategory(category)} type="button">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit Category' : 'Add Category'} onClose={() => setModalOpen(false)}>
        <form className="space-y-5" onSubmit={saveCategory}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Category name</span>
            <input
              className="input-base"
              value={form.categoryName}
              onChange={(event) => setForm({ categoryName: event.target.value })}
              placeholder="Drinks"
              required
            />
          </label>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setModalOpen(false)} type="button">Cancel</button>
            <button className="btn-primary" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save Category'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
