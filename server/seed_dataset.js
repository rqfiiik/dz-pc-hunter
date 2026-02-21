const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const prisma = new PrismaClient();
const DATA_PATH = 'C:/Users/WelCome/.gemini/antigravity/scratch/pc-part-dataset-main/data/json';

async function seedDatabase() {
    console.log("Starting PC Part Database Seeding...");

    try {
        // 1. Seed CPUs
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

        // 2. Seed GPUs
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

        // 3. Seed Laptops from Excel
        console.log("Reading Teoalida Excel Dataset...");
        const excelPath = 'C:/Users/WelCome/Downloads/Laptop-Computers-Database-by-Teoalida-SAMPLE.xlsx';
        if (fs.existsSync(excelPath)) {
            const wb = xlsx.readFile(excelPath);
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const allRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

            const headers = allRows[2];
            const dataRows = allRows.slice(7);

            let addedCount = 0;
            let skippedCount = 0;

            for (const row of dataRows) {
                const getCol = (name) => {
                    const index = headers.indexOf(name);
                    return index !== -1 ? row[index] : null;
                };

                const title = getCol('Naming') || getCol('Design > Model name');
                const cpuRaw = getCol('Main specs > Processor') || getCol('Processor > Processor model');
                const gpuRaw = getCol('Main specs > Graphics') || getCol('Graphics > Discrete graphics adapter model') || getCol('Graphics > On-board graphics adapter model');
                const ramRaw = getCol('Main specs > Internal memory');
                const storageRaw = getCol('Main specs > Storage');
                const priceRaw = getCol('Design > Price');

                if (!cpuRaw || !ramRaw) {
                    skippedCount++;
                    continue;
                }

                const cpu = String(cpuRaw).trim();
                const gpu = gpuRaw ? String(gpuRaw).replace('Not available', '').trim() : '';
                const ram = String(ramRaw).replace('Not available', '').trim();
                const storage = storageRaw ? String(storageRaw).replace('Not available', '').trim() : '';

                try {
                    await prisma.intelligenceUnit.create({
                        data: {
                            category: 'Laptop',
                            condition: 'Used',
                            cpu: cpu,
                            gpu: gpu,
                            ram: ram,
                            storage: storage,
                            minPrice: 0,
                            avgPrice: 0,
                            maxPrice: 0,
                            dealThreshold: 0,
                            confidenceScore: 1,
                            status: 'APPROVED',
                            metadata: JSON.stringify({
                                source: 'Teoalida Dataset',
                                originalTitle: title,
                                originalPrice: priceRaw
                            })
                        }
                    });
                    addedCount++;
                } catch (error) {
                    // Skip duplicates
                    skippedCount++;
                }
            }
            console.log(`Successfully seeded ${addedCount} Laptops from Excel.`);
        } else {
            console.log("Teoalida Excel file not found in Downloads.");
        }

    } catch (error) {
        console.error("Error during seeding:", error);
    } finally {
        await prisma.$disconnect();
        console.log("Seeding complete. Disconnected from DB.");
    }
}

seedDatabase();
