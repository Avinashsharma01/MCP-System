const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, authorize } = require('../middleware/auth');

// All routes are protected
router.use(verifyToken);

// Create new order (MCP only)
router.post('/', authorize('MCP'), orderController.createOrder);

// Get orders with filters
router.get('/', orderController.getOrders);

// Get order details
router.get('/:orderId', orderController.getOrderDetails);

// Get order statistics
router.get('/stats/overview', orderController.getOrderStats);

// Assign order to pickup partner (MCP only)
router.post('/:orderId/assign', authorize('MCP'), orderController.assignOrder);

// Update order status
router.put('/:orderId/status', orderController.updateOrderStatus);

module.exports = router; 