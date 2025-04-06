require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

// Database connection
const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Wallet.deleteMany({});
    console.log('Existing data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    // Create admin MCP user
    const mcpAdmin = new User({
      name: 'MCP Admin',
      email: 'mcp@example.com',
      password: 'password123',
      phone: '1234567890',
      role: 'MCP',
    });
    await mcpAdmin.save();
    
    // Create wallet for MCP
    const mcpWallet = new Wallet({
      userId: mcpAdmin._id,
      balance: 10000 // Initial balance
    });
    await mcpWallet.save();
    
    // Create 3 pickup partners
    const partners = [
      {
        name: 'Partner One',
        email: 'partner1@example.com',
        password: 'password123',
        phone: '1234567891',
        role: 'PICKUP_PARTNER',
        mcpId: mcpAdmin._id,
        commissionRate: 10
      },
      {
        name: 'Partner Two',
        email: 'partner2@example.com',
        password: 'password123',
        phone: '1234567892',
        role: 'PICKUP_PARTNER',
        mcpId: mcpAdmin._id,
        commissionRate: 15
      },
      {
        name: 'Partner Three',
        email: 'partner3@example.com',
        password: 'password123',
        phone: '1234567893',
        role: 'PICKUP_PARTNER',
        mcpId: mcpAdmin._id,
        commissionRate: 12
      }
    ];
    
    for (const partnerData of partners) {
      const partner = new User(partnerData);
      await partner.save();
      
      // Create wallet for partner
      const partnerWallet = new Wallet({
        userId: partner._id,
        balance: 1000 // Initial balance
      });
      await partnerWallet.save();
    }
    
    console.log('Users and wallets seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Main seeding function
const seedDB = async () => {
  try {
    await connectToDB();
    await clearData();
    await seedUsers();
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding
seedDB(); 