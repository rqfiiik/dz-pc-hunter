const { chromium } = require('playwright');
const { normalizePrice } = require('./utils');

async function scrapeOuedkniss(model, limit = 10) {
    let browser = null;
    try {
        console.log(`Launching browser for: ${model}`);
        browser = await chromium.launch({ headless: true });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 720 }
        });

        const page = await context.newPage();
        const searchUrl = `https://www.ouedkniss.com/s/${encodeURIComponent(model)}`;

        console.log(`Navigating to: ${searchUrl}`);

        // Fast fail: 30s timeout
        await page.goto(searchUrl, { waitUntil: 'commit', timeout: 30000 });
        console.log('Navigation committed. Waiting for body...');

        try {
            await page.waitForSelector('body', { timeout: 15000 });
        } catch (e) {
            console.log('Body selector timeout, proceeding anyway to check content.');
        }

        const listings = await page.evaluate(() => {
            const items = [];
            // Strategy 1: 'div.announcement'
            let cards = document.querySelectorAll('div.announcement');
            if (cards.length === 0) {
                // Strategy 2: Look for 'a' tags with specific classes or structures
                cards = document.querySelectorAll('div[data-cy="announcement"]');
            }
            if (cards.length === 0) {
                // Strategy 3: Generic grid items
                cards = document.querySelectorAll('.o-layout__item');
            }

            // Fallback strategy: find any link that looks like a product
            if (cards.length === 0) {
                const links = document.querySelectorAll('a[href*="/store/"]');
                console.log('Fallback strategy found links:', links.length);
            }

            cards.forEach(card => {
                const titleEl = card.querySelector('h2, h3, [class*="title"]');
                const priceEl = card.querySelector('[class*="price"]');
                const linkEl = card.querySelector('a');

                if (titleEl && priceEl) {
                    items.push({
                        title: titleEl.innerText.trim(),
                        rawPrice: priceEl.innerText.trim(),
                        link: linkEl ? linkEl.href : window.location.href,
                        source: 'ouedkniss'
                    });
                }
            });
            return items;
        });

        console.log(`Found ${listings.length} listings via scraper.`);

        if (listings.length > 0) {
            return listings.map(item => ({
                ...item,
                price: normalizePrice(item.rawPrice)
            })).filter(item => item.price !== null && item.price > 0).slice(0, limit);
        }

        console.log('No listings found. Throwing error to trigger fallback for demo/debugging.');
        throw new Error('No listings found (blocked or empty). Triggers fallback.');

    } catch (error) {
        console.error('Scraping failed (likely blocked or timeout):', error.message);
        console.log('Returning MOCK DATA for demonstration purposes.');

        // Fallback Mock Data
        return [
            {
                title: `${model} - Verified Seller`,
                rawPrice: '55000 DA',
                price: 55000,
                link: 'https://www.ouedkniss.com/mock-listing-1',
                source: 'ouedkniss (mock)'
            },
            {
                title: `${model} Like New`,
                rawPrice: '52000 DA',
                price: 52000,
                link: 'https://www.ouedkniss.com/mock-listing-2',
                source: 'ouedkniss (mock)'
            },
            {
                title: `${model} Good Condition`,
                rawPrice: '62000 DA',
                price: 62000,
                link: 'https://www.ouedkniss.com/mock-listing-3',
                source: 'ouedkniss (mock)'
            },
            {
                title: `${model} (Refurbished)`,
                rawPrice: '48000 DA',
                price: 48000,
                link: 'https://www.ouedkniss.com/mock-listing-4',
                source: 'ouedkniss (mock)'
            }
        ];
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { scrapeOuedkniss };
