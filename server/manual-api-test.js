// Test the API endpoint directly with our verified token
const axios = require('axios');

async function testPartnerCreation() {
  try {
    // The verified token from login-test.js
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2YyMjE4NDhhMjE3MzEzNDI1OTMwMzMiLCJyb2xlIjoiTUNQIiwiaWF0IjoxNzQzOTIxNjM3LCJleHAiOjE3NDQwMDgwMzd9.vOhvW19wnghYQnBDRCuCo7sTGwFmv0IR8M7s4sxVJ1c';
    
    // The MCP user ID from login-test.js
    const mcpId = '67f221848a21731342593033';
    
    // Create unique email with timestamp
    const timestamp = new Date().getTime();
    const email = `testpartner${timestamp}@example.com`;
    
    // Create partner data
    const partnerData = {
      name: 'Manual API Test Partner',
      email,
      password: 'password123',
      phone: `1${timestamp.toString().substring(0, 9)}`,
      role: 'PICKUP_PARTNER',
      mcpId
    };
    
    console.log('Testing partner creation with verified token...');
    console.log('Partner data:', partnerData);
    
    // Make the API request
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
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testPartnerCreation(); 