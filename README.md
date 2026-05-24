# Grocery Shop POS System

A full-stack Grocery POS web application built with React, Tailwind CSS, Vite, Node.js, Express, MySQL, and JWT authentication.

**Features:**

- Role-based authentication: Admin and Cashier
- Admin dashboard: sales, profit, stock, and recent activity
- Category and product CRUD
- Inventory tracking with low-stock alerts and history
- Cashier POS: cart, billing, printable receipts
- Sales & reports with charts
- Responsive UI with light/dark theme support

**Default demo accounts (seeded on DB init):**

- **Admin:** admin@grocery.com / Admin123!
- **Cashier:** cashier@grocery.com / Cashier123!

**Quick Start (local)**

**Prerequisites:** Node.js, npm, MySQL

**Environment**

- Backend reads env from `backend/.env` (see `backend/.env.example`). Important vars:
  - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `PORT` (default 5000)
- Frontend uses Vite and `VITE_API_URL` (optional). Defaults to `http://localhost:5000/api`.

**Install & Run Backend**

1. Create the database (example name used by default is set in `.env`):
   ```bash
   # use your MySQL client
   CREATE DATABASE IF NOT EXISTS grocery_pos;
   ```
2. Install and start:
   ```bash
   cd backend
   npm install
   npm run dev   # nodemon for development
   # or `npm start` to run once
   ```
3. On first start the server will initialize the schema and seed demo data (including the admin/cashier accounts and app settings).

**Install & Run Frontend**

1. Install and start:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open the app at the url printed by Vite (commonly `http://localhost:5173` or secondary port).

**Notes about login & setup**

- The backend now seeds default admin and cashier users during DB initialization. The legacy `/api/setup` flow is disabled in this simplified deployment.
- Use the demo credentials above to sign in. Admin users can access the dashboard; cashier users are redirected to the POS screen.
- The app stores the session token in `localStorage` under `grocery-pos-token`.

**API Endpoints (high level)**

- `POST /api/auth/login` — login returns `{ token, user }`
- `GET /api/auth/me` — returns current user info (requires `Authorization: Bearer <token>`)
- Category/product/sales/inventory/dashboard/report endpoints under `/api/*`

**Troubleshooting**

- If frontend cannot reach the API, ensure `VITE_API_URL` matches backend (or use default `http://localhost:5000/api`).
- Confirm backend is running and reachable: `GET http://localhost:5000/api/health` should return status ok.
- If login returns 401, check credentials and ensure DB was initialized (server logs show schema init on startup).

**Development notes**

- The app supports theme toggle (light/dark). There is a single theme toggle provided by the auth layout.
- To restore or change the seeded credentials, edit `backend/src/config/initDatabase.js`.

**Contributing**

- Feel free to open issues or add features. Follow the repo structure: `frontend/` for UI, `backend/` for API.

**Contact**

- For questions about this local project, reply here or open an issue in your repo.
