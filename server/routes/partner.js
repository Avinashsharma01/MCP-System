const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/auth');
const {
  getAllPartners,
  addPartner,
  deletePartner,
  updatePartner
} = require('../controllers/partnerController');

// Log all incoming requests to this route
router.use((req, res, next) => {
  console.log(`Partner route accessed: ${req.method} ${req.originalUrl}`);
  console.log('Request body:', req.body);
  console.log('User:', req.user);
  next();
});

// Partner routes
router.get('/', verifyToken, getAllPartners);

// For testing, temporarily remove the role restriction
router.post('/add', verifyToken, addPartner);

router.delete('/:id', verifyToken, authorize('MCP'), deletePartner);
router.put('/:id', verifyToken, authorize('MCP'), updatePartner);

module.exports = router;
