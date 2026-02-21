const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initDb() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully via Prisma.');
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
}

module.exports = { prisma, initDb };
