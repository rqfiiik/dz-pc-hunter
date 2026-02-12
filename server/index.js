const express = require('express');
const cors = require('cors');
const { initDb, db } = require('./database');
const { scrapeOuedkniss } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize DB
initDb();

// POST /scan
app.post('/scan', async (req, res) => {
    const { model } = req.body;
    if (!model) return res.status(400).json({ error: 'Model is required' });

    try {
        console.log(`Received scan request for: ${model}`);

        // 1. Check if we have recent cached data (optional optimization)

        // 2. Scrape
        const listings = await scrapeOuedkniss(model);
        console.log(`Found ${listings.length} listings`);

        if (listings.length === 0) {
            return res.json({ model, avg: 0, min: 0, max: 0, deals: [] });
        }

        // 3. Calculate Stats
        const prices = listings.map(l => l.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const sum = prices.reduce((a, b) => a + b, 0);
        const avg = sum / prices.length;

        // 4. Score Deals
        const deals = listings.map(l => {
            let score = 'bad';
            if (l.price < avg * 0.8) score = 'great';
            else if (l.price < avg * 1.05) score = 'good';

            return { ...l, score };
        });

        // 5. Save to DB (Background or blocking - blocking for now)
        // Insert Model stats ? (Simplified for now)

        // Return response
        res.json({
            model,
            avg: Math.round(avg),
            min,
            max,
            deals
        });

    } catch (error) {
        console.error('Error during scan:', error);
        res.status(500).json({ error: 'Failed to scan', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
