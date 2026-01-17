// Test file to verify all API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:9000';

async function testAPIs() {
    console.log('🧪 Testing API Endpoints...\n');
    
    try {
        // Test root endpoint
        console.log('1. Testing GET /');
        const rootResponse = await axios.get(`${BASE_URL}/`);
        console.log('✅ Root endpoint:', rootResponse.data);
        
        // Test auth endpoints
        console.log('\n2. Testing POST /api/auth/signup');
        try {
            const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'password123'
            });
            console.log('✅ Signup successful:', signupResponse.data.message);
        } catch (error) {
            console.log('⚠️ Signup failed (user might exist):', error.response?.data?.message);
        }
        
        // Test login
        console.log('\n3. Testing POST /api/auth/signin');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/signin`, {
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('✅ Login successful:', loginResponse.data.message);
        
        const token = loginResponse.data.token;
        const authHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // Test user endpoints
        console.log('\n4. Testing GET /api/user/profile');
        const profileResponse = await axios.get(`${BASE_URL}/api/user/profile`, {
            headers: authHeaders
        });
        console.log('✅ Profile endpoint working');
        
        console.log('\n5. Testing GET /api/user/users');
        const usersResponse = await axios.get(`${BASE_URL}/api/user/users`, {
            headers: authHeaders
        });
        console.log('✅ Users endpoint working, found:', usersResponse.data.data.length, 'users');
        
        // Test chat endpoints
        console.log('\n6. Testing GET /api/chat');
        const chatResponse = await axios.get(`${BASE_URL}/api/chat`, {
            headers: authHeaders
        });
        console.log('✅ Chat endpoint working, found:', chatResponse.data.data.length, 'chats');
        
        console.log('\n🎉 All API endpoints are working correctly!');
        
    } catch (error) {
        console.error('❌ API Test Failed:', error.response?.data || error.message);
    }
}

testAPIs();
