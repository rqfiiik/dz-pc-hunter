const { chromium } = require('playwright');
const { normalizePrice } = require('./utils');

async function scrapeFacebook(model, limit = 10) {
    let browser = null;
    try {
        console.log(`[FB] Launching browser for: ${model}`);
        browser = await chromium.launch({ headless: true });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 720 },
            locale: 'en-US'
        });

        const page = await context.newPage();
        // Facebook Marketplace Search URL (Algiers location ID is often auto-detected or we can try a generic search)
        // Using a generic marketplace search URL. 
        // Note: Facebook is extremely difficult to scrape without login. 
        // We will try a public search approach.
        const searchUrl = `https://www.facebook.com/marketplace/algiers/search?query=${encodeURIComponent(model)}`;

        console.log(`[FB] Navigating to: ${searchUrl}`);

        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for some content to load. Facebook classes are obfuscated (e.g. x1lliihq).
        // We'll wait blindly for a bit or look for generic tags.
        try {
            await page.waitForTimeout(5000);
        } catch (e) {
            console.log('[FB] Initial wait timeout.');
        }

        // Generic selector strategy for Facebook Marketplace (highly volatile)
        const listings = await page.evaluate(() => {
            const items = [];
            // Look for links that look like marketplace items
            // Information usually resides in a div with role="main" -> div -> div...
            // We will scan for any anchor tag that contains '/marketplace/item/'
            const links = Array.from(document.querySelectorAll('a[href*="/marketplace/item/"]'));

            links.forEach(link => {
                // Navigate up to find the container that holds price and title
                // This is heuristic and brittle.
                const container = link.closest('div[style*="border-radius"]') || link.parentElement;

                if (container) {
                    const textContent = container.innerText.split('\n');
                    // Heuristic: Price often starts with numbers or currency symbol
                    // Title is usually long text.

                    let price = textContent.find(t => t.match(/\d/));
                    let title = textContent.find(t => t.length > 10 && t !== price);

                    if (price && title) {
                        items.push({
                            title: title.trim(),
                            rawPrice: price.trim(),
                            link: link.href,
                            source: 'facebook'
                        });
                    }
                }
            });
            return items;
        });

        console.log(`[FB] Found ${listings.length} listings via scraper.`);

        if (listings.length > 0) {
            return listings.map(item => ({
                ...item,
                price: normalizePrice(item.rawPrice)
            })).filter(item => item.price !== null && item.price > 0).slice(0, limit);
        }

        console.log('[FB] No listings found. Throwing error to trigger fallback.');
        throw new Error('No listings found (blocked or empty). Triggers fallback.');

    } catch (error) {
        console.error('[FB] Scraping failed (likely blocked):', error.message);
        // Return empty array instead of mock data
        return [];
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { scrapeFacebook };
