// Direct test for partner creation
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Wallet = require('./models/Wallet');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createPartner() {
  try {
    // Find an MCP user
    const mcpUser = await User.findOne({ role: 'MCP' });
    if (!mcpUser) {
      console.log('No MCP user found. Creating one...');
      
      // Create an MCP user if none exists
      const hashedPassword = await bcrypt.hash('password123', 10);
      const newMcp = new User({
        name: 'Test MCP',
        email: 'testmcp@example.com',
        password: hashedPassword,
        phone: '9876543210',
        role: 'MCP',
        status: 'ACTIVE'
      });
      
      await newMcp.save();
      console.log('Created MCP user:', newMcp._id);
      
      // Create wallet for MCP
      const mcpWallet = new Wallet({
        userId: newMcp._id,
        balance: 1000
      });
      await mcpWallet.save();
      
      mcpId = newMcp._id;
    } else {
      console.log('Found existing MCP user:', mcpUser._id);
      mcpId = mcpUser._id;
    }
    
    // Now create a partner
    const partnerData = {
      name: 'Test Partner Direct',
      email: 'partner-direct@example.com',
      password: await bcrypt.hash('password123', 10),
      phone: '5555555555',
      role: 'PICKUP_PARTNER',
      mcpId: mcpId,
      status: 'ACTIVE'
    };
    
    // Check if partner already exists
    const existingPartner = await User.findOne({ email: partnerData.email });
    if (existingPartner) {
      console.log('Partner already exists:', existingPartner._id);
      return;
    }
    
    // Create partner
    const partner = new User(partnerData);
    await partner.save();
    console.log('Created partner:', partner._id);
    
    // Create wallet for partner
    const wallet = new Wallet({
      userId: partner._id,
      balance: 0
    });
    await wallet.save();
    console.log('Created wallet for partner');
    
    // List all users
    const users = await User.find();
    console.log('All users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.role}): ${user._id}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
connectDB().then(() => {
  createPartner();
}); 