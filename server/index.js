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

// ----------------------------------------------------
// AUTHENTICATION API
// ----------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(409).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword }
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

        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

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
// SMART SEARCH API (Protected & Subscribed Only)
// ----------------------------------------------------
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
        if (parsed.cpu) whereClause.cpu = { contains: parsed.cpu };
        if (parsed.gpu) whereClause.gpu = { contains: parsed.gpu };
        if (parsed.ram) whereClause.ram = { contains: parsed.ram };
        if (parsed.storage) whereClause.storage = { contains: parsed.storage };
        if (parsed.condition) whereClause.condition = parsed.condition;

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
        const { category, cpu, gpu, ram, storage, condition, minPrice, avgPrice, maxPrice, dealThreshold, confidenceScore, proofUrl } = req.body;

        const unit = await prisma.intelligenceUnit.create({
            data: {
                category, cpu, gpu, ram, storage, condition,
                minPrice, avgPrice, maxPrice, dealThreshold, confidenceScore, proofUrl,
                status: 'PENDING'
            }
        });

        res.status(201).json(unit);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'An Intelligence Unit with these exact specs already exists.' });
        }
        res.status(500).json({ error: 'Failed to create unit', details: error.message });
    }
});

app.get('/api/admin/pending', async (req, res) => {
    try {
        const pendingUnits = await prisma.intelligenceUnit.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(pendingUnits);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending units', details: error.message });
    }
});

app.put('/api/admin/approve/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { cpu, gpu, ram, storage } = req.body; // Allow admin to normalize specs

        const updated = await prisma.intelligenceUnit.update({
            where: { id },
            data: {
                status: 'APPROVED',
                cpu, gpu, ram, storage
            }
        });

        res.json(updated);
    } catch (error) {
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
