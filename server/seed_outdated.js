const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedOutdated() {
    try {
        const thirtyFiveDaysAgo = new Date();
        thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

        const unit = await prisma.intelligenceUnit.create({
            data: {
                category: 'Laptop',
                cpu: 'i9 13900HX',
                gpu: 'RTX 4080',
                ram: '32GB',
                storage: '1TB',
                condition: 'New',
                minPrice: 350000,
                avgPrice: 400000,
                maxPrice: 450000,
                dealThreshold: 370000,
                confidenceScore: 25,
                status: 'APPROVED',
                lastUpdated: thirtyFiveDaysAgo,
                proofUrl: 'https://imgur.com/old-proof'
            }
        });

        console.log('Seeded outdated unit (35 days old):', unit.id);

        // Let's also check if the API would catch it
        const outdatedUnits = await prisma.intelligenceUnit.findMany({
            where: {
                status: 'APPROVED',
                lastUpdated: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }
        });
        console.log(`Found ${outdatedUnits.length} outdated units in DB directly.`);

    } catch (e) {
        console.error('Failed to seed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

seedOutdated();
