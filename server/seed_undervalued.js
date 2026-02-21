const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedUndervaluedDeal() {
    try {
        // Find an approved intelligence unit to attach the deal to
        const unit = await prisma.intelligenceUnit.findFirst({
            where: { status: 'APPROVED' }
        });

        if (!unit) {
            console.log('No approved units found. Run seed_pending.js and approve one first.');
            return;
        }

        const undervaluedPrice = unit.dealThreshold - 15000;

        const link = await prisma.productLink.create({
            data: {
                url: 'https://www.ouedkniss.com/undervalued-test-deal-' + Date.now(),
                price: undervaluedPrice,
                intelligenceUnitId: unit.id,
                // createdAt automatically defaults to now()
            }
        });

        console.log('Seeded undervalued deal! Price:', undervaluedPrice, 'Threshold:', unit.dealThreshold);
        console.log('Wait up to 1 minute for the Cron job on the server to print the alert...');

    } catch (e) {
        console.error('Failed to seed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

seedUndervaluedDeal();
