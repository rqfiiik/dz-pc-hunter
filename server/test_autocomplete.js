const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const units = await prisma.intelligenceUnit.findMany({
        where: { category: 'Laptop' },
        take: 5,
        select: { metadata: true }
    });
    console.log(units);
}
main().finally(() => prisma.$disconnect());
