const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const getCategories = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const [rows] = await db.query(
    'SELECT id, category_name AS categoryName, created_at AS createdAt FROM categories WHERE category_name LIKE ? ORDER BY id ASC, category_name ASC',
    [`%${search}%`]
  );

  res.json({ categories: rows });
});

const createCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.body;

  if (!categoryName || !categoryName.trim()) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const [existing] = await db.query('SELECT id FROM categories WHERE category_name = ? LIMIT 1', [categoryName.trim()]);
  if (existing.length) {
    return res.status(409).json({ message: 'Category already exists' });
  }

  const [result] = await db.query('INSERT INTO categories (category_name) VALUES (?)', [categoryName.trim()]);
  res.status(201).json({ id: result.insertId, categoryName: categoryName.trim() });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { categoryName } = req.body;

  if (!categoryName || !categoryName.trim()) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const [existing] = await db.query('SELECT id FROM categories WHERE id = ?', [id]);
  if (!existing.length) {
    return res.status(404).json({ message: 'Category not found' });
  }

  await db.query('UPDATE categories SET category_name = ? WHERE id = ?', [categoryName.trim(), id]);
  res.json({ message: 'Category updated successfully' });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [products] = await db.query('SELECT id FROM products WHERE category_id = ? LIMIT 1', [id]);
  if (products.length) {
    return res.status(400).json({ message: 'Cannot delete a category with products' });
  }

  await db.query('DELETE FROM categories WHERE id = ?', [id]);
  res.json({ message: 'Category deleted successfully' });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
