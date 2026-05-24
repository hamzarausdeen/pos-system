const bcrypt = require('bcryptjs');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');

const isAdminEmail = (value) => String(value).trim().toLowerCase() === 'admin@grocery.com';
const isCashierEmail = (value) => String(value).trim().toLowerCase() === 'cashier@grocery.com';

const getShopName = async () => {
  const [rows] = await db.query(
    "SELECT setting_value FROM app_settings WHERE setting_key = 'shop_name' LIMIT 1"
  );

  return rows.length ? rows[0].setting_value : '';
};

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const [rows] = await db.query(
    'SELECT id, full_name, email, password_hash, role, created_at FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );

  const user = rows[0];

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.role === 'admin' && !isAdminEmail(user.email)) {
    return res.status(403).json({ message: 'Admin account email must be admin@grocery.com. Update it from setup.' });
  }

  if (user.role === 'cashier' && !isCashierEmail(user.email)) {
    return res.status(403).json({ message: 'Cashier account email must be cashier@grocery.com. Update it from setup.' });
  }

  const token = signToken({ id: user.id, role: user.role, fullName: user.full_name, email: user.email });
  const shopName = await getShopName();

  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      shopName
    }
  });
});

const me = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, full_name AS fullName, email, role, created_at AS createdAt FROM users WHERE id = ? LIMIT 1',
    [req.user.id]
  );

  if (!rows.length) {
    return res.status(404).json({ message: 'User not found' });
  }

  const shopName = await getShopName();

  res.json({
    user: {
      ...rows[0],
      shopName
    }
  });
});

module.exports = {
  login,
  me
};
