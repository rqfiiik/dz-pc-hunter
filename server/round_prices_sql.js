const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Executing raw SQL to round all prices down to nearest 10...");

    // In Postgres, rounding down to nearest 10 is: FLOOR(column / 10) * 10
    const res = await prisma.$executeRaw`
        UPDATE "IntelligenceUnit"
        SET 
            "minPrice" = FLOOR("minPrice" / 10) * 10,
            "avgPrice" = FLOOR("avgPrice" / 10) * 10,
            "maxPrice" = FLOOR("maxPrice" / 10) * 10,
            "dealThreshold" = FLOOR("dealThreshold" / 10) * 10
        WHERE 
            "minPrice" % 10 != 0 OR 
            "avgPrice" % 10 != 0 OR 
            "maxPrice" % 10 != 0 OR 
            "dealThreshold" % 10 != 0;
    `;

    console.log(`Successfully rounded ${res} intelligence units!`);
}

main()
    .catch(e => {
        console.error("Migration Failed:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
