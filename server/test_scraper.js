const { chromium } = require('playwright');

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true }); // Set to false to see the browser
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    const model = 'Lenovo ThinkPad'; // Test query
    const searchUrl = `https://www.ouedkniss.com/s/${encodeURIComponent(model)}`;

    console.log(`Navigating to: ${searchUrl}`);
    try {
        await page.goto(searchUrl, { waitUntil: 'commit', timeout: 60000 });
        console.log('Navigation committed. Waiting for body...');
        await page.waitForSelector('body', { timeout: 30000 });
    } catch (e) {
        console.log('Navigation error (might be partial load):', e.message);
    }

    console.log('Waiting for content...');
    try {
        // Wait for *some* content to load. 
        // Ouedkniss uses a dynamic loading mechanism.
        // Let's dump the page title to confirm we are there.
        const title = await page.title();
        console.log(`Page Title: ${title}`);

        // Try to identify listings container
        // Based on recent Ouedkniss structure, listings are often in a grid.
        // We'll search for common elements.

        // Take a screenshot for debugging (optional, but good for headless)
        // await page.screenshot({ path: 'debug_ouedkniss.png' });

        const listings = await page.evaluate(() => {
            const items = [];
            // Try different potential selectors for listings
            // Strategy: Find any element that looks like a listing card
            // Often has an image, a price, and a title.

            // Selector strategy 1: 'div.announcement'
            let cards = document.querySelectorAll('div.announcement');
            if (cards.length === 0) {
                // Strategy 2: Look for 'a' tags with specific classes or structures
                // Often linked cards.
                cards = document.querySelectorAll('div[data-cy="announcement"]');
            }
            if (cards.length === 0) {
                // Strategy 3: Generic grid items
                cards = document.querySelectorAll('.o-layout__item');
            }

            console.log(`Found ${cards.length} potential cards`);

            cards.forEach(card => {
                const titleEl = card.querySelector('h2, h3, [class*="title"]');
                const priceEl = card.querySelector('[class*="price"]');
                const linkEl = card.querySelector('a');

                if (titleEl && priceEl) {
                    items.push({
                        title: titleEl.innerText.trim(),
                        rawPrice: priceEl.innerText.trim(),
                        link: linkEl ? linkEl.href : window.location.href
                    });
                }
            });
            return items;
        });

        console.log(`Found ${listings.length} listings:`);
        console.log(JSON.stringify(listings, null, 2));

    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await browser.close();
    }
})();
