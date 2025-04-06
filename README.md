# MCP System Backend

A robust backend system for the Material Collection Point (MCP) System that manages partners, pickups, orders, and wallet transactions.

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Partners](#partners)
  - [Pickups](#pickups)
  - [Orders](#orders)
  - [Wallet](#wallet)
- [Authentication Flow](#authentication-flow)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
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

All API responses follow a standard format:

```json
{
  "success": true|false,
  "message": "Description of the result",
  "data": { /* Response data object */ }
}
```

### Authentication

#### Register a new user
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "phone":"6201693634",
    "role": "user"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "John Doe",
        "email": "john@example.com",
        "phone":"6201693634",
      }
    }
  }
  ```

#### Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
      }
    }
  }
  ```

### Partners

#### Register a Partner
- **Endpoint**: `POST /api/partners/register`
- **Request Body**:
  ```json
  {
    "name": "EcoRecycle Inc",
    "email": "contact@ecorecycle.com",
    "password": "securePassword123",
    "role": "MCP"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Partner registered successfully",
    "data": {
      "partner": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "EcoRecycle Inc",
        "email": "contact@ecorecycle.com",
        "role": "MCP",
        "walletBalance": 0
      }
    }
  }
  ```

#### Get Partner Details
- **Endpoint**: `GET /api/partners/:id`
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "partner": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "EcoRecycle Inc",
        "email": "contact@ecorecycle.com",
        "role": "MCP",
        "walletBalance": 500,
        "createdAt": "2023-04-05T14:30:45.123Z"
      }
    }
  }
  ```

### Pickups

#### Create Pickup
- **Endpoint**: `POST /api/pickups/create`
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Access**: MCP partners only
- **Request Body**:
  ```json
  {
    "title": "Weekly Recyclables Pickup",
    "description": "Collection of plastic and paper materials",
    "address": "123 Green St, Eco City",
    "date": "2023-04-10T09:00:00.000Z",
    "assignedTo": "60d21b4667d0d8992e610c86",
    "commission": 50
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Pickup created successfully",
    "data": {
      "pickup": {
        "_id": "60d21b4667d0d8992e610c87",
        "title": "Weekly Recyclables Pickup",
        "description": "Collection of plastic and paper materials",
        "address": "123 Green St, Eco City",
        "date": "2023-04-10T09:00:00.000Z",
        "status": "pending",
        "assignedTo": "60d21b4667d0d8992e610c86",
        "commission": 50,
        "createdAt": "2023-04-05T16:30:22.789Z"
      }
    }
  }
  ```

#### Get My Pickups
- **Endpoint**: `GET /api/pickups/my`
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Access**: Any authenticated user
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "pickups": [
        {
          "_id": "60d21b4667d0d8992e610c87",
          "title": "Weekly Recyclables Pickup",
          "description": "Collection of plastic and paper materials",
          "address": "123 Green St, Eco City",
          "date": "2023-04-10T09:00:00.000Z",
          "status": "pending",
          "assignedTo": "60d21b4667d0d8992e610c86",
          "commission": 50,
          "createdAt": "2023-04-05T16:30:22.789Z"
        }
      ]
    }
  }
  ```

#### Update Pickup Status
- **Endpoint**: `PUT /api/pickups/:id/status`
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Request Body**:
  ```json
  {
    "status": "completed"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Pickup status updated successfully",
    "data": {
      "pickup": {
        "_id": "60d21b4667d0d8992e610c87",
        "status": "completed",
        "updatedAt": "2023-04-10T14:25:10.789Z"
      }
    }
  }
  ```

#### Filter Pickups
- **Endpoint**: `GET /api/pickups/filter`
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Access**: MCP partners only
- **Query Parameters**:
  - `status`: Filter by status (pending, completed, failed)
  - `date`: Filter by date
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "pickups": [
        {
          "_id": "60d21b4667d0d8992e610c87",
          "title": "Weekly Recyclables Pickup",
          "description": "Collection of plastic and paper materials",
          "address": "123 Green St, Eco City",
          "date": "2023-04-10T09:00:00.000Z",
          "status": "completed",
          "assignedTo": "60d21b4667d0d8992e610c86",
          "commission": 50,
          "createdAt": "2023-04-05T16:30:22.789Z"
        }
      ]
    }
  }
  ```

### Orders

#### Create Order
- **Endpoint**: `POST /api/orders/create`
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Request Body**:
  ```json
  {
    "items": [
      {
        "product": "Recycled Paper",
        "quantity": 20,
        "price": 5.50
      }
    ],
    "shippingAddress": "789 Client St, Client City",
    "paymentMethod": "wallet"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Order created successfully",
    "data": {
      "order": {
        "_id": "60d21b4667d0d8992e610c88",
        "orderNumber": "ORD-20230405-001",
        "items": [
          {
            "product": "Recycled Paper",
            "quantity": 20,
            "price": 5.50,
            "total": 110
          }
        ],
        "totalAmount": 110,
        "shippingAddress": "789 Client St, Client City",
        "paymentMethod": "wallet",
        "status": "pending",
        "createdAt": "2023-04-05T17:15:33.123Z"
      }
    }
  }
  ```

#### Get My Orders
- **Endpoint**: `GET /api/orders/my`
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "orders": [
        {
          "_id": "60d21b4667d0d8992e610c88",
          "orderNumber": "ORD-20230405-001",
          "items": [
            {
              "product": "Recycled Paper",
              "quantity": 20,
              "price": 5.50,
              "total": 110
            }
          ],
          "totalAmount": 110,
          "status": "pending",
          "createdAt": "2023-04-05T17:15:33.123Z"
        }
      ]
    }
  }
  ```

### Wallet

#### Get My Wallet
- **Endpoint**: `GET /api/wallet/balance`
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "balance": 1250.75
    }
  }
  ```

#### Add Money to Wallet
- **Endpoint**: `POST /api/wallet/deposit`
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Request Body**:
  ```json
  {
    "amount": 500,
    "paymentMethod": "credit_card"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Deposit successful",
    "data": {
      "transaction": {
        "_id": "60d21b4667d0d8992e610c90",
        "type": "deposit",
        "amount": 500,
        "description": "Wallet deposit via credit card",
        "createdAt": "2023-04-06T14:25:10.789Z"
      },
      "balance": 1750.75
    }
  }
  ```

#### Transaction History
- **Endpoint**: `GET /api/wallet/transactions`
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "transactions": [
        {
          "_id": "60d21b4667d0d8992e610c90",
          "type": "deposit",
          "amount": 500,
          "description": "Wallet deposit via credit card",
          "createdAt": "2023-04-06T14:25:10.789Z"
        },
        {
          "_id": "60d21b4667d0d8992e610c91",
          "type": "withdrawal",
          "amount": 110,
          "description": "Payment for order ORD-20230405-001",
          "createdAt": "2023-04-05T17:30:45.123Z"
        }
      ]
    }
  }
  ```

## Authentication Flow

1. **Registration/Login**:
   - User or partner registers or logs in using the respective endpoints
   - Server responds with a JWT token

2. **Token Usage**:
   - Include the token in the Authorization header for all protected requests:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Role-Based Access**:
   - Some endpoints are restricted based on user roles
   - The system supports roles like "MCP" and "PickupPartner"
   - Unauthorized access attempts will be rejected with a 403 error

## Data Models

### User
```javascript
{
  name: String,         // User's full name
  email: String,        // User's email (unique)
  password: String,     // Hashed password
  role: String,         // Role for authorization
  status: String,       // 'ACTIVE', 'INACTIVE'
  createdAt: Date,
  updatedAt: Date
}
```

### Partner
```javascript
{
  name: String,          // Partner name
  email: String,         // Contact email (unique)
  password: String,      // Hashed password
  role: String,          // 'MCP', 'PickupPartner'
  walletBalance: Number, // Current wallet balance
  createdAt: Date,
  updatedAt: Date
}
```

### Pickup
```javascript
{
  title: String,         // Pickup title
  description: String,   // Pickup description
  address: String,       // Pickup location
  date: Date,            // Scheduled date and time
  status: String,        // 'pending', 'completed', 'failed'
  assignedTo: ObjectId,  // Reference to User/Partner
  commission: Number,    // Commission amount
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  orderNumber: String,   // Formatted order number
  items: [{
    product: String,     // Product name
    quantity: Number,    // Quantity
    price: Number,       // Price per unit
    total: Number        // Calculated total
  }],
  totalAmount: Number,   // Order total
  shippingAddress: String, // Delivery address
  paymentMethod: String, // Payment method
  status: String,        // 'pending', 'processing', 'completed', 'cancelled'
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction
```javascript
{
  type: String,          // 'deposit', 'withdrawal', 'transfer'
  amount: Number,        // Transaction amount
  description: String,   // Transaction description
  status: String,        // 'completed', 'failed', 'pending'
  createdAt: Date
}
```

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": {
    "details": "Additional error details (development mode only)"
  }
}
```

### Common Error Codes

- 400: Bad Request - Invalid input
- 401: Unauthorized - Authentication required
- 403: Forbidden - User lacks permission
- 404: Not Found - Resource doesn't exist
- 500: Internal Server Error - Server-side error

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT authentication
- `NODE_ENV` - Environment (development, production)

## Database

The system uses MongoDB as its database. The connection is established through Mongoose using the connection string specified in the environment variables.

Models include:
- User: For authentication and user information
- Partner: Material collection partners and pickup partners
- Pickup: Scheduled material pickups
- Order: Order processing
- Transaction: Record of financial transactions
