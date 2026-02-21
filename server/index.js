const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma, initDb } = require('./database');
const { parseSpecs } = require('./spec_parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize DB (Prisma connection)
initDb();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-dev-key-change-in-prod';

// Auth Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '1014902102143-vq0q9q9q9q9q9q9q9q9q9q9q9q9q9.apps.googleusercontent.com'); // Placeholder for testing

// ----------------------------------------------------
// AUTHENTICATION API
// ----------------------------------------------------
app.post('/api/auth/google', async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) return res.status(400).json({ error: 'Access Token is required' });

        // Verify token with Google UserInfo API
        const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!data || !data.email) {
            return res.status(400).json({ error: 'Failed to retrieve email from Google' });
        }

        const { email, sub: googleId } = data;

        // Check if user exists
        let user = await prisma.user.findUnique({ where: { email } });

        // If not, auto-create the account via OAuth
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    provider: 'google',
                    providerId: googleId,
                    isSubscribed: false // Default state
                }
            });
        }

        // Generate our standard JWT for the app ecosystem
        const appToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role, isSubscribed: user.isSubscribed },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token: appToken, user: { email: user.email, role: user.role, isSubscribed: user.isSubscribed, expiresAt: user.subscriptionExpiry } });

    } catch (error) {
        console.error('Google Auth Error:', error.response?.data || error.message);
        res.status(401).json({ error: 'Invalid Google Token' });
    }
});

const axios = require('axios');

app.post('/api/auth/facebook', async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) return res.status(400).json({ error: 'Access Token is required' });

        // Verify token with Facebook Graph API
        const { data } = await axios.get(`https://graph.facebook.com/me?fields=id,email,name&access_token=${accessToken}`);

        if (!data || !data.email) {
            return res.status(400).json({ error: 'Failed to retrieve email from Facebook' });
        }

        const { email, id: facebookId } = data;

        // Check if user exists
        let user = await prisma.user.findUnique({ where: { email } });

        // If not, auto-create the account
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    provider: 'facebook',
                    providerId: facebookId,
                    isSubscribed: false
                }
            });
        }

        // Generate our standard JWT
        const appToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role, isSubscribed: user.isSubscribed },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token: appToken, user: { email: user.email, role: user.role, isSubscribed: user.isSubscribed, expiresAt: user.subscriptionExpiry } });

    } catch (error) {
        console.error('Facebook Auth Error:', error.response?.data || error.message);
        res.status(401).json({ error: 'Invalid Facebook Token' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(409).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, provider: 'email' }
        });

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.provider !== 'email') return res.status(401).json({ error: 'Invalid credentials or account managed by social login' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, isSubscribed: user.isSubscribed },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, user: { email: user.email, role: user.role, isSubscribed: user.isSubscribed, expiresAt: user.subscriptionExpiry } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

// ----------------------------------------------------
// SMART SEARCH & AUTOCOMPLETE API (Protected)
// ----------------------------------------------------
app.get('/api/autocomplete', authenticateToken, async (req, res) => {
    try {
        if (!req.user.isSubscribed && req.user.role !== 'admin') return res.json([]);

        const { q } = req.query;
        if (!q || q.length < 2) return res.json([]);

        const units = await prisma.intelligenceUnit.findMany({
            where: {
                status: 'APPROVED',
                OR: [
                    { cpu: { contains: q } },
                    { gpu: { contains: q } },
                    { metadata: { contains: q } }
                ]
            },
            take: 20,
            select: { cpu: true, gpu: true, metadata: true }
        });

        const suggestions = new Set();
        units.forEach(u => {
            if (u.cpu && u.cpu.toLowerCase().includes(q.toLowerCase())) suggestions.add(u.cpu);
            if (u.gpu && u.gpu.toLowerCase().includes(q.toLowerCase())) suggestions.add(u.gpu);
            if (u.metadata) {
                try {
                    const metaObj = typeof u.metadata === 'string' ? JSON.parse(u.metadata) : u.metadata;
                    if (metaObj.originalTitle && metaObj.originalTitle.toLowerCase().includes(q.toLowerCase())) {
                        suggestions.add(metaObj.originalTitle);
                    }
                } catch (e) {
                    // silently ignore parse errors
                }
            }
        });

        res.json(Array.from(suggestions).slice(0, 5));
    } catch (error) {
        console.error('Autocomplete Error:', error.message);
        res.status(500).json({ error: 'Autocomplete failed' });
    }
});

app.get('/api/search', authenticateToken, async (req, res) => {
    try {
        // Enforce Subscription Rule (Admins bypass)
        if (!req.user.isSubscribed && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Active subscription required to use Smart Search.' });
        }

        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Search query is required' });

        // Parse specs from query
        const parsed = parseSpecs(q);

        // Build a flexible Prisma Where clause
        const whereClause = { status: 'APPROVED' }; // Only search active units
        if (parsed.category) whereClause.category = parsed.category;
        if (parsed.cpu) whereClause.cpu = { contains: parsed.cpu };
        if (parsed.gpu) whereClause.gpu = { contains: parsed.gpu };
        if (parsed.ram) whereClause.ram = { contains: parsed.ram };
        if (parsed.storage) whereClause.storage = { contains: parsed.storage };
        if (parsed.condition) whereClause.condition = parsed.condition;

        // Dynamic JSON queries using string contains as SQLite doesn't support deep JSON filtering easily
        // In a real Postgres DB, this would use the Prisma Json filter operations (e.g. metadata: { path: ['batteryHealth'], equals: ... })
        if (parsed.metadata) {
            whereClause.metadata = { contains: Object.keys(parsed.metadata)[0] };
        }

        const units = await prisma.intelligenceUnit.findMany({
            where: whereClause,
            include: { productLinks: true },
            take: 10
        });

        res.json({
            parsedQuery: parsed,
            results: units
        });

    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ error: 'Failed to search', details: error.message });
    }
});

// ----------------------------------------------------
// WORKER / ADMIN API
// ----------------------------------------------------
app.post('/api/intelligence-units', async (req, res) => {
    try {
        const { category, cpu, gpu, ram, storage, metadata, condition, listingUrl, listedPrice, proofUrl } = req.body;

        // Workers no longer calculate the averages. They submit raw listings.
        // We initialize the pending IntelligenceUnit with 0s and attach the specific ProductLink.
        const unit = await prisma.intelligenceUnit.create({
            data: {
                category, cpu, gpu, ram, storage, metadata, condition,
                minPrice: 0, avgPrice: 0, maxPrice: 0, dealThreshold: 0, confidenceScore: 1, proofUrl,
                status: 'PENDING',
                productLinks: {
                    create: listingUrl ? { url: listingUrl, price: parseInt(listedPrice) } : []
                }
            },
            include: { productLinks: true }
        });

        res.status(201).json(unit);
    } catch (error) {
        console.error("Worker Submit Error:", error);
        res.status(500).json({ error: 'Failed to create unit', details: error.message });
    }
});

app.get('/api/admin/pending', async (req, res) => {
    try {
        const pendingUnits = await prisma.intelligenceUnit.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
            include: { productLinks: true }
        });
        res.json(pendingUnits);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending units', details: error.message });
    }
});

app.put('/api/admin/approve/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { cpu, gpu, ram, storage, metadata, minPrice, avgPrice, maxPrice, dealThreshold, confidenceScore } = req.body;

        // 1. Fetch the pending unit to get category, condition, etc.
        const pendingUnit = await prisma.intelligenceUnit.findUnique({ where: { id } });
        if (!pendingUnit) return res.status(404).json({ error: 'Unit not found' });

        const finalCpu = cpu !== undefined ? cpu : pendingUnit.cpu;
        const finalGpu = gpu !== undefined ? gpu : pendingUnit.gpu;
        const finalRam = ram !== undefined ? ram : pendingUnit.ram;
        const finalStorage = storage !== undefined ? storage : pendingUnit.storage;

        // 2. Check if an approved unit with these exact specs already exists
        const whereClause = {
            status: 'APPROVED',
            category: pendingUnit.category,
            condition: pendingUnit.condition,
            cpu: finalCpu || null,
            gpu: finalGpu || null,
            ram: finalRam || null,
            storage: finalStorage || null
        };
        console.log("Looking for existing with:", whereClause);
        const existingApproved = await prisma.intelligenceUnit.findFirst({
            where: whereClause
        });
        console.log("Found existing:", existingApproved ? existingApproved.id : "NONE");

        // 3. If an older approved unit exists (like a seeded dataset price), delete it so the new worker curated prices take over
        if (existingApproved) {
            console.log("Deleting old unit:", existingApproved.id);
            await prisma.intelligenceUnit.delete({ where: { id: existingApproved.id } });
        }

        // 4. Mark the pending unit as approved, save normalized specs, and apply the Admin's final pricing calculations
        const updated = await prisma.intelligenceUnit.update({
            where: { id },
            data: {
                status: 'APPROVED',
                cpu: finalCpu,
                gpu: finalGpu,
                ram: finalRam,
                storage: finalStorage,
                metadata,
                minPrice: parseInt(minPrice),
                avgPrice: parseInt(avgPrice),
                maxPrice: parseInt(maxPrice),
                dealThreshold: parseInt(dealThreshold),
                confidenceScore: parseInt(confidenceScore)
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Approve Error:", error);
        res.status(500).json({ error: 'Failed to approve unit', details: error.message });
    }
});

app.get('/api/admin/outdated', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const outdatedUnits = await prisma.intelligenceUnit.findMany({
            where: {
                status: 'APPROVED',
                lastUpdated: { lt: thirtyDaysAgo }
            },
            orderBy: { lastUpdated: 'asc' }
        });
        res.json(outdatedUnits);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch outdated units', details: error.message });
    }
});

app.put('/api/admin/update-prices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { minPrice, avgPrice, maxPrice, dealThreshold } = req.body;

        const updated = await prisma.intelligenceUnit.update({
            where: { id },
            data: {
                minPrice, avgPrice, maxPrice, dealThreshold,
                lastUpdated: new Date()
            }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update prices', details: error.message });
    }
});

app.get('/api/analytics', authenticateToken, async (req, res) => {
    try {
        const units = await prisma.intelligenceUnit.findMany({
            where: { status: 'APPROVED' }
        });

        const categories = {};
        units.forEach(unit => {
            if (!categories[unit.category]) {
                categories[unit.category] = { name: unit.category, units: 0, totalMargin: 0 };
            }
            categories[unit.category].units++;
            const margin = (unit.avgPrice || 0) - (unit.dealThreshold || 0);
            categories[unit.category].totalMargin += margin > 0 ? margin : 0;
        });

        const analyticsData = Object.values(categories).map(cat => ({
            name: cat.name,
            units: cat.units,
            avgMargin: Math.round(cat.totalMargin / cat.units)
        }));

        res.json(analyticsData);
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
    }
});

app.post('/api/product-links', async (req, res) => {
    try {
        const { url, price, intelligenceUnitId } = req.body;

        const link = await prisma.productLink.create({
            data: { url, price, intelligenceUnitId }
        });

        res.status(201).json(link);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product link', details: error.message });
    }
});

// ----------------------------------------------------
// PAYMENT API (Mock webhooks)
// ----------------------------------------------------
app.post('/api/payment/success', authenticateToken, async (req, res) => {
    try {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                isSubscribed: true,
                subscriptionExpiry: thirtyDaysFromNow
            }
        });

        res.json({ message: 'Subscription activated!', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process payment success', details: error.message });
    }
});

// ----------------------------------------------------
// ANALYTICS API
// ----------------------------------------------------
app.get('/api/analytics', async (req, res) => {
    try {
        const units = await prisma.intelligenceUnit.findMany({
            where: { status: 'APPROVED' },
            select: { category: true, avgPrice: true, minPrice: true }
        });

        // Group by category to find average profit margins and total items tracked
        const categoryStats = units.reduce((acc, unit) => {
            if (!acc[unit.category]) {
                acc[unit.category] = { category: unit.category, totalUnits: 0, totalMargin: 0 };
            }
            acc[unit.category].totalUnits += 1;
            acc[unit.category].totalMargin += (unit.avgPrice - unit.minPrice);
            return acc;
        }, {});

        // Format for Recharts
        const data = Object.values(categoryStats).map(stat => ({
            name: stat.category,
            units: stat.totalUnits,
            avgMargin: stat.totalUnits > 0 ? Math.round(stat.totalMargin / stat.totalUnits) : 0
        }));

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
    }
});

// ----------------------------------------------------
// BACKGROUND CRON JOBS (Notifications)
// ----------------------------------------------------
const cron = require('node-cron');

// Check every 5 minutes (using */1 for testing purposes)
cron.schedule('*/1 * * * *', async () => {
    try {
        const oneMinuteAgo = new Date();
        oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

        const recentLinks = await prisma.productLink.findMany({
            where: {
                createdAt: { gte: oneMinuteAgo }
            },
            include: { intelligenceUnit: true }
        });

        for (const link of recentLinks) {
            if (link.price && link.price < link.intelligenceUnit.dealThreshold) {
                console.log(`\n[CRON ALERT] 🚨 Undervalued Deal Detected!🚨`);
                console.log(`Spec: ${link.intelligenceUnit.cpu || link.intelligenceUnit.category}`);
                console.log(`Price: ${link.price} DA (Threshold: ${link.intelligenceUnit.dealThreshold} DA)`);
                console.log(`Link: ${link.url}`);

                // In production, we'd fetch subscribed users and send an email/webhook
                const subscribedUsers = await prisma.user.count({ where: { isSubscribed: true } });
                console.log(`=> Simulating email dispatch to ${subscribedUsers} Pro Active users...\n`);
            }
        }
    } catch (error) {
        console.error('Cron job error:', error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
