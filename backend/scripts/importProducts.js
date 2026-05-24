const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');

const seedFile = path.join(__dirname, '..', 'data', 'products.json');

async function ensureCategory(name) {
  const [rows] = await db.query('SELECT id FROM categories WHERE category_name = ? LIMIT 1', [name]);
  if (rows.length) return rows[0].id;
  const [res] = await db.query('INSERT INTO categories (category_name) VALUES (?)', [name]);
  return res.insertId;
}

async function upsertProduct(p) {
  const [existing] = await db.query('SELECT id FROM products WHERE product_code = ? LIMIT 1', [String(p.productCode)]);
  if (existing.length) {
    console.log(`Skipping existing product code ${p.productCode}`);
    return;
  }

  const categoryId = await ensureCategory(p.categoryName || 'Uncategorized');

  await db.query(
    `INSERT INTO products (product_code, product_name, category_id, price_type, buying_price, selling_price, quantity)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [String(p.productCode), p.productName, categoryId, p.priceType || 'unit', p.buyingPrice || 0, p.sellingPrice || 0, p.quantity || 0]
  );
  console.log(`Inserted product ${p.productCode} - ${p.productName}`);
}

async function run() {
  if (!fs.existsSync(seedFile)) {
    console.error('Seed file not found:', seedFile);
    process.exit(1);
  }

  const raw = fs.readFileSync(seedFile, 'utf8');
  let products;
  try {
    products = JSON.parse(raw);
  } catch (err) {
    console.error('Invalid JSON in seed file', err.message);
    process.exit(1);
  }

  for (const p of products) {
    try {
      await upsertProduct(p);
    } catch (err) {
      console.error('Failed to insert', p.productCode, err.message);
    }
  }

  console.log('Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
