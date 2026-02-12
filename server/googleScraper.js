const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const { normalizePrice } = require('./utils');

chromium.use(stealth());

async function scrapeGoogle(model, limit = 10) {
    let browser = null;
    let page = null;
    try {
        console.log(`[Google] Launching browser for: ${model}`);
        browser = await chromium.launch({ headless: false });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 720 },
            locale: 'en-US'
        });
        page = await context.newPage();

        // Search Query: site:ouedkniss.com "model"
        // Adding "prix" or "da" might help but might also restrict results.
        const query = `site:ouedkniss.com ${model}`;
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en&gl=dz`;

        console.log(`[Google] Navigating to: ${searchUrl}`);
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Handle Cookie Consent (if any)
        try {
            const consentButton = await page.$('button:has-text("Accept all"), button:has-text("J\'accepte")');
            if (consentButton) await consentButton.click();
        } catch (e) { }

        await page.waitForSelector('div.g', { timeout: 10000 });

        const listings = await page.evaluate(() => {
            const items = [];
            const results = document.querySelectorAll('div.g');

            results.forEach(result => {
                const titleEl = result.querySelector('h3');
                const linkEl = result.querySelector('a');
                const snippetEl = result.querySelector('div[style*="-webkit-line-clamp"], div.VwiC3b, span.st'); // Common snippet classes

                if (titleEl && linkEl) {
                    const title = titleEl.innerText;
                    const link = linkEl.href;
                    const snippet = snippetEl ? snippetEl.innerText : '';

                    // Basic sanity check - ensure it's actually an ouedkniss link
                    if (link.includes('ouedkniss.com/annonce') || link.includes('ouedkniss.com/store')) {
                        items.push({
                            title,
                            link,
                            snippet,
                            source: 'ouedkniss (google)'
                        });
                    }
                }
            });
            return items;
        });

        console.log(`[Google] Found ${listings.length} raw results.`);

        // Post-process to extract price from Snippet or Title
        const processedListings = listings.map(item => {
            const textToScan = `${item.title} ${item.snippet}`;
            // Regex for DA price: e.g. "150000 DA", "12 millions", "120000"
            // This is tricky. We rely on valid numbers near "DA" or big numbers.
            // Let's use a heuristic regex.
            const price = extractPriceFromText(textToScan);

            return {
                ...item,
                rawPrice: price ? `${price} DA` : 'Check Link',
                price: price || 0
            };
        }).filter(item => item.price > 0).slice(0, limit);

        return processedListings;

    } catch (error) {
        console.error('[Google] Scraping failed:', error.message);
        if (page) {
            await page.screenshot({ path: 'debug_google_error.png' });
            try {
                const content = await page.evaluate(() => document.body.innerText.substring(0, 500));
                console.log('[Google] Page Content Preview:', content);
            } catch (e) { }
        }
        return [];
    } finally {
        if (browser) await browser.close();
    }
}

function extractPriceFromText(text) {
    // 1. Look for explicit DA mentions: "150000 DA", "150 000 DA"
    const daRegex = /(\d[\d\s]*)\s?(DA|DZD|da|dzd)/i;
    const match = text.match(daRegex);
    if (match) {
        const numStr = match[1].replace(/\s/g, '');
        const num = parseInt(numStr);
        if (num > 1000) return num; // Filter out "1 DA" placeholders often
    }

    // 2. Look for "millions": "12 millions", "1.2 millions"
    const millionRegex = /(\d+([.,]\d+)?)\s?million/i;
    const millMatch = text.match(millionRegex);
    if (millMatch) {
        const val = parseFloat(millMatch[1].replace(',', '.'));
        return val * 10000; // 1 million centimes = 10,000 DA
    }

    return null;
}

module.exports = { scrapeGoogle };
