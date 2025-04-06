const axios = require('axios');

const API_URL = 'http://localhost:4000/api';

// Test partner creation route
async function testPartnerCreation() {
  console.log('Testing partner creation route...');
  
  try {
    // First, login as an MCP user to get a token
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'mcp@example.com',  // Replace with actual MCP user email
      password: 'password123'    // Replace with actual password
    });
    
    const token = loginResponse.data.data.token;
    const mcpId = loginResponse.data.data.user.id;
    
    console.log('Logged in successfully as MCP. Token:', token.substring(0, 20) + '...');
    console.log('MCP ID:', mcpId);
    
    // Now try to create a partner
    const partnerData = {
      name: 'Test Partner',
      email: 'testpartner@example.com',
      password: 'password123',
      phone: '1234567890',
      role: 'PICKUP_PARTNER',
      mcpId: mcpId
    };
    
    console.log('Attempting to create partner with data:', partnerData);
    
    const createResponse = await axios.post(
      `${API_URL}/partners/add`,
      partnerData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Partner creation successful!');
    console.log('Response:', createResponse.data);
    
  } catch (error) {
    console.error('Test failed!');
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
  }
}

// Run the test
testPartnerCreation(); 