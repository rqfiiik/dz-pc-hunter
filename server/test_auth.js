const axios = require('axios');

async function testAuth() {
    try {
        console.log('1. Testing Registration...');
        const randomEmail = `test_${Date.now()}@example.com`;
        const regRes = await axios.post('http://localhost:5000/api/auth/register', {
            email: randomEmail,
            password: 'password123'
        });
        console.log('Registered!', regRes.data);

        console.log('\n2. Testing Login...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: randomEmail,
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Logged in! Token received.');

        console.log('\n3. Testing Protected Search (Unsubscribed User)...');
        try {
            await axios.get('http://localhost:5000/api/search?q=M1', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('FAIL: Search succeeded but should have failed due to missing subscription.');
        } catch (e) {
            console.log('PASS. Search blocked:', e.response?.data?.error);
        }

        console.log('\n4. Testing Unauthenticated Search...');
        try {
            await axios.get('http://localhost:5000/api/search?q=M1');
            console.log('FAIL: Search succeeded but should have failed due to missing token.');
        } catch (e) {
            console.log('PASS. Search blocked:', e.response?.data?.error);
        }

    } catch (error) {
        console.error('Test Process Failed:', error.response?.data || error.message);
    }
}

testAuth();
