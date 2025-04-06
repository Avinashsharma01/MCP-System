require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');

async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testLogin() {
  try {
    const email = 'mcp@example.com';
    console.log(`Looking for user with email: ${email}`);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found');
      return;
    }
    
    console.log('User found:', user._id);
    console.log('Role:', user.role);
    console.log('Status:', user.status);
    
    // Generate a test token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('\nGenerated test token:');
    console.log(token);
    
    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('\nToken validation successful!');
      console.log('Decoded token payload:', decoded);
    } catch (error) {
      console.error('\nToken validation failed:', error.message);
    }
    
    // Create a password hash
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('\nHashed password for future use:');
    console.log(hashedPassword);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
connectToMongoDB().then(testLogin); 