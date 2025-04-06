require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Wallet = require('./models/Wallet');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Clean the database
async function cleanDB() {
  console.log('Cleaning database...');
  await User.deleteMany({});
  await Wallet.deleteMany({});
  console.log('Database cleaned');
}

// Seed MCP and Partners
async function seedDatabase() {
  try {
    console.log('Starting database seed...');
    
    // Create a test MCP user
    const mcpPassword = await bcrypt.hash('password123', 10);
    const mcp = new User({
      name: 'Test MCP',
      email: 'mcp@example.com',
      password: mcpPassword,
      phone: '9876543210',
      role: 'MCP',
      status: 'ACTIVE'
    });
    
    await mcp.save();
    console.log('Created MCP user:', mcp._id);
    
    // Create wallet for MCP
    const mcpWallet = new Wallet({
      userId: mcp._id,
      balance: 1000
    });
    await mcpWallet.save();
    
    // Create a test Pickup Partner
    const partnerPassword = await bcrypt.hash('password123', 10);
    const partner = new User({
      name: 'Test Partner',
      email: 'partner@example.com',
      password: partnerPassword,
      phone: '1234567890',
      role: 'PICKUP_PARTNER',
      mcpId: mcp._id,
      status: 'ACTIVE'
    });
    
    await partner.save();
    console.log('Created Partner user:', partner._id);
    
    // Create wallet for Partner
    const partnerWallet = new Wallet({
      userId: partner._id,
      balance: 0
    });
    await partnerWallet.save();
    
    // Generate tokens for testing
    const mcpToken = jwt.sign(
      { userId: mcp._id, role: 'MCP' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const partnerToken = jwt.sign(
      { userId: partner._id, role: 'PICKUP_PARTNER' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('\n=== LOGIN INFORMATION ===');
    console.log('\nMCP User:');
    console.log('Email: mcp@example.com');
    console.log('Password: password123');
    console.log('Token:', mcpToken);
    
    console.log('\nPartner User:');
    console.log('Email: partner@example.com');
    console.log('Password: password123');
    console.log('Token:', partnerToken);
    
    console.log('\nDatabase seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed process
connectDB()
  .then(cleanDB)
  .then(seedDatabase)
  .catch(err => {
    console.error('Seed process failed:', err);
    process.exit(1);
  }); 