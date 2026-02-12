const express = require('express');
const cors = require('cors');
const { initDb, db } = require('./database');
const { scrapeOuedkniss } = require('./scraper');
const { scrapeFacebook } = require('./facebookScraper');
const { scrapeKouba } = require('./retailers/koubaScraper');
const { scrapeDigitec } = require('./retailers/digitecScraper');

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

        // 2. Scrape (Parallel)
        // 2. Scrape (Parallel)
        console.log('Starting parallel scrape...');
        const [ouedknissResults, facebookResults, koubaResults, digitecResults] = await Promise.all([
            scrapeOuedkniss(model).catch(e => {
                console.error('Ouedkniss scrape failed completely:', e);
                return [];
            }),
            scrapeFacebook(model).catch(e => {
                console.error('Facebook scrape failed completely:', e);
                return [];
            }),
            scrapeKouba(model).catch(e => {
                console.error('Kouba scrape failed completely:', e);
                return [];
            }),
            scrapeDigitec(model).catch(e => {
                console.error('Digitec scrape failed completely:', e);
                return [];
            })
        ]);

        console.log('Type of ouedknissResults:', typeof ouedknissResults, Array.isArray(ouedknissResults));
        console.log('Type of facebookResults:', typeof facebookResults, Array.isArray(facebookResults));
        console.log('Type of koubaResults:', typeof koubaResults, Array.isArray(koubaResults));
        console.log('Type of digitecResults:', typeof digitecResults, Array.isArray(digitecResults));

        const listings = [
            ...(ouedknissResults || []),
            ...(facebookResults || []),
            ...(koubaResults || []),
            ...(digitecResults || [])
        ];
        console.log(`Total: ${listings.length} (OK: ${(ouedknissResults || []).length}, FB: ${(facebookResults || []).length}, Kouba: ${(koubaResults || []).length}, Digitec: ${(digitecResults || []).length})`);

        if (listings.length === 0) {
            return res.json({ model, avg: 0, min: 0, max: 0, deals: [] });
        }

        // 3. Calculate Stats
        const prices = listings.map(l => l.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const sum = prices.reduce((a, b) => a + b, 0);
        const avg = Math.round(sum / prices.length);

        // 4. Score Deals
        const deals = listings.map(l => {
            let score = 'bad';
            if (l.price < avg * 0.8) score = 'great';
            else if (l.price <= avg * 1.05) score = 'good';

            return { ...l, score };
        });

        // Return response
        res.json({
            model,
            avg,
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
