const axios = require('axios');

async function seedPending() {
    try {
        const unit = {
            category: 'Laptop',
            cpu: 'i7 12th', // Typo on purpose for QC edit test
            gpu: 'RTX 3060',
            ram: '16GB',
            storage: '512GB',
            condition: 'Used',
            minPrice: 150000,
            avgPrice: 170000,
            maxPrice: 190000,
            dealThreshold: 160000,
            confidenceScore: 8,
            proofUrl: 'https://imgur.com/example-proof'
        };

        const res = await axios.post('http://localhost:5000/api/intelligence-units', unit);
        console.log('Seeded pending unit:', res.data);
    } catch (e) {
        console.error('Failed to seed:', e.response?.data || e.message);
    }
}

seedPending();
