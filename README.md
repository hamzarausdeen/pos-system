# Grocery POS

A lightweight point-of-sale (POS) application for small grocery stores, split into a Node/Express backend and a React + Vite frontend.

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Setup](#setup)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Seeding Sample Data](#seeding-sample-data)
- [Development Notes](#development-notes)
- [Contributing](#contributing)

## Overview

This repository contains a simple grocery POS application intended for learning and small deployments. The backend exposes REST endpoints for authentication, products, inventory and sales. The frontend is a React single-page app that consumes those APIs.

## Features

- User authentication (JWT)
- Product and category management
- Inventory and sales recording
- Basic reports and dashboard views

## Tech Stack

- Backend: Node.js, Express, MySQL (mysql2)
- Frontend: React, Vite, Tailwind CSS

## Repository Structure

- `backend/` — Express API, DB init, scripts and sample data
- `frontend/` — React app built with Vite

See the source folders for controllers, routes and components.

## Setup

Prerequisites: Node.js (16+), npm, and a running MySQL server.

### Backend

1. Open a terminal and install dependencies:

```bash
cd backend
npm install
```

2. Create a `.env` file in `backend/` with the following variables (example):

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=grocery_pos
JWT_SECRET=change_this_secret
```

3. Initialize the database and start the server:

```bash
# (optional) seed products from `backend/data/products.json`
npm run seed:products

# start in development (requires nodemon)
npm run dev

# or start normally
npm start
```

The backend listens on `http://localhost:5000` by default.

### Frontend

1. Install dependencies and start dev server:

```bash
cd frontend
npm install
npm run dev
```

2. Open the app in the browser at the URL printed by Vite (usually `http://localhost:5173`).

## Seeding Sample Data

- Product data is stored in `backend/data/products.json` and can be imported with the script defined in `backend/package.json`:

```bash
cd backend
npm run seed:products
```

This runs `scripts/importProducts.js` to add sample products to your database.

## Development Notes

- Backend entrypoint: `backend/src/index.js`
- Frontend entrypoint: `frontend/src/main.jsx`
- Environment configuration lives in `backend/.env` (not included in repo)

## Deployment Checklist

If you deploy the frontend, make sure the hosting platform runs the build from the repository root. The root `package.json` forwards `npm run build` to the frontend workspace.

Before deploying, set the frontend API base URL to your live backend, for example:

```bash
VITE_API_URL=https://your-backend-domain.com/api
```

If the frontend and backend are hosted on different domains, also update the backend `CORS_ORIGIN` to match the live frontend URL.

## Contributing

Contributions are welcome. Open an issue or submit a pull request with a clear description of changes.

---

If you'd like, I can also add a quick checklist for running the app locally or update the README with API endpoint examples. Tell me which you'd prefer.
