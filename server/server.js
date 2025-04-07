// server/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectToDB = require("./config/db")
const app = express();
const port = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
const partnerRoutes = require('./routes/partner');
const walletRoutes = require('./routes/wallet');
const pickupRoutes = require('./routes/pickup');
const orderRoutes = require('./routes/order');


// Middleware
app.use(cors());
app.use(express.json());


// Sample route
app.get('/', (req, res) => {
  res.send('MCP System Backend is Running 🚀');
});


// routes 
app.use('/api/auth', authRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(port, ()=>{
    connectToDB()
    console.log(`Server running on port ${port}`)
})