require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Wallet = require('./models/Wallet');
const Order = require('./models/Order');

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
  await Order.deleteMany({});
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

    // Create a test customer
    const customerPassword = await bcrypt.hash('password123', 10);
    const customer = new User({
      name: 'Test Customer',
      email: 'customer@example.com',
      password: customerPassword,
      phone: '5555555555',
      role: 'CUSTOMER',
      status: 'ACTIVE'
    });
    
    await customer.save();
    console.log('Created Customer user:', customer._id);

    // Create dummy orders
    const orders = [
      {
        mcpId: mcp._id,
        customerId: customer._id,
        pickupPartnerId: partner._id,
        status: 'COMPLETED',
        pickupLocation: {
          type: 'Point',
          coordinates: [77.5946, 12.9716], // Bangalore coordinates
          address: {
            street: '123 MG Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
            landmark: 'Near Metro Station'
          }
        },
        amount: 500,
        commission: 50,
        scheduledTime: new Date(Date.now() - 86400000), // Yesterday
        completedTime: new Date(Date.now() - 82800000), // Yesterday + 10 hours
        customerNotes: 'Please handle with care',
        paymentStatus: 'COMPLETED'
      },
      {
        mcpId: mcp._id,
        customerId: customer._id,
        status: 'PENDING',
        pickupLocation: {
          type: 'Point',
          coordinates: [77.5946, 12.9716],
          address: {
            street: '456 Brigade Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
            landmark: 'Near UB City'
          }
        },
        amount: 750,
        commission: 75,
        scheduledTime: new Date(Date.now() + 86400000), // Tomorrow
        customerNotes: 'Urgent delivery required'
      },
      {
        mcpId: mcp._id,
        customerId: customer._id,
        pickupPartnerId: partner._id,
        status: 'IN_PROGRESS',
        pickupLocation: {
          type: 'Point',
          coordinates: [77.5946, 12.9716],
          address: {
            street: '789 Church Street',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
            landmark: 'Near UB City'
          }
        },
        amount: 1000,
        commission: 100,
        scheduledTime: new Date(),
        customerNotes: 'Fragile items'
      }
    ];

    // Save all orders
    for (const orderData of orders) {
      const order = new Order(orderData);
      await order.save();
      console.log('Created order:', order._id);
    }
    
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
    
    console.log('\nCustomer User:');
    console.log('Email: customer@example.com');
    console.log('Password: password123');
    
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