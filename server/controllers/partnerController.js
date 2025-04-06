const User = require('../models/User');
const Wallet = require('../models/Wallet');
const bcrypt = require('bcryptjs');

// Get all Pickup Partners
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await User.find({ role: 'PICKUP_PARTNER' });
    res.status(200).json({
      success: true,
      message: 'Partners retrieved successfully',
      data: {
        partners
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error getting partners', 
      error: err.message 
    });
  }
};

// Add a Pickup Partner
exports.addPartner = async (req, res) => {
  console.log('Add partner request body:', req.body);
  let { name, email, password, phone, mcpId, commission = 0 } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password || !phone || !mcpId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        data: { required: ['name', 'email', 'password', 'phone', 'mcpId'] }
      });
    }

    console.log('Checking if email exists:', email);
    const existing = await User.findOne({ email });
    if (existing) {
      // Make email unique by adding timestamp
      const timestamp = Date.now().toString().slice(-6);
      email = `${email.split('@')[0]}_${timestamp}@${email.split('@')[1]}`;
      console.log('Email already exists, using alternative:', email);
    }

    // Check if phone exists and make it unique if needed
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      const timestamp = Date.now().toString().slice(-6);
      phone = `${phone}${timestamp}`;
      console.log('Phone already exists, using alternative:', phone);
    }

    // Verify the MCP exists
    console.log('Checking MCP ID:', mcpId);
    const mcp = await User.findById(mcpId);
    if (!mcp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MCP ID provided'
      });
    }

    if (mcp.role !== 'MCP') {
      return res.status(400).json({
        success: false,
        message: 'The provided ID does not belong to an MCP user'
      });
    }

    console.log('Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating new partner');
    const partner = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'PICKUP_PARTNER',
      mcpId,
      commissionRate: commission,
      status: 'ACTIVE'
    });

    console.log('Saving partner to database');
    await partner.save();
    
    console.log('Creating wallet for partner');
    // Create wallet for the partner
    const wallet = new Wallet({
      userId: partner._id,
      balance: 0
    });
    
    await wallet.save();
    
    console.log('Partner created successfully:', partner._id);
    res.status(201).json({
      success: true,
      message: 'Pickup Partner added successfully',
      data: {
        partner: {
          id: partner._id,
          name: partner.name,
          email: partner.email,
          phone: partner.phone,
          role: partner.role
        }
      }
    });
  } catch (err) {
    console.error('Partner creation error:', err);
    console.error('Error stack:', err.stack);
    
    // Check for specific error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: err.message
      });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        error: err.message
      });
    }
    
    // Check for MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Phone number or email already exists',
        error: err.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add partner',
      error: err.message
    });
  }
};

// Delete a Pickup Partner
exports.deletePartner = async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Partner deleted successfully',
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete partner',
      error: err.message
    });
  }
};

// Update Partner Status or Commission
exports.updatePartner = async (req, res) => {
  const { id } = req.params;
  const { active, commission } = req.body;

  try {
    const updated = await User.findByIdAndUpdate(
      id,
      { active, commission },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: 'Partner updated successfully',
      data: {
        partner: updated
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update partner',
      error: err.message
    });
  }
};
