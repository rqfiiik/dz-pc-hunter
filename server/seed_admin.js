const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    const email = "rqfik.lakehal@gmail.com";
    const password = "RA07092004fik*";

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminUser = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'admin',
                isSubscribed: true, // Bypass subscription lock
                provider: 'email'
            },
            create: {
                email,
                password: hashedPassword,
                role: 'admin',
                isSubscribed: true,
                provider: 'email'
            }
        });

        console.log("Admin account successfully provisioned:");
        console.log(`Email: ${adminUser.email}`);
        console.log(`Role: ${adminUser.role}`);
        console.log(`Subscribed: ${adminUser.isSubscribed}`);

    } catch (error) {
        console.error("Failed to provision admin:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
