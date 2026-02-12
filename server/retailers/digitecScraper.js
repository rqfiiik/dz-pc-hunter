const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');

chromium.use(stealth());

async function scrapeDigitec(model) {
    let browser = null;
    try {
        console.log(`[Digitec] Launching browser for: ${model}`);
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        // Digitec Search URL: https://digitecdz.com/?s=iphone+13&post_type=product
        // Similar structure to Kouba, likely WordPress/WooCommerce too.
        const searchUrl = `https://digitecdz.com/?s=${encodeURIComponent(model)}&post_type=product`;

        console.log(`[Digitec] Navigating to: ${searchUrl}`);
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        try {
            await page.waitForSelector('.products, .woocommerce-info', { timeout: 15000 });
        } catch (e) {
            console.log('[Digitec] Timeout waiting for products. Likely 0 results.');
            return [];
        }

        const listings = await page.evaluate(() => {
            const items = [];
            const productCards = document.querySelectorAll('.product');

            productCards.forEach(card => {
                const titleEl = card.querySelector('.woocommerce-loop-product__title, .product_title');
                const priceEl = card.querySelector('.price');
                const linkEl = card.querySelector('a.woocommerce-LoopProduct-link');
                const imgEl = card.querySelector('img');

                if (titleEl && priceEl && linkEl) {
                    const title = titleEl.innerText.trim();
                    const link = linkEl.href;
                    let rawPrice = priceEl.innerText.replace(/\n/g, ' ').trim();

                    items.push({
                        title,
                        link,
                        rawPrice,
                        source: 'digitec',
                        image: imgEl ? imgEl.src : null
                    });
                }
            });
            return items;
        });

        console.log(`[Digitec] Found ${listings.length} results.`);

        return listings.map(item => {
            const matches = item.rawPrice.match(/[\d,.]+/g);
            let price = 0;
            if (matches && matches.length > 0) {
                const numStr = matches[matches.length - 1].replace(/[.,]/g, '');
                price = parseInt(numStr);
            }

            return {
                ...item,
                price: price || 0
            };
        }).filter(item => item.price > 0);

    } catch (error) {
        console.error('[Digitec] Scrape error:', error);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { scrapeDigitec };
