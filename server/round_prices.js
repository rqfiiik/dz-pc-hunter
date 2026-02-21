const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching all units to round prices...");
    const units = await prisma.intelligenceUnit.findMany();

    const roundDown10 = (num) => Math.floor(num / 10) * 10;

    let updatedCount = 0;
    for (const unit of units) {
        // Only update if there's actually a price change needed (more efficient)
        const newMin = roundDown10(unit.minPrice);
        const newAvg = roundDown10(unit.avgPrice);
        const newMax = roundDown10(unit.maxPrice);
        const newThreshold = roundDown10(unit.dealThreshold);

        if (
            unit.minPrice !== newMin ||
            unit.avgPrice !== newAvg ||
            unit.maxPrice !== newMax ||
            unit.dealThreshold !== newThreshold
        ) {
            await prisma.intelligenceUnit.update({
                where: { id: unit.id },
                data: {
                    minPrice: newMin,
                    avgPrice: newAvg,
                    maxPrice: newMax,
                    dealThreshold: newThreshold
                }
            });
            updatedCount++;
        }
    }
    console.log(`Successfully rounded prices for ${updatedCount} units.`);
}

main()
    .catch(e => {
        console.error("Migration Failed:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
