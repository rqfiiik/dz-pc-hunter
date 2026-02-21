const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const DATA_PATH = 'C:/Users/WelCome/.gemini/antigravity/scratch/pc-part-dataset-main/data/json';

async function seedDatabase() {
    console.log("Starting PC Part Database Seeding...");

    try {
        const cpuDataPath = path.join(DATA_PATH, 'cpu.json');
        if (fs.existsSync(cpuDataPath)) {
            const rawCPUs = JSON.parse(fs.readFileSync(cpuDataPath, 'utf8'));
            const validCPUs = rawCPUs.filter(cpu => cpu.price && cpu.price > 50).slice(0, 200);

            let cpuCount = 0;
            for (const cpu of validCPUs) {
                const isLaptop = cpu.name.toLowerCase().includes('mobile') || cpu.name.toLowerCase().includes('laptop');
                const category = isLaptop ? 'Laptop' : 'Accessory';
                const estimatedDZD = Math.round(cpu.price * 140 * 1.3);

                await prisma.intelligenceUnit.create({
                    data: {
                        category,
                        cpu: cpu.name,
                        gpu: cpu.graphics === 'None' ? null : cpu.graphics,
                        condition: 'New',
                        minPrice: estimatedDZD - 10000,
                        avgPrice: estimatedDZD,
                        maxPrice: estimatedDZD + 15000,
                        dealThreshold: estimatedDZD - 20000,
                        confidenceScore: 70,
                        status: 'APPROVED'
                    }
                });
                cpuCount++;
            }
            console.log(`Successfully seeded ${cpuCount} CPUs.`);
        }

        const gpuDataPath = path.join(DATA_PATH, 'video-card.json');
        if (fs.existsSync(gpuDataPath)) {
            const rawGPUs = JSON.parse(fs.readFileSync(gpuDataPath, 'utf8'));
            const validGPUs = rawGPUs.filter(gpu => gpu.price && gpu.price > 100).slice(0, 200);

            let gpuCount = 0;
            for (const gpu of validGPUs) {
                const estimatedDZD = Math.round(gpu.price * 140 * 1.3);
                await prisma.intelligenceUnit.create({
                    data: {
                        category: 'Accessory',
                        gpu: gpu.chipset || gpu.name,
                        ram: gpu.memory ? `${gpu.memory}GB` : null,
                        condition: 'New',
                        minPrice: estimatedDZD - 15000,
                        avgPrice: estimatedDZD,
                        maxPrice: estimatedDZD + 25000,
                        dealThreshold: estimatedDZD - 30000,
                        confidenceScore: 70,
                        status: 'APPROVED'
                    }
                });
                gpuCount++;
            }
            console.log(`Successfully seeded ${gpuCount} Video Cards.`);
        }

    } catch (error) {
        console.error("Error during seeding:", error);
    } finally {
        await prisma.$disconnect();
        console.log("Seeding complete. Disconnected from DB.");
    }
}

seedDatabase();
