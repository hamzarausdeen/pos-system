const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const [summaryRows] = await db.query(
    `SELECT
      COALESCE((SELECT SUM(total_amount) FROM sales WHERE DATE(created_at) = CURDATE()), 0) AS totalSalesToday,
      COALESCE((SELECT SUM(total_amount) FROM sales WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())), 0) AS monthlySales,
      COALESCE((SELECT SUM(total_amount) FROM sales WHERE YEAR(created_at) = YEAR(CURDATE())), 0) AS annualSales,
      COALESCE((SELECT COUNT(*) FROM products), 0) AS totalProducts,
      COALESCE((SELECT COUNT(*) FROM products WHERE quantity < 10), 0) AS lowStockAlerts,
      COALESCE((SELECT SUM(profit) FROM sales), 0) AS profitSummary,
      COALESCE((SELECT SUM(quantity) FROM products), 0) AS totalItemsInStock`
  );

  const [recentSales] = await db.query(
    `SELECT
      s.id,
      s.bill_number AS billNumber,
      s.total_amount AS totalAmount,
      s.created_at AS createdAt,
      u.full_name AS cashierName,
      COUNT(si.id) AS itemsCount
     FROM sales s
     INNER JOIN users u ON u.id = s.cashier_id
     LEFT JOIN sale_items si ON si.sale_id = s.id
     GROUP BY s.id
     ORDER BY s.created_at DESC
     LIMIT 8`
  );

  const [monthlyTrend] = await db.query(
    `SELECT
      DATE_FORMAT(created_at, '%Y-%m') AS month,
      COALESCE(SUM(total_amount), 0) AS sales,
      COALESCE(SUM(profit), 0) AS profit
     FROM sales
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')
     ORDER BY month ASC`
  );

  const [lowStockProducts] = await db.query(
    `SELECT id, product_code AS productCode, product_name AS productName, quantity
     FROM products
     WHERE quantity < 10
     ORDER BY quantity ASC, product_name ASC
     LIMIT 10`
  );

  res.json({
    summary: summaryRows[0],
    recentSales,
    monthlyTrend,
    lowStockProducts
  });
});

module.exports = {
  getDashboardSummary
};
