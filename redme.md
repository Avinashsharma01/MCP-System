# MCP System Backend

A robust backend system for the Material Collection Point (MCP) System that manages partners, pickups, orders, and wallet transactions.

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Database](#database)

## Overview

This server implements a RESTful API for the MCP System, allowing for partner management, pickup scheduling, order processing, and wallet transactions. It's built with Node.js, Express, and MongoDB.

## Directory Structure

```
server/
├── config/             # Configuration files
│   └── db.js           # Database connection configuration
├── controllers/        # Route controllers
│   ├── authController.js      # Authentication logic
│   ├── orderController.js     # Order management
│   ├── partnerController.js   # Partner management
│   ├── pickupController.js    # Pickup scheduling
│   └── walletController.js    # Wallet operations
├── middleware/         # Express middleware
│   └── auth.js         # Authentication & authorization middleware
├── models/             # MongoDB data models
│   ├── Order.js        # Order schema
│   ├── Partner.js      # Partner schema
│   ├── Pickup.js       # Pickup schema
│   ├── Transaction.js  # Transaction schema
│   ├── User.js         # User schema
│   └── Wallet.js       # Wallet schema
├── routes/             # API routes
│   ├── auth.js         # Authentication routes
│   ├── order.js        # Order management routes
│   ├── partner.js      # Partner management routes
│   ├── pickup.js       # Pickup scheduling routes
│   └── wallet.js       # Wallet operation routes
├── scripts/            # Utility scripts
│   └── seed.js         # Database seeding script
├── .env                # Environment variables
├── package.json        # Project dependencies and scripts
└── server.js           # Main application entry point
```

## Setup

1. **Install dependencies**:
   ```
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mcp-system
   JWT_SECRET=your_jwt_secret
   ```

3. **Run the development server**:
   ```
   npm run dev
   ```

4. **Seed the database** (optional):
   ```
   npm run seed
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get authentication token
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)

### Partners
- `GET /api/partners` - Get all partners
- `GET /api/partners/:id` - Get partner details
- `POST /api/partners` - Create a new partner
- `PUT /api/partners/:id` - Update partner information
- `DELETE /api/partners/:id` - Delete a partner

### Pickup
- `GET /api/pickups` - Get all pickups
- `GET /api/pickups/:id` - Get pickup details
- `POST /api/pickups` - Schedule a new pickup
- `PUT /api/pickups/:id` - Update pickup information
- `DELETE /api/pickups/:id` - Cancel a pickup

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id` - Update order information
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete an order

### Wallet
- `GET /api/wallet` - Get wallet information
- `GET /api/wallet/transactions` - Get transaction history
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/withdraw` - Withdraw funds
- `POST /api/wallet/transfer` - Transfer funds

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT authentication

## Database

The system uses MongoDB as its database. The connection is established through Mongoose using the connection string specified in the environment variables.

Models include:
- User: For authentication and user information
- Partner: Material collection partners
- Pickup: Scheduled material pickups
- Order: Material orders processing
- Wallet: Digital wallet for transactions
- Transaction: Record of financial transactions
