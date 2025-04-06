// Test the API route directly with the seeded users
const axios = require('axios');
require('dotenv').config();

async function testLogin() {
  try {
    console.log('Testing login with MCP user...');
    
    const loginResponse = await axios.post(
      'http://localhost:4000/api/auth/login',
      {
        email: 'mcp@example.com',
        password: 'password123'
      }
    );
    
    console.log('Login successful!');
    const { token, user } = loginResponse.data.data;
    
    return { token, user };
  } catch (error) {
    console.error('Login failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

async function testPartnerCreation(token, mcpId) {
  try {
    console.log('Testing partner creation with token...');
    
    // Create unique email with timestamp
    const timestamp = new Date().getTime();
    const email = `testpartner${timestamp}@example.com`;
    
    // Create partner data
    const partnerData = {
      name: 'API Test Partner',
      email,
      password: 'password123',
      phone: `1${timestamp.toString().substring(0, 9)}`,
      role: 'PICKUP_PARTNER',
      mcpId
    };
    
    console.log('Sending request to create partner with data:', partnerData);
    
    const response = await axios.post(
      'http://localhost:4000/api/partners/add',
      partnerData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Partner creation successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('Partner creation failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run the tests
async function runTests() {
  try {
    const { token, user } = await testLogin();
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('User ID:', user.id);
    
    await testPartnerCreation(token, user.id);
  } catch (error) {
    console.error('Tests failed:', error.message);
  }
}

runTests(); 