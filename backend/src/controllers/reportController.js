const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const getDateRange = (type, value) => {
  if (type === 'daily') {
    return { start: `${value} 00:00:00`, end: `${value} 23:59:59` };
  }

  if (type === 'monthly') {
    const [year, month] = value.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return { start, end };
  }

  if (type === 'annual') {
    const year = Number(value);
    return {
      start: `${year}-01-01 00:00:00`,
      end: `${year}-12-31 23:59:59`
    };
  }

  return null;
};

const buildReport = async (range) => {
  const [summaryRows] = await db.query(
    `SELECT
      COALESCE(SUM(total_amount), 0) AS totalRevenue,
      COALESCE(SUM(profit), 0) AS totalProfit,
      COALESCE(COUNT(*), 0) AS totalSales,
      COALESCE(SUM(subtotal), 0) AS itemsValue
     FROM sales
     WHERE created_at BETWEEN ? AND ?`,
    [range.start, range.end]
  );

  const [itemsRows] = await db.query(
    `SELECT COALESCE(SUM(si.quantity), 0) AS itemsSold
     FROM sale_items si
     INNER JOIN sales s ON s.id = si.sale_id
     WHERE s.created_at BETWEEN ? AND ?`,
    [range.start, range.end]
  );

  const [stockRows] = await db.query(
    `SELECT COALESCE(SUM(quantity), 0) AS remainingStock
     FROM products`);

  return {
    totalRevenue: Number(summaryRows[0].totalRevenue),
    totalProfit: Number(summaryRows[0].totalProfit),
    totalSales: Number(summaryRows[0].totalSales),
    itemsSold: Number(itemsRows[0].itemsSold),
    remainingStock: Number(stockRows[0].remainingStock)
  };
};

const dailyReport = asyncHandler(async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const report = await buildReport(getDateRange('daily', date));
  res.json({ report, date });
});

const monthlyReport = asyncHandler(async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const report = await buildReport(getDateRange('monthly', month));
  res.json({ report, month });
});

const annualReport = asyncHandler(async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const report = await buildReport(getDateRange('annual', year));
  res.json({ report, year: Number(year) });
});

const profitReport = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT
      COALESCE(SUM(total_amount), 0) AS revenue,
      COALESCE(SUM(profit), 0) AS profit,
      COALESCE(SUM(total_amount - profit), 0) AS cost
     FROM sales`
  );

  res.json({ report: rows[0] });
});

const stockReport = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT
      p.id,
      p.product_code AS productCode,
      p.product_name AS productName,
      c.category_name AS categoryName,
      p.quantity,
      p.selling_price AS sellingPrice,
      p.buying_price AS buyingPrice,
      (p.quantity * p.selling_price) AS stockValue,
      (p.quantity < 10) AS lowStock
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     ORDER BY p.quantity ASC, p.product_name ASC`
  );

  res.json({ products: rows });
});

const bestSellingProducts = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT
      p.id,
      p.product_code AS productCode,
      p.product_name AS productName,
      SUM(si.quantity) AS totalSold,
      SUM(si.subtotal) AS revenue,
      SUM(si.profit) AS profit
     FROM sale_items si
     INNER JOIN products p ON p.id = si.product_id
     GROUP BY p.id
     ORDER BY totalSold DESC
     LIMIT 10`
  );

  res.json({ products: rows });
});

module.exports = {
  dailyReport,
  monthlyReport,
  annualReport,
  profitReport,
  stockReport,
  bestSellingProducts
};
