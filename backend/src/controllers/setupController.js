const bcrypt = require('bcryptjs');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const isAdminEmail = (value) => String(value).trim().toLowerCase() === 'admin@grocery.com';
const isCashierEmail = (value) => String(value).trim().toLowerCase() === 'cashier@grocery.com';

const getSetupStatus = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    "SELECT setting_value FROM app_settings WHERE setting_key = 'setup_complete' LIMIT 1"
  );

  const [shopRows] = await db.query(
    "SELECT setting_value FROM app_settings WHERE setting_key = 'shop_name' LIMIT 1"
  );

  const [adminRows] = await db.query(
    "SELECT full_name AS fullName, email FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1"
  );

  const [cashierRows] = await db.query(
    "SELECT full_name AS fullName, email FROM users WHERE role = 'cashier' ORDER BY id ASC LIMIT 1"
  );

  res.json({
    setupComplete: rows.length ? rows[0].setting_value === '1' : false,
    shopName: shopRows.length ? shopRows[0].setting_value : '',
    adminName: adminRows.length ? adminRows[0].fullName : '',
    adminEmail: adminRows.length ? adminRows[0].email : '',
    cashierName: cashierRows.length ? cashierRows[0].fullName : '',
    cashierEmail: cashierRows.length ? cashierRows[0].email : ''
  });
});

const initializeSetup = asyncHandler(async (req, res) => {
  const {
    shopName,
    adminName,
    adminEmail,
    adminPassword,
    cashierName,
    cashierEmail,
    cashierPassword
  } = req.body;

  const [setupRows] = await db.query(
    "SELECT setting_value FROM app_settings WHERE setting_key = 'setup_complete' LIMIT 1"
  );

  const setupComplete = setupRows.length && setupRows[0].setting_value === '1';

  if (!shopName || !adminName || !adminEmail || !cashierName || !cashierEmail) {
    return res.status(400).json({ message: 'Shop name, admin name/email, and cashier name/email are required' });
  }

  const normalizedAdminEmail = adminEmail.trim().toLowerCase();
  const normalizedCashierEmail = cashierEmail.trim().toLowerCase();

  if (!isAdminEmail(normalizedAdminEmail)) {
    return res.status(400).json({ message: 'Admin email must be exactly admin@grocery.com' });
  }

  if (!isCashierEmail(normalizedCashierEmail)) {
    return res.status(400).json({ message: 'Cashier email must be exactly cashier@grocery.com' });
  }

  if (normalizedAdminEmail === normalizedCashierEmail) {
    return res.status(400).json({ message: 'Admin and cashier emails must be different' });
  }

  if (!setupComplete && (!adminPassword || !cashierPassword)) {
    return res.status(400).json({ message: 'Admin and cashier passwords are required for initial setup' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [existingUsers] = await connection.query(
      "SELECT id, role FROM users WHERE role IN ('admin', 'cashier') ORDER BY role ASC"
    );

    const adminHash = adminPassword ? await bcrypt.hash(adminPassword, 10) : null;
    const cashierHash = cashierPassword ? await bcrypt.hash(cashierPassword, 10) : null;

    const adminExisting = existingUsers.find((user) => user.role === 'admin');
    const cashierExisting = existingUsers.find((user) => user.role === 'cashier');

    if (setupComplete) {
      if (!adminExisting || !cashierExisting) {
        throw new Error('Existing admin and cashier accounts were not found');
      }

      const adminUpdateParams = [adminName.trim(), normalizedAdminEmail];
      let adminUpdateSql = 'UPDATE users SET full_name = ?, email = ?';
      if (adminHash) {
        adminUpdateSql += ', password_hash = ?';
        adminUpdateParams.push(adminHash);
      }
      adminUpdateSql += ' WHERE id = ?';
      adminUpdateParams.push(adminExisting.id);

      const cashierUpdateParams = [cashierName.trim(), normalizedCashierEmail];
      let cashierUpdateSql = 'UPDATE users SET full_name = ?, email = ?';
      if (cashierHash) {
        cashierUpdateSql += ', password_hash = ?';
        cashierUpdateParams.push(cashierHash);
      }
      cashierUpdateSql += ' WHERE id = ?';
      cashierUpdateParams.push(cashierExisting.id);

      await connection.query(adminUpdateSql, adminUpdateParams);
      await connection.query(cashierUpdateSql, cashierUpdateParams);
    } else {
      if (!adminPassword || !cashierPassword) {
        throw new Error('Admin and cashier passwords are required for initial setup');
      }

      await connection.query(
        `INSERT INTO users (full_name, email, password_hash, role) VALUES
        (?, ?, ?, 'admin'),
        (?, ?, ?, 'cashier')`,
        [adminName.trim(), normalizedAdminEmail, adminHash, cashierName.trim(), normalizedCashierEmail, cashierHash]
      );
    }

    await connection.query(
      `INSERT INTO app_settings (setting_key, setting_value) VALUES
      ('shop_name', ?),
      ('setup_complete', '1')
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [shopName.trim()]
    );

    await connection.commit();

    res.status(201).json({
      message: setupComplete ? 'Shop details updated successfully' : 'Shop setup completed successfully',
      shopName: shopName.trim(),
      setupComplete: true
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

module.exports = {
  getSetupStatus,
  initializeSetup
};