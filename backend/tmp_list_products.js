const mysql = require('mysql2/promise');
(async () => {
  try {
    const c = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'Hmit2004@', database: 'grocery_pos' });
    const [rows] = await c.query(`SELECT p.id, p.product_code AS productCode, p.product_name AS productName, c.category_name AS categoryName, IFNULL(p.price_type, 'unit') AS priceType, p.quantity FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.id ASC LIMIT 200`);
    console.log(JSON.stringify(rows, null, 2));
    await c.end();
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
})();
