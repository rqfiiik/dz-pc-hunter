const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testExpansion() {
    try {
        console.log('--- Creating iPhone Unit ---');
        const phone = await prisma.intelligenceUnit.create({
            data: {
                category: 'Phone',
                cpu: 'iPhone 13 Pro',
                storage: '256GB',
                condition: 'Used',
                metadata: JSON.stringify({ batteryHealth: '87' }),
                minPrice: 120000,
                avgPrice: 135000,
                maxPrice: 150000,
                dealThreshold: 125000,
                confidenceScore: 30,
                status: 'APPROVED' // Auto-approve for test
            }
        });
        console.log('Created:', phone.cpu, phone.metadata);

        console.log('--- Creating Scooter Unit ---');
        const scooter = await prisma.intelligenceUnit.create({
            data: {
                category: 'Scooter',
                cpu: 'Xiaomi Pro 2',
                condition: 'Used',
                metadata: JSON.stringify({ mileage: '1200' }),
                minPrice: 40000,
                avgPrice: 55000,
                maxPrice: 65000,
                dealThreshold: 45000,
                confidenceScore: 15,
                status: 'APPROVED' // Auto-approve for test
            }
        });
        console.log('Created:', scooter.cpu, scooter.metadata);

        console.log('\n--- Testing Search Parser ---');
        const { parseSpecs } = require('./spec_parser');

        const testQ1 = 'iphone 13 pro 256gb batterie 87% used';
        const parsed1 = parseSpecs(testQ1);
        console.log(`Query: "${testQ1}"\nParsed:`, parsed1);

        const testQ2 = 'trottinette xiaomi pro 2 occasion 1200 km';
        const parsed2 = parseSpecs(testQ2);
        console.log(`Query: "${testQ2}"\nParsed:`, parsed2);

    } catch (e) {
        console.error('Test failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

testExpansion();
