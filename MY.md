# MCP System - Backend

## Overview
This is the backend server for the Micro Collection Partner (MCP) System. It provides APIs for managing MCPs, Pickup Partners, orders, wallets, and transactions.

## Features
- User authentication (MCP and Pickup Partners)
- Pickup Partner management
- Order management and tracking
- Wallet and transaction system
- Comprehensive API for mobile and web clients

## Tech Stack
- Node.js with Express
- MongoDB for database
- JWT for authentication
- RESTful API architecture

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation
1. Clone the repository
2. Navigate to the server directory: `cd server`
3. Install dependencies: `npm install`
4. Create a `.env` file with the following variables:
   ```
   MONGO_URI=<your_mongodb_connection_string>
   PORT=5000
   JWT_SECRET=<your_jwt_secret>
   ```

### Database Seeding
To populate the database with initial data:
```
npm run seed
```

### Running the Server
- Development mode: `npm run dev`
- Production mode: `npm start`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (MCP or Pickup Partner)
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change user password

### Partners
- `GET /api/partners` - Get all partners (for MCPs)
- `POST /api/partners/add` - Add a new pickup partner
- `DELETE /api/partners/:id` - Delete a pickup partner
- `PUT /api/partners/:id` - Update pickup partner details

### Wallet
- `GET /api/wallet` - Get wallet details
- `POST /api/wallet/add` - Add funds to wallet
- `POST /api/wallet/transfer` - Transfer funds to pickup partner
- `GET /api/wallet/transactions` - Get transaction history

### Pickups
- `POST /api/pickups/create` - Create a pickup request
- `GET /api/pickups/my` - Get pickups assigned to current partner
- `PUT /api/pickups/:id/status` - Update pickup status
- `GET /api/pickups/filter` - Filter pickups by status, date, etc.

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders with filters
- `GET /api/orders/:orderId` - Get order details
- `GET /api/orders/stats/overview` - Get order statistics
- `POST /api/orders/:orderId/assign` - Assign order to pickup partner
- `PUT /api/orders/:orderId/status` - Update order status

## License
ISC 