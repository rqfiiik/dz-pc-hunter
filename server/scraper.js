const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const { normalizePrice } = require('./utils');

chromium.use(stealth());

async function scrapeOuedkniss(model, limit = 10) {
    let browser = null;
    try {
        console.log(`[Stealth] Launching browser for: ${model}`);
        browser = await chromium.launch({ headless: true });

        // Load auth state if available
        let contextOptions = {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 720 }
        };

        if (fs.existsSync('auth.json')) {
            try {
                const authState = JSON.parse(fs.readFileSync('auth.json', 'utf8'));
                contextOptions.storageState = authState;
                console.log('🔑 Loaded authenticated session (Cookies/Storage).');
            } catch (e) {
                console.error('Failed to load auth.json:', e.message);
            }
        }

        const context = await browser.newContext(contextOptions);

        const page = await context.newPage();
        const searchUrl = `https://www.ouedkniss.com/s/${encodeURIComponent(model)}`;

        console.log(`Navigating to: ${searchUrl}`);

        // Better wait strategy for SPA (Vue.js) - networkidle is too flaky
        // 'domcontentloaded' can also hang if CF is checking browser. 'commit' is fastest.
        await page.goto(searchUrl, { waitUntil: 'commit', timeout: 30000 });
        console.log('Page DOM loaded. Waiting for specific selectors...');

        try {
            // Wait for either the card or the "no results" message
            await page.waitForSelector('div[class*="announ-card"], .v-card, .o-layout__item', { timeout: 10000 });
        } catch (e) {
            console.log('Selector wait timed out, proceeding to evaluate anyway.');
        }

        // Screenshot for debugging (success path)
        await page.screenshot({ path: 'debug_ouedkniss_render.png' });

        const listings = await page.evaluate(() => {
            const items = [];

            // Selector Strategy 2024 (Ouedkniss specific)
            // They often use div.o-announ-card or similar
            let cards = Array.from(document.querySelectorAll('div[class*="announ-card"]'));

            if (cards.length === 0) {
                // Try generic V-Card strategy (Vuetify)
                cards = Array.from(document.querySelectorAll('.v-card'));
            }

            // If still nothing, look for generic layout items
            if (cards.length === 0) {
                cards = Array.from(document.querySelectorAll('.o-layout__item'));
            }

            // If still nothing, look for ANY link that looks like a detail page
            if (cards.length === 0) {
                // Listing links usually match /annonce/ or contain "store"
                const links = Array.from(document.querySelectorAll('a[href*="/annonce/"]'));
                if (links.length > 0) {
                    // Start from the link and go up to find context
                    console.log('Found links via href strategy:', links.length);
                    links.forEach(link => {
                        const container = link.closest('div[class*="col"]') || link.parentElement;
                        if (container) items.push(parseContainer(container, link));
                    });
                    return items;
                }
            }

            function parseContainer(card, linkOverride) {
                // Try to find title and price in the card
                const titleEl = card.querySelector('h2, h3, div[class*="title"], span[class*="title"]');
                const priceEl = card.querySelector('[class*="price"], div[class*="value"]');
                const linkEl = linkOverride || card.querySelector('a');

                if (titleEl && priceEl) {
                    return {
                        title: titleEl.innerText.trim(),
                        rawPrice: priceEl.innerText.trim(),
                        link: linkEl ? linkEl.href : window.location.href,
                        source: 'ouedkniss'
                    };
                }
                return null;
            }

            cards.forEach(card => {
                const item = parseContainer(card);
                if (item) items.push(item);
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

        if (browser) {
            try {
                await page.screenshot({ path: 'error_screenshot.png' });
            } catch (e) { }
        }

        // return empty array instead of mock data
        return [];
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { scrapeOuedkniss };
