const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const db = require('./db');

const schemaStatements = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'cashier') NOT NULL DEFAULT 'cashier',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_code VARCHAR(30) NOT NULL UNIQUE,
  product_name VARCHAR(150) NOT NULL,
  category_id INT NOT NULL,
  price_type ENUM('unit', 'per100g') NOT NULL DEFAULT 'unit',
  buying_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bill_number VARCHAR(50) NOT NULL UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  cash_received DECIMAL(10,2) NOT NULL DEFAULT 0,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  profit DECIMAL(10,2) NOT NULL DEFAULT 0,
  cashier_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sales_cashier FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  buying_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  CONSTRAINT fk_sale_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS stock_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  type ENUM('sale', 'adjustment', 'restock') NOT NULL,
  quantity_change DECIMAL(10,2) NOT NULL,
  reference_type VARCHAR(40) DEFAULT NULL,
  reference_id INT DEFAULT NULL,
  note VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stock_history_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

const seedStatements = async () => {
  const [categories] = await db.query('SELECT COUNT(*) AS total FROM categories');

  if (categories[0].total === 0) {
    await db.query(
      `INSERT INTO categories (category_name) VALUES
      ('Drinks'),
      ('Rice'),
      ('Snacks'),
      ('Vegetables'),
      ('Frozen Foods')`
    );
  }
  // Ensure default admin and cashier users exist with known credentials
  const [userCount] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role IN ('admin','cashier')");
  if (userCount[0].total < 2) {
    const bcrypt = require('bcryptjs');
    const adminHash = await bcrypt.hash('Admin123!', 10);
    const cashierHash = await bcrypt.hash('Cashier123!', 10);
    // Insert admin and cashier if missing (use INSERT IGNORE semantics)
    try {
      await db.query(
        `INSERT INTO users (full_name, email, password_hash, role) VALUES
        ('Administrator','admin@grocery.com',?, 'admin'),
        ('Cashier','cashier@grocery.com',?, 'cashier')`,
        [adminHash, cashierHash]
      );
    } catch (err) {
      // ignore duplicate entry errors
    }
  }
  // Ensure setup flag and shop name exist so frontend doesn't require setup
  try {
    await db.query(
      `INSERT INTO app_settings (setting_key, setting_value) VALUES
      ('shop_name','Grocery Store'),
      ('setup_complete','1')
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`
    );
  } catch (err) {
    // ignore
  }
};

const initializeDatabase = async () => {
  const adminConnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await adminConnection.end();

  await db.query(schemaStatements);

  // Ensure price_type column exists on older installations
  try {
    await db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS price_type ENUM('unit','per100g') NOT NULL DEFAULT 'unit'");
  } catch (err) {
    // ignore if ALTER TABLE not supported; table already created with column
  }
  // Ensure numeric columns use decimal for fractional quantities (backwards compatible)
  try {
    await db.query("ALTER TABLE products MODIFY COLUMN quantity DECIMAL(10,2) NOT NULL DEFAULT 0");
  } catch (err) {
    // ignore
  }

  // Ensure is_archived column exists for soft-archiving products (safe check)
  try {
    const [cols] = await db.query(
      `SELECT COUNT(*) AS total FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'is_archived'`,
      [process.env.DB_NAME]
    );
    if (cols[0].total === 0) {
      await db.query("ALTER TABLE products ADD COLUMN is_archived TINYINT(1) NOT NULL DEFAULT 0");
    }
  } catch (err) {
    // ignore errors but do not assume column exists
  }

  try {
    await db.query("ALTER TABLE sale_items MODIFY COLUMN quantity DECIMAL(10,2) NOT NULL");
  } catch (err) {
    // ignore
  }

  try {
    await db.query("ALTER TABLE stock_history MODIFY COLUMN quantity_change DECIMAL(10,2) NOT NULL");
  } catch (err) {
    // ignore
  }
  await seedStatements();
};

module.exports = initializeDatabase;
