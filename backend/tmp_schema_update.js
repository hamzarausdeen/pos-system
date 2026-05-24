const mysql = require('mysql2/promise');
(async () => {
  try {
    const c = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'Hmit2004@', database: 'grocery_pos' });
    try {
      await c.query("ALTER TABLE products ADD COLUMN price_type ENUM('unit','per100g') NOT NULL DEFAULT 'unit'");
      console.log('added price_type');
    } catch (e) {
      console.log('price_type add error', e.message);
    }

    const [s1] = await c.query('SHOW COLUMNS FROM sale_items');
    const [s2] = await c.query('SHOW COLUMNS FROM stock_history');
    console.log('sale_items', JSON.stringify(s1, null, 2));
    console.log('stock_history', JSON.stringify(s2, null, 2));
    await c.end();
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
})();
