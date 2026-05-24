const mysql = require('mysql2/promise');
(async () => {
  try {
    const c = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'Hmit2004@', database: 'grocery_pos' });
    const [rows] = await c.query("SELECT id, product_code, product_name, price_type, quantity FROM products WHERE price_type = 'per100g' LIMIT 50");
    console.log(JSON.stringify(rows, null, 2));
    await c.end();
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
})();
