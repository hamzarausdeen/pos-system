const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const createBillNumber = () => `BILL-${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}-${Math.floor(Math.random() * 9000 + 1000)}`;

const createSale = asyncHandler(async (req, res) => {
  const { items = [], cashReceived } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart items are required' });
  }

  const cash = Number(cashReceived);
  if (Number.isNaN(cash) || cash < 0) {
    return res.status(400).json({ message: 'Cash received must be a valid amount' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let subtotal = 0;
    let profit = 0;
    const saleItems = [];

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (!productId || Number.isNaN(quantity) || quantity <= 0) {
        throw new Error('Each cart item must have a valid product and quantity');
      }

      const [productRows] = await connection.query(
        'SELECT id, product_name, buying_price, selling_price, quantity FROM products WHERE id = ? LIMIT 1 FOR UPDATE',
        [productId]
      );
      const product = productRows[0];

      if (!product) {
        throw new Error('One of the selected products was not found');
      }

      if (product.quantity < quantity) {
        throw new Error(`Insufficient stock for ${product.product_name}`);
      }

      const effectiveSelling = item.sellingPrice !== undefined ? Number(item.sellingPrice) : Number(product.selling_price);
      const effectiveBuying = Number(product.buying_price);
      const lineSubtotal = effectiveSelling * quantity;
      const lineProfit = (effectiveSelling - effectiveBuying) * quantity;

      subtotal += lineSubtotal;
      profit += lineProfit;

      saleItems.push({
        productId: product.id,
        quantity,
        sellingPrice: effectiveSelling,
        buyingPrice: effectiveBuying,
        subtotal: lineSubtotal,
        profit: lineProfit
      });
    }

    const balance = cash - subtotal;
    if (balance < 0) {
      throw new Error('Cash received is less than the grand total');
    }

    const billNumber = createBillNumber();
    const [saleResult] = await connection.query(
      `INSERT INTO sales (bill_number, total_amount, cash_received, balance, subtotal, profit, cashier_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [billNumber, subtotal, cash, balance, subtotal, profit, req.user.id]
    );

    for (const item of saleItems) {
      await connection.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, selling_price, buying_price, subtotal, profit)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [saleResult.insertId, item.productId, item.quantity, item.sellingPrice, item.buyingPrice, item.subtotal, item.profit]
      );

      await connection.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [item.quantity, item.productId]);
      await connection.query(
        'INSERT INTO stock_history (product_id, type, quantity_change, reference_type, reference_id, note) VALUES (?, ?, ?, ?, ?, ?)',
        [item.productId, 'sale', -item.quantity, 'sale', saleResult.insertId, 'Stock reduced after sale']
      );
    }

    await connection.commit();

    // fetch the inserted sale items with product details so client receipts have productName and productCode
    const [insertedItems] = await connection.query(
      `SELECT si.quantity, si.selling_price AS sellingPrice, si.buying_price AS buyingPrice, si.subtotal, p.product_name AS productName, p.product_code AS productCode, p.id AS productId
       FROM sale_items si
       INNER JOIN products p ON p.id = si.product_id
       WHERE si.sale_id = ?`,
      [saleResult.insertId]
    );

    res.status(201).json({
      message: 'Sale completed successfully',
      sale: {
        id: saleResult.insertId,
        billNumber,
        totalAmount: subtotal,
        cashReceived: cash,
        balance,
        profit,
        cashierId: req.user.id,
        createdAt: new Date().toISOString(),
        items: insertedItems
      }
    });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ message: error.message });
  } finally {
    connection.release();
  }
});

const getSales = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const cashierFilter = req.user.role === 'admin' ? '' : 'WHERE s.cashier_id = ?';

  const countQuery = `SELECT COUNT(*) AS total FROM sales s ${cashierFilter}`;
  const dataQuery = `
    SELECT
      s.id,
      s.bill_number AS billNumber,
      s.total_amount AS totalAmount,
      s.cash_received AS cashReceived,
      s.balance,
      s.subtotal,
      s.profit,
      s.created_at AS createdAt,
      u.full_name AS cashierName
    FROM sales s
    INNER JOIN users u ON u.id = s.cashier_id
    ${cashierFilter}
    ORDER BY s.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countParams = req.user.role === 'admin' ? [] : [req.user.id];
  const dataParams = req.user.role === 'admin' ? [Number(limit), offset] : [req.user.id, Number(limit), offset];

  const [countRows] = await db.query(countQuery, countParams);
  const [rows] = await db.query(dataQuery, dataParams);

  res.json({
    sales: rows,
    pagination: {
      total: countRows[0].total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(countRows[0].total / Number(limit))
    }
  });
});

const getSaleById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [saleRows] = await db.query(
    `SELECT s.id, s.bill_number AS billNumber, s.total_amount AS totalAmount, s.cash_received AS cashReceived, s.balance, s.subtotal, s.profit, s.created_at AS createdAt, u.full_name AS cashierName
     FROM sales s
     INNER JOIN users u ON u.id = s.cashier_id
     WHERE s.id = ? LIMIT 1`,
    [id]
  );

  if (!saleRows.length) {
    return res.status(404).json({ message: 'Sale not found' });
  }

  const [items] = await db.query(
    `SELECT si.quantity, si.selling_price AS sellingPrice, si.buying_price AS buyingPrice, si.subtotal, p.product_name AS productName, p.product_code AS productCode
     FROM sale_items si
     INNER JOIN products p ON p.id = si.product_id
     WHERE si.sale_id = ?`,
    [id]
  );

  res.json({ sale: { ...saleRows[0], items } });
});

module.exports = {
  createSale,
  getSales,
  getSaleById
};
