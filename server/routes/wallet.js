const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { verifyToken, authorize } = require('../middleware/auth');

// All routes are protected
router.use(verifyToken);

// Get wallet details and recent transactions
router.get('/', walletController.getWalletDetails);

// Get transaction history
router.get('/transactions', walletController.getTransactionHistory);

// Add funds (MCP only)
router.post('/add-funds', authorize('MCP'), walletController.addFunds);

// Transfer funds (MCP only)
router.post('/transfer', authorize('MCP'), walletController.transferFunds);

// Withdraw funds
router.post('/withdraw', walletController.withdrawFunds);

module.exports = router;
