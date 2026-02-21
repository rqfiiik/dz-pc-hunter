const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    await prisma.intelligenceUnit.deleteMany({
        where: { metadata: { contains: 'Teoalida Dataset' } }
    });
    console.log('Purged bad laptops');
}
main().finally(() => prisma.$disconnect());
