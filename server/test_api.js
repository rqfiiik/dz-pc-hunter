const { prisma } = require('./database');
const { parseSpecs } = require('./spec_parser');

async function runTests() {
    console.log('Testing Spec Parser:');
    const parsed = parseSpecs('Lenovo yoga 16gb m1 max new');
    console.log(parsed);

    // Start testing DB
    try {
        console.log('\nTesting Database Connection & Seed...');
        // Clear DB
        await prisma.productLink.deleteMany();
        await prisma.intelligenceUnit.deleteMany();

        const unit = await prisma.intelligenceUnit.create({
            data: {
                category: 'Laptop',
                cpu: 'M1 Max',
                gpu: 'Apple GPU 32-core',
                ram: '16GB',
                storage: '1TB',
                condition: 'New',
                minPrice: 300000,
                avgPrice: 350000,
                maxPrice: 400000,
                dealThreshold: 320000,
                confidenceScore: 15,
                productLinks: {
                    create: [
                        { url: 'https://ouedkniss.com/test-deal-1', price: 310000 },
                        { url: 'https://ouedkniss.com/test-deal-2', price: 380000 }
                    ]
                }
            }
        });
        console.log('Created Intelligence Unit:', unit.id);

        const foundUnits = await prisma.intelligenceUnit.findMany({
            where: { cpu: { contains: 'M1' } },
            include: { productLinks: true }
        });
        console.log(`Found ${foundUnits.length} units with M1 CPU.`);
        console.log(JSON.stringify(foundUnits, null, 2));

        console.log('\nAll tests passed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runTests();
