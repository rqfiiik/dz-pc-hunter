const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');

chromium.use(stealth());

async function scrapeKouba(model) {
    let browser = null;
    try {
        console.log(`[Kouba] Launching browser for: ${model}`);
        browser = await chromium.launch({ headless: false });
        const page = await browser.newPage();

        // Kouba Computer Search URL: https://koubacomputer.store/?s=iphone+13&post_type=product
        const searchUrl = `https://koubacomputer.store/?s=${encodeURIComponent(model)}&post_type=product`;

        console.log(`[Kouba] Navigating to: ${searchUrl}`);
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Wait for product grid or "No products found" message
        try {
            await page.waitForSelector('.products, .woocommerce-info', { timeout: 15000 });
        } catch (e) {
            console.log('[Kouba] Timeout waiting for products. Likely 0 results.');
            await page.screenshot({ path: 'debug_kouba_timeout.png' });
            try {
                const content = await page.evaluate(() => document.body.innerText.substring(0, 500));
                console.log('[Kouba] Page Content Preview:', content);
            } catch (err) { }
            return [];
        }

        const listings = await page.evaluate(() => {
            const items = [];
            const productCards = document.querySelectorAll('.product');

            productCards.forEach(card => {
                const titleEl = card.querySelector('.woocommerce-loop-product__title');
                const priceEl = card.querySelector('.price');
                const linkEl = card.querySelector('a.woocommerce-LoopProduct-link');
                const imgEl = card.querySelector('img');

                if (titleEl && priceEl && linkEl) {
                    const title = titleEl.innerText.trim();
                    const link = linkEl.href;
                    // Price often has "Old Price" and "New Price" or just one. 
                    // We want the current effective price.
                    // Usually <ins> contains sale price, or just <span class="amount">
                    let rawPrice = priceEl.innerText.replace(/\n/g, ' ').trim();

                    // Simple parsing: Remove 'DZD', remove commas, take the last number if range
                    // e.g. "150,000 DZD" or "160,000 DZD 150,000 DZD"

                    items.push({
                        title,
                        link,
                        rawPrice,
                        source: 'kouba',
                        image: imgEl ? imgEl.src : null
                    });
                }
            });
            return items;
        });

        console.log(`[Kouba] Found ${listings.length} results.`);
        if (listings.length === 0) {
            console.log('[Kouba] 0 results found. Dumping HTML...');
            const html = await page.content();
            require('fs').writeFileSync('debug_kouba_source.html', html);
            await page.screenshot({ path: 'debug_kouba_empty.png', fullPage: true });
        }

        // Clean up prices
        return listings.map(item => {
            const priceReq = item.rawPrice.replace(/[^\d]/g, ''); // Extract all digits
            // If multiple prices, usually the last one is the sale price.
            // But this is risky if the string is messy.
            // Let's rely on a utility or simple parse for now.
            // Kouba format: "16,500,00 DA" -> 1650000 (cents?) or 16500?
            // Usually DZD sites use loose formatting. 
            // Let's try to find the largest meaningful number that looks like a price? 
            // Or just clean non-digits.

            // Allow external normalization or do it here.
            // Let's try to extract the last contiguous number group as likely price.
            const matches = item.rawPrice.match(/[\d,.]+/g);
            let price = 0;
            if (matches && matches.length > 0) {
                // take last match, remove non-digits
                const numStr = matches[matches.length - 1].replace(/[.,]/g, '');
                price = parseInt(numStr);
            }

            return {
                ...item,
                price: price || 0
            };
        }).filter(item => item.price > 0);

    } catch (error) {
        console.error('[Kouba] Scrape error:', error);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { scrapeKouba };
