const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/auth');
const {
  createPickup,
  getMyPickups,
  updatePickupStatus,
  filterPickups
} = require('../controllers/pickupController');

// MCP: Create and assign
router.post('/create', verifyToken, authorize('MCP'), createPickup);

// Pickup Partner: View assigned pickups
router.get('/my', verifyToken, getMyPickups);

// Pickup Partner: Update status
router.put('/:id/status', verifyToken, updatePickupStatus);

// MCP: Filter
router.get('/filter', verifyToken, authorize('MCP'), filterPickups);

module.exports = router;
