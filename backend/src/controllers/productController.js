const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const validateProductPayload = (payload, requireAll = true) => {
  const errors = [];
  const hasCode = payload.productCode !== undefined;
  const hasName = payload.productName !== undefined;
  const hasCategory = payload.categoryId !== undefined;
  const hasBuying = payload.buyingPrice !== undefined;
  const hasSelling = payload.sellingPrice !== undefined;
  const hasQuantity = payload.quantity !== undefined;
  const hasPriceType = payload.priceType !== undefined;

  if ((requireAll || hasCode) && (!payload.productCode || !/^\d+$/.test(String(payload.productCode)))) {
    errors.push('Product code must contain numbers only');
  }

  if ((requireAll || hasName) && !payload.productName?.trim()) {
    errors.push('Product name is required');
  }

  if ((requireAll || hasCategory) && !payload.categoryId) {
    errors.push('Category is required');
  }

  const buyingPrice = Number(payload.buyingPrice);
  const sellingPrice = Number(payload.sellingPrice);
  const quantity = Number(payload.quantity);
  const priceType = payload.priceType;

  if ((requireAll || hasBuying) && Number.isNaN(buyingPrice)) {
    errors.push('Buying price must be a valid number');
  }

  if ((requireAll || hasSelling) && Number.isNaN(sellingPrice)) {
    errors.push('Selling price must be a valid number');
  }

  if ((requireAll || hasQuantity) && (Number.isNaN(quantity) || quantity < 0)) {
    errors.push('Quantity cannot be negative');
  }

  if ((requireAll || hasPriceType) && priceType !== undefined && !['unit', 'per100g'].includes(priceType)) {
    errors.push('Invalid price type');
  }

  if (!Number.isNaN(buyingPrice) && !Number.isNaN(sellingPrice) && sellingPrice < buyingPrice) {
    errors.push('Selling price cannot be lower than buying price');
  }

  return errors;
};

const buildProductQuery = () => `
  SELECT
    p.id,
    p.product_code AS productCode,
    p.product_name AS productName,
    p.category_id AS categoryId,
    c.category_name AS categoryName,
    p.buying_price AS buyingPrice,
    p.selling_price AS sellingPrice,
    p.price_type AS priceType,
    p.quantity,
    p.created_at AS createdAt,
    p.updated_at AS updatedAt
  FROM products p
  INNER JOIN categories c ON c.id = p.category_id
`;

const getProducts = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const searchTerm = `%${search}%`;
  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM products WHERE is_archived = 0 AND (product_name LIKE ? OR product_code LIKE ?)`,
    [searchTerm, searchTerm]
  );

  const rowsSql = `${buildProductQuery()} WHERE p.is_archived = 0 AND (p.product_name LIKE ? OR p.product_code LIKE ?) ORDER BY CAST(p.product_code AS UNSIGNED) ASC, p.id ASC LIMIT ? OFFSET ?`;

  const [rows] = await db.query(rowsSql, [searchTerm, searchTerm, Number(limit), offset]);

  res.json({
    products: rows,
    pagination: {
      total: countRows[0].total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(countRows[0].total / Number(limit))
    }
  });
});

const searchProducts = asyncHandler(async (req, res) => {
  const { query = '' } = req.query;
  const rowsSql = `${buildProductQuery()} WHERE p.is_archived = 0 AND (p.product_name LIKE ? OR p.product_code LIKE ?) ORDER BY CAST(p.product_code AS UNSIGNED) ASC, p.id ASC LIMIT 20`;

  const [rows] = await db.query(rowsSql, [`%${query}%`, `%${query}%`]);

  res.json({ products: rows });
});

const createProduct = asyncHandler(async (req, res) => {
  const errors = validateProductPayload(req.body, true);
  if (errors.length) {
    return res.status(400).json({ message: errors[0] });
  }

  const { productCode, productName, categoryId, buyingPrice, sellingPrice, quantity, priceType } = req.body;

  const [existing] = await db.query('SELECT id FROM products WHERE product_code = ? LIMIT 1', [String(productCode)]);
  if (existing.length) {
    return res.status(409).json({ message: 'Product code already exists' });
  }

  const [category] = await db.query('SELECT id FROM categories WHERE id = ? LIMIT 1', [categoryId]);
  if (!category.length) {
    return res.status(404).json({ message: 'Category not found' });
  }

  const [result] = await db.query(
    `INSERT INTO products (product_code, product_name, category_id, price_type, buying_price, selling_price, quantity)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [String(productCode), productName.trim(), categoryId, priceType || 'unit', buyingPrice, sellingPrice, quantity]
  );

  res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
});

const updateProduct = asyncHandler(async (req, res) => {
  const errors = validateProductPayload(req.body, false);
  if (errors.length) {
    return res.status(400).json({ message: errors[0] });
  }

  const { id } = req.params;
  const [productRows] = await db.query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
  const product = productRows[0];

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const updatedProductCode = req.body.productCode !== undefined ? String(req.body.productCode) : product.product_code;
  const updatedProductName = req.body.productName !== undefined ? req.body.productName.trim() : product.product_name;
  const updatedCategoryId = req.body.categoryId !== undefined ? req.body.categoryId : product.category_id;
  const updatedBuyingPrice = req.body.buyingPrice !== undefined ? Number(req.body.buyingPrice) : Number(product.buying_price);
  const updatedSellingPrice = req.body.sellingPrice !== undefined ? Number(req.body.sellingPrice) : Number(product.selling_price);
  const updatedQuantity = req.body.quantity !== undefined ? Number(req.body.quantity) : Number(product.quantity);
  const updatedPriceType = req.body.priceType !== undefined ? req.body.priceType : product.price_type || 'unit';

  if (!/^\d+$/.test(updatedProductCode)) {
    return res.status(400).json({ message: 'Product code must contain numbers only' });
  }

  if (updatedSellingPrice < updatedBuyingPrice) {
    return res.status(400).json({ message: 'Selling price cannot be lower than buying price' });
  }

  if (updatedQuantity < 0) {
    return res.status(400).json({ message: 'Quantity cannot be negative' });
  }

  const [codeCheck] = await db.query('SELECT id FROM products WHERE product_code = ? AND id <> ? LIMIT 1', [updatedProductCode, id]);
  if (codeCheck.length) {
    return res.status(409).json({ message: 'Product code already exists' });
  }

  const [category] = await db.query('SELECT id FROM categories WHERE id = ? LIMIT 1', [updatedCategoryId]);
  if (!category.length) {
    return res.status(404).json({ message: 'Category not found' });
  }

  await db.query(
    `UPDATE products
     SET product_code = ?, product_name = ?, category_id = ?, price_type = ?, buying_price = ?, selling_price = ?, quantity = ?
     WHERE id = ?`,
    [updatedProductCode, updatedProductName, updatedCategoryId, updatedPriceType, updatedBuyingPrice, updatedSellingPrice, updatedQuantity, id]
  );

  res.json({ message: 'Product updated successfully' });
});

const updateStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quantity = Number(req.body.quantity);

  if (Number.isNaN(quantity) || quantity < 0) {
    return res.status(400).json({ message: 'Quantity cannot be negative' });
  }

  const [productRows] = await db.query('SELECT id, quantity FROM products WHERE id = ? LIMIT 1', [id]);
  if (!productRows.length) {
    return res.status(404).json({ message: 'Product not found' });
  }

  await db.query('UPDATE products SET quantity = ? WHERE id = ?', [quantity, id]);
  await db.query(
    'INSERT INTO stock_history (product_id, type, quantity_change, reference_type, reference_id, note) VALUES (?, ?, ?, ?, ?, ?)',
    [id, 'adjustment', quantity - productRows[0].quantity, 'manual', null, 'Manual stock update']
  );

  res.json({ message: 'Stock updated successfully' });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Prevent deleting products that are referenced in sale_items
  const [saleRefs] = await db.query('SELECT COUNT(*) AS total FROM sale_items WHERE product_id = ?', [id]);
  if (saleRefs[0].total > 0) {
    return res.status(400).json({ message: 'Cannot delete product with existing sales. Consider archiving or disabling the product instead.' });
  }

  await db.query('DELETE FROM products WHERE id = ?', [id]);
  res.json({ message: 'Product deleted successfully' });
});


module.exports = {
  getProducts,
  searchProducts,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  
};
