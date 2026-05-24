const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const getLowStockProducts = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT
      p.id,
      p.product_code AS productCode,
      p.product_name AS productName,
      c.category_name AS categoryName,
      p.quantity,
      p.selling_price AS sellingPrice,
      p.buying_price AS buyingPrice,
      p.created_at AS createdAt
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     WHERE p.quantity < 10
     ORDER BY p.quantity ASC, p.product_name ASC`
  );

  res.json({ products: rows });
});

const getStockHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const [countRows] = await db.query('SELECT COUNT(*) AS total FROM stock_history');
  const [rows] = await db.query(
    `SELECT
      sh.id,
      sh.type,
      sh.quantity_change AS quantityChange,
      sh.reference_type AS referenceType,
      sh.reference_id AS referenceId,
      sh.note,
      sh.created_at AS createdAt,
      p.product_name AS productName,
      p.product_code AS productCode
     FROM stock_history sh
     INNER JOIN products p ON p.id = sh.product_id
     ORDER BY sh.created_at DESC
     LIMIT ? OFFSET ?`,
    [Number(limit), offset]
  );

  res.json({
    history: rows,
    pagination: {
      total: countRows[0].total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(countRows[0].total / Number(limit))
    }
  });
});

module.exports = {
  getLowStockProducts,
  getStockHistory
};
